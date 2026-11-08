import { deflateSync, inflateSync } from "fflate";

/**
 * HWP stream (de)compression, ported from hwplib's `util.binary.Compressor`.
 *
 * HWP uses raw DEFLATE (Java `Deflater(level, nowrap=true)` / `Inflater(true)`), which maps to
 * fflate's `deflateSync`/`inflateSync` (both raw, no zlib header). On compress, hwplib appends an
 * 8-byte trailer — 4 zero bytes followed by the little-endian original length — which we replicate
 * byte-for-byte so writer output matches hwplib. Inflaters ignore the trailer on read.
 */
export const Compressor = {
  compress(original: Uint8Array): Uint8Array {
    const deflated = deflateSync(original);
    const out = new Uint8Array(deflated.length + 8);
    out.set(deflated, 0);
    // bytes [len..len+4) stay zero; [len+4..len+8) = original length, little-endian
    new DataView(out.buffer).setUint32(deflated.length + 4, original.length, true);
    return out;
  },

  /** Raw-inflate a compressed HWP stream. Trailing bytes past the DEFLATE stream are ignored. */
  decompress(data: Uint8Array): Uint8Array {
    return inflateSync(data);
  },
};
