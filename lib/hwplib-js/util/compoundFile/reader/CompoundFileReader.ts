import * as CFB from "cfb";
import type { FileVersion } from "../../../object/fileheader/FileVersion.js";
import { Compressor } from "../../binary/Compressor.js";
import { StreamReader } from "./StreamReader.js";

interface IndexedEntry {
  index: number;
  isStorage: boolean;
}

const toU8 = (blob: CFB.CFB$Blob): Uint8Array =>
  blob instanceof Uint8Array ? blob : Uint8Array.from(blob);

/**
 * Reads an OLE2/CFB compound file, exposing hwplib's `CompoundFileReader` navigation API
 * (a "current storage" cursor) on top of the `cfb` package — the drop-in replacement for the
 * bundled Apache POI POIFS layer.
 */
export class CompoundFileReader {
  private readonly cfb: CFB.CFB$Container;
  private readonly entries = new Map<string, IndexedEntry>();
  /** path segments of the current storage, below the root */
  private cwd: string[] = [];

  constructor(data: Uint8Array) {
    this.cfb = CFB.read(data, { type: "buffer" });
    const paths = this.cfb.FullPaths;
    for (let i = 0; i < paths.length; i++) {
      const full = paths[i]!;
      const slash = full.indexOf("/");
      if (slash < 0) continue; // the root entry itself
      let rel = full.substring(slash + 1);
      if (rel.length === 0) continue;
      const isStorage = rel.endsWith("/");
      if (isStorage) rel = rel.slice(0, -1);
      this.entries.set(rel, { index: i, isStorage });
    }
  }

  private key(name: string): string {
    return this.cwd.length === 0 ? name : `${this.cwd.join("/")}/${name}`;
  }

  private getEntry(name: string): IndexedEntry | undefined {
    return this.entries.get(this.key(name));
  }

  /** Names of the storages and streams directly under the current storage. */
  listChildNames(): string[] {
    const prefix = this.cwd.length === 0 ? "" : `${this.cwd.join("/")}/`;
    const names: string[] = [];
    for (const rel of this.entries.keys()) {
      if (!rel.startsWith(prefix)) continue;
      const remainder = rel.slice(prefix.length);
      if (remainder.length > 0 && !remainder.includes("/")) names.push(remainder);
    }
    return names;
  }

  isChildStorage(name: string): boolean {
    const e = this.getEntry(name);
    return e !== undefined && e.isStorage;
  }

  isChildStream(name: string): boolean {
    const e = this.getEntry(name);
    return e !== undefined && !e.isStorage;
  }

  moveChildStorage(name: string): void {
    const e = this.getEntry(name);
    if (e !== undefined && e.isStorage) {
      this.cwd.push(name);
    } else {
      throw new Error(`"${name}" is not a storage.`);
    }
  }

  moveParentStorage(): void {
    this.cwd.pop();
  }

  /** Raw (still compressed/encrypted) bytes of a stream under the current storage. */
  getChildStreamData(name: string): Uint8Array {
    const e = this.getEntry(name);
    if (e === undefined || e.isStorage) throw new Error(`"${name}" is not a stream.`);
    return toU8(this.cfb.FileIndex[e.index]!.content);
  }

  /**
   * Stream reader over a named stream. When `compress` is set the stream is DEFLATE-inflated
   * first; if inflation fails hwplib falls back to the raw bytes, and so do we.
   */
  getChildStreamReader(name: string, compress: boolean, fileVersion: FileVersion | null): StreamReader {
    let data = this.getChildStreamData(name);
    if (compress) {
      try {
        data = Compressor.decompress(data);
      } catch {
        // fall back to raw bytes, matching hwplib
      }
    }
    return new StreamReader(data, fileVersion);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChildStreamReaderForDistribution(_name: string, _compress: boolean, _fileVersion: FileVersion | null): StreamReader {
    // Distribution documents are AES-128-ECB encrypted after de-obfuscation. WebCrypto has no ECB
    // mode, so this path is deferred (see MIGRATION_PLAN hazards). Non-distribution docs never hit it.
    throw new Error("Distribution (encrypted) HWP documents are not supported yet.");
  }
}
