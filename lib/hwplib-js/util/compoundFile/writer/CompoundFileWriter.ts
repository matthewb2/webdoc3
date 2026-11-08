import * as CFB from "cfb";
import type { FileVersion } from "../../../object/fileheader/FileVersion.js";
import { StreamWriter } from "./StreamWriter.js";

const toU8 = (blob: CFB.CFB$Blob): Uint8Array =>
  blob instanceof Uint8Array ? blob : Uint8Array.from(blob);

/**
 * Builds an OLE2/CFB compound file from named streams, the write-side counterpart to
 * CompoundFileReader. Replaces hwplib's POI-backed `CompoundFileWriter` with the `cfb`
 * package. Exposes hwplib's storage/stream cursor API (openCurrentStorage/openCurrentStream/…)
 * so the ported HWPWriter reads naturally, plus a direct addStream/write pair.
 * Intermediate storages are created implicitly from the stream path.
 */
export class CompoundFileWriter {
  private readonly cfb: CFB.CFB$Container = CFB.utils.cfb_new();
  private readonly storagePath: string[] = [];
  private currentStream: { path: string; sw: StreamWriter } | null = null;

  private childPath(name: string): string {
    return this.storagePath.length === 0 ? name : `${this.storagePath.join("/")}/${name}`;
  }

  /** Enter a storage (directory); subsequent streams are created under it. */
  openCurrentStorage(name: string): void {
    this.storagePath.push(name);
  }

  /** Leave the current storage. */
  closeCurrentStorage(): void {
    this.storagePath.pop();
  }

  /** Open a stream under the current storage and return a StreamWriter to fill. */
  openCurrentStream(name: string, compress: boolean, version: FileVersion | null): StreamWriter {
    const sw = new StreamWriter(name, compress, version);
    this.currentStream = { path: this.childPath(name), sw };
    return sw;
  }

  /** Finalize the stream opened by openCurrentStream, committing its bytes. */
  closeCurrentStream(): void {
    if (this.currentStream === null) return;
    this.addStream(this.currentStream.path, this.currentStream.sw.getData());
    this.currentStream = null;
  }

  /** Commit raw bytes as a stream under the current storage (e.g. summary information). */
  saveToStream(name: string, data: Uint8Array): void {
    this.addStream(this.childPath(name), data);
  }

  /** Add a stream at an absolute path such as `FileHeader` or `BodyText/Section0`. */
  addStream(path: string, data: Uint8Array): void {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    CFB.utils.cfb_add(this.cfb, normalized, data, { unsafe: true });
  }

  /** Serialize the container to CFB bytes. */
  write(): Uint8Array {
    return toU8(CFB.write(this.cfb, { type: "buffer", fileType: "cfb" }) as CFB.CFB$Blob);
  }
}
