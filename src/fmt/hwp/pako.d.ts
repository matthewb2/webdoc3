declare module 'pako' {
  export function inflateRaw(data: Uint8Array): Uint8Array;
  export function inflate(data: Uint8Array, options?: { windowBits?: number }): Uint8Array;
  export function deflateRaw(data: Uint8Array): Uint8Array;
}
