/**
 * String helpers, ported from hwplib's `util.StringUtil`.
 * (The Apache-derived `replaceEach` is only used by the converter layer and is ported there.)
 */

/** Number of bytes a UTF-16LE string field occupies on disk: 2 (length) + 2 per code unit. */
export function getUTF16LEStringSize(s: string | null): number {
  return s === null ? 2 : 2 + s.length * 2;
}

const HEX = "0123456789ABCDEF";

/** Space-separated uppercase hex dump of a byte array (matches hwplib's `bytesToHex`). */
export function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) {
    out += HEX[b >>> 4]! + HEX[b & 0x0f]! + " ";
  }
  return out;
}

export function equals(a: string | null, b: string | null): boolean {
  return a === null ? b === null : a === b;
}

export function isEmpty(s: string | null | undefined): boolean {
  return s === null || s === undefined || s.length === 0;
}

export const StringUtil = { getUTF16LEStringSize, bytesToHex, equals, isEmpty };
