import type { CtrlData } from "../../../../../object/bodytext/control/bookmark/CtrlData.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParameterSet } from "./ForParameterSet.js";

/**
 * 임의 데이타 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForCtrlData {
  /**
   * 임의 데이터 레코드를 쓴다.
   *
   * @param cd 임의 데이터 레코드
   * @param sw 스크림 라이터
   */
  public static write(cd: CtrlData | null, sw: StreamWriter): void {
    if (cd === null) {
      return;
    }

    ForCtrlData.recordHeader(cd, sw);

    ForParameterSet.write(cd.getParameterSet(), sw);
  }

  /**
   * 임의 데이터 레코드의 레코드 헤더를 쓴다.
   *
   * @param cd 임의 데이터 레코드
   * @param sw 스크림 라이터
   */
  private static recordHeader(cd: CtrlData, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CTRL_DATA, ForCtrlData.getSize(cd));
  }

  /**
   * 임의 데이터 레코드의 크기를 반환한다.
   *
   * @param cd 임의 데이터 레코드
   * @return 임의 데이터 레코드의 크기
   */
  private static getSize(cd: CtrlData): number {
    return ForParameterSet.getSize(cd.getParameterSet());
  }
}
