/**
 * Scripts, ported from hwplib's `object.Scripts`.
 * Holds the default JScript and its version, each stored as raw bytes.
 */
export class Scripts {
  private defaultJScript: Uint8Array | null;
  private jScriptVersion: Uint8Array | null;

  constructor() {
    this.defaultJScript = null;
    this.jScriptVersion = null;
  }

  getDefaultJScript(): Uint8Array | null {
    return this.defaultJScript;
  }

  setDefaultJScript(defaultJScript: Uint8Array | null): void {
    this.defaultJScript = defaultJScript;
  }

  getJScriptVersion(): Uint8Array | null {
    return this.jScriptVersion;
  }

  setJScriptVersion(jScriptVersion: Uint8Array | null): void {
    this.jScriptVersion = jScriptVersion;
  }

  copy(from: Scripts): void {
    this.defaultJScript = from.defaultJScript;
    this.jScriptVersion = from.jScriptVersion;
  }
}
