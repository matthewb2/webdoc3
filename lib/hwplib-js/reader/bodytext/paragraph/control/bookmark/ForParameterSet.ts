import type { ParameterItem } from "../../../../../object/bodytext/control/bookmark/ParameterItem.js";
import type { ParameterSet } from "../../../../../object/bodytext/control/bookmark/ParameterSet.js";
import { ParameterType } from "../../../../../object/bodytext/control/bookmark/ParameterType.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 파라메터 셋을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForParameterSet {
  /**
   * 파라메터 셋을 읽는다.
   *
   * @param ps 파라메터 셋
   * @param sr 스트림 리더
   */
  public static read(ps: ParameterSet, sr: StreamReader): void {
    ps.setId(sr.readUInt2());
    const parameterCount = sr.readSInt2();
    sr.skip(2);
    for (let parameterIndex = 0; parameterIndex < parameterCount; parameterIndex++) {
      const pi = ps.addNewParameterItem();
      ForParameterSet.parameterItem(pi, sr);
    }
  }

  /**
   * 파라메터 아이템을 읽는다.
   *
   * @param pi 파라메터 아이템
   * @param sr 스트림 리더
   */
  private static parameterItem(pi: ParameterItem, sr: StreamReader): void {
    pi.setId(sr.readUInt2());
    pi.setType(ParameterType.valueOf(sr.readUInt2()));
    ForParameterSet.paramterValue(pi, sr);
  }

  /**
   * 파라메터 아이템의 값을 읽는다.
   *
   * @param pi 파라메터 아이템
   * @param sr 스트림 리더
   */
  private static paramterValue(pi: ParameterItem, sr: StreamReader): void {
    switch (pi.getType()) {
      case ParameterType.NULL:
        break;
      case ParameterType.String:
        pi.setValue_BSTR(sr.readUTF16LEString());
        break;
      case ParameterType.Integer1:
        pi.setValue_I1(sr.readSInt4());
        break;
      case ParameterType.Integer2:
        pi.setValue_I2(sr.readSInt4());
        break;
      case ParameterType.Integer4:
        pi.setValue_I4(sr.readSInt4());
        break;
      case ParameterType.Integer:
        pi.setValue_I(sr.readSInt4());
        break;
      case ParameterType.UnsignedInteger1:
        pi.setValue_UI1(sr.readUInt4());
        break;
      case ParameterType.UnsignedInteger2:
        pi.setValue_UI2(sr.readUInt4());
        break;
      case ParameterType.UnsignedInteger4:
        pi.setValue_UI4(sr.readUInt4());
        break;
      case ParameterType.UnsignedInteger:
        pi.setValue_UI(sr.readUInt4());
        break;
      case ParameterType.ParameterSet:
        ForParameterSet.parameterSet(pi, sr);
        break;
      case ParameterType.Array:
        ForParameterSet.parameterArray(pi, sr);
        break;
      case ParameterType.BINDataID:
        pi.setValue_binData(sr.readUInt2());
        break;
    }
  }

  /**
   * 파라미터셋 타입의 파라메터 아이템값을 읽는다.
   *
   * @param pi 파라메터 아이템
   * @param sr 스트림 리더
   */
  private static parameterSet(pi: ParameterItem, sr: StreamReader): void {
    pi.createValue_ParameterSet();
    ForParameterSet.read(pi.getValue_ParameterSet()!, sr);
  }

  /**
   * 배열 타입의 파라메터 아이템값을 읽는다.
   *
   * @param pi 파라메터 아이템
   * @param sr 스트림 리더
   */
  private static parameterArray(pi: ParameterItem, sr: StreamReader): void {
    const count = sr.readSInt2();
    if (count > 0) {
      pi.createValue_ParameterArray(count);
      const id = sr.readUInt2();
      for (let index = 0; index < count; index++) {
        ForParameterSet.parameterItemForArray(pi.getValue_ParameterArray(index)!, sr, id);
      }
    }
  }

  /**
   * 배열안에 파라메터 아이템을 읽는다.
   *
   * @param pi 파라메터 아이템
   * @param sr 스트림 리더
   * @param id 파라메터 아이템의 아이디
   */
  private static parameterItemForArray(pi: ParameterItem, sr: StreamReader, id: number): void {
    pi.setId(id);
    pi.setType(ParameterType.valueOf(sr.readUInt2()));
    ForParameterSet.paramterValue(pi, sr);
  }
}
