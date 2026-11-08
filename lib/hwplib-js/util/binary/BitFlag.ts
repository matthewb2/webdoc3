/**
 * Bit operations, ported from hwplib's `util.binary.BitFlag`.
 *
 * hwplib operates on Java `long`/`int`/`short` masks. In JS, bitwise operators coerce to
 * 32-bit signed integers, which corrupts values with bit 31 set (record headers and UInt4
 * flag fields both exceed 2^31). We therefore implement get/set with safe integer arithmetic,
 * which is exact for any non-negative mask up to 2^53. HWP masks are always non-negative
 * (they come from unsigned reads or are built up from 0).
 */

/** Whether bit `position` of `mask` is set. */
export function get(mask: number, position: number): boolean {
  return Math.floor(mask / 2 ** position) % 2 === 1;
}

/** The unsigned integer value of bits `start..end` (inclusive) of `mask`. */
export function getRange(mask: number, start: number, end: number): number {
  return Math.floor(mask / 2 ** start) % 2 ** (end - start + 1);
}

/** `mask` with bit `position` set to `flag`. */
export function set(mask: number, position: number, flag: boolean): number {
  const has = get(mask, position);
  if (flag && !has) return mask + 2 ** position;
  if (!flag && has) return mask - 2 ** position;
  return mask;
}

/** `mask` with bits `start..end` (inclusive) set to the low bits of `value`. */
export function setRange(mask: number, start: number, end: number, value: number): number {
  for (let position = start; position <= end; position++) {
    mask = set(mask, position, get(value, position - start));
  }
  return mask;
}

export const BitFlag = { get, getRange, set, setRange };
