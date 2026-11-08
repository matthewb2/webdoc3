import type { ParameterItem } from "../../../../../object/bodytext/control/bookmark/ParameterItem.js";
import type { ParameterSet } from "../../../../../object/bodytext/control/bookmark/ParameterSet.js";
import { ParameterType } from "../../../../../object/bodytext/control/bookmark/ParameterType.js";
import { StringUtil } from "../../../../../util/StringUtil.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 파라미터 셋을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParameterSet {
  /**
   * 파라미터 셋의 크기를 반환한다.
   *
   * @param ps 파라미터 셋
   * @return 파라미터 셋의 크기
   */
  public static getSize(ps: ParameterSet | null): number {
    let size = 0;
    if (ps !== null) {
      size += 6;
      for (const pi of ps.getParameterItemList()) {
        size += ForParameterSet.getSizeForParameterItem(pi);
      }
    } else {
      size = 0;
    }
    return size;
  }

  /**
   * 파라미터 아이탬의 크기를 반환한다.
   *
   * @param pi 파라미터 아이탬
   * @return 파라미터 아이탬의 크기
   */
  private static getSizeForParameterItem(pi: ParameterItem): number {
    let size = 0;
    size += 4;
    switch (pi.getType()) {
      case ParameterType.NULL:
        break;
      case ParameterType.String:
        size += StringUtil.getUTF16LEStringSize(pi.getValue_BSTR());
        break;
      case ParameterType.Integer1:
        size += 4;
        break;
      case ParameterType.Integer2:
        size += 4;
        break;
      case ParameterType.Integer4:
        size += 4;
        break;
      case ParameterType.Integer:
        size += 4;
        break;
      case ParameterType.UnsignedInteger1:
        size += 4;
        break;
      case ParameterType.UnsignedInteger2:
        size += 4;
        break;
      case ParameterType.UnsignedInteger4:
        size += 4;
        break;
      case ParameterType.UnsignedInteger:
        size += 4;
        break;
      case ParameterType.ParameterSet:
        size += ForParameterSet.getSize(pi.getValue_ParameterSet());
        break;
      case ParameterType.Array:
        size += ForParameterSet.getSizeForParameterArray(pi);
        break;
      case ParameterType.BINDataID:
        size += 2;
        break;
    }

    return size;
  }

  /**
   * 배열 파라미터 아이탬의 크기를 반환한다.
   *
   * @param pi 배열 파라미터 아이탬
   * @return 배열 파라미터 아이탬의 크기
   */
  private static getSizeForParameterArray(pi: ParameterItem): number {
    let size = 0;
    size += 4;
    const count = pi.getValue_ParameterArrayCount();
    for (let index = 0; index < count; index++) {
      size += ForParameterSet.getSizeForParameterItem(pi.getValue_ParameterArray(index)!) - 2;
    }
    return size;
  }

  /**
   * 파라미터 셋를 쓴다.
   *
   * @param ps 파라미터 셋
   * @param sw 스트림 라이터
   */
  public static write(ps: ParameterSet, sw: StreamWriter): void {
    sw.writeUInt2(ps.getId());
    const parameterCount = ps.getParameterItemList().length;
    sw.writeSInt2(parameterCount);
    sw.writeZero(2);
    for (const pi of ps.getParameterItemList()) {
      ForParameterSet.parameterItem(pi, sw);
    }
  }

  /**
   * 파라미터 아이탬을 쓴다.
   *
   * @param pi 파라미터 아이탬
   * @param sw 스트림 라이터
   */
  private static parameterItem(pi: ParameterItem, sw: StreamWriter): void {
    sw.writeUInt2(pi.getId());
    sw.writeUInt2(pi.getType());
    ForParameterSet.paramterValue(pi, sw);
  }

  /**
   * 파라미터 아이탬의 값을 쓴다.
   *
   * @param pi 파라미터 아이탬
   * @param sw 스트림 라이터
   */
  private static paramterValue(pi: ParameterItem, sw: StreamWriter): void {
    switch (pi.getType()) {
      case ParameterType.NULL:
        break;
      case ParameterType.String:
        sw.writeUTF16LEString(pi.getValue_BSTR());
        break;
      case ParameterType.Integer1:
        sw.writeSInt4(pi.getValue_I1());
        break;
      case ParameterType.Integer2:
        sw.writeSInt4(pi.getValue_I2());
        break;
      case ParameterType.Integer4:
        sw.writeSInt4(pi.getValue_I4());
        break;
      case ParameterType.Integer:
        sw.writeSInt4(pi.getValue_I());
        break;
      case ParameterType.UnsignedInteger1:
        sw.writeUInt4(pi.getValue_UI1());
        break;
      case ParameterType.UnsignedInteger2:
        sw.writeUInt4(pi.getValue_UI2());
        break;
      case ParameterType.UnsignedInteger4:
        sw.writeUInt4(pi.getValue_UI4());
        break;
      case ParameterType.UnsignedInteger:
        sw.writeUInt4(pi.getValue_UI());
        break;
      case ParameterType.ParameterSet:
        ForParameterSet.write(pi.getValue_ParameterSet()!, sw);
        break;
      case ParameterType.Array:
        ForParameterSet.parameterArray(pi, sw);
        break;
      case ParameterType.BINDataID:
        sw.writeUInt2(pi.getValue_binData());
        break;
    }
  }

  /**
   * 배열 파라미터 아이탬의 값을 쓴다.
   *
   * @param pi 배열 파라미터 아이탬
   * @param sw 스트림 라이터
   */
  private static parameterArray(pi: ParameterItem, sw: StreamWriter): void {
    const count = pi.getValue_ParameterArrayCount();
    sw.writeSInt2(count);
    if (count > 0) {
      sw.writeUInt2(pi.getValue_ParameterArray(0)!.getId());

      for (let index = 0; index < count; index++) {
        const elementPi = pi.getValue_ParameterArray(index)!;
        sw.writeUInt2(elementPi.getType());
        ForParameterSet.paramterValue(elementPi, sw);
      }
    }
  }
}
