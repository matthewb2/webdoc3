import { BitFlag } from "../../../../util/binary/BitFlag.js";

/**
 * Java `(byte)` narrowing conversion: keep the low 8 bits, interpreted as signed.
 */
function toByte(value: number): number {
  return (value << 24) >> 24;
}

/**
 * 컨트롤 id을 생성하기 위한 객체
 *
 * @author neolord
 */
export class CtrlID {
  /**
   * 컨트롤 아이디를 생성한다.
   *
   * @param a 24~31 bit값
   * @param b 16~23 bit값
   * @param c 8~15 bit값
   * @param d 0~7 bit값
   * @return 컨트롤 아이디
   */
  static make(a: number, b: number, c: number, d: number): number;
  static make(id: number): number[];
  static make(a: number, b?: number, c?: number, d?: number): number | number[] {
    if (b === undefined) {
      const id = a;
      const ret: number[] = new Array<number>(4);
      ret[0] = BitFlag.getRange(id, 0, 7);
      ret[1] = BitFlag.getRange(id, 8, 15);
      ret[2] = BitFlag.getRange(id, 16, 23);
      ret[3] = BitFlag.getRange(id, 24, 31);
      return ret;
    }
    return (toByte(a) << 24) | (toByte(b) << 16) | (toByte(c as number) << 8) | toByte(d as number);
  }
}
