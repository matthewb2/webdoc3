/**
 * De-obfuscation of HWP "distribution" document headers, ported from hwplib's
 * `util.binary.Obfuscation`.
 *
 * Uses the MS C runtime LCG (`seed = seed * 214013 + 2531011`). hwplib runs this on a Java `int`,
 * so overflow wraps mod 2^32 with sign preserved; the `& 0xFFFFFFFF` in the Java source is a no-op
 * (`x & -1`). We reproduce that exactly with `Math.imul` + `| 0`, so `>> 16` then behaves as the
 * Java arithmetic shift on a signed 32-bit int.
 */
class Rng {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed | 0;
  }

  private rand(): number {
    this.seed = (Math.imul(this.seed, 214013) + 2531011) | 0;
    return (this.seed >> 16) & 0x7fff;
  }

  value(): number {
    return this.rand() & 0xff;
  }

  number(): number {
    return (this.rand() & 0xf) + 1;
  }
}

/** In-place de-obfuscate a 256-byte distribution-document data block (no-op unless length is 256). */
export function transform(data: Uint8Array): void {
  if (data.length !== 256) return;

  const seed = new DataView(data.buffer, data.byteOffset, 4).getInt32(0, true);
  const rng = new Rng(seed);

  let value = 0;
  let number = 0;
  for (let i = 0; i < data.length; i++) {
    if (number === 0) {
      value = rng.value();
      number = rng.number();
    }
    if (i >= 4) {
      data[i] = (data[i]! ^ value) & 0xff;
    }
    number--;
  }
}

export const Obfuscation = { transform };
