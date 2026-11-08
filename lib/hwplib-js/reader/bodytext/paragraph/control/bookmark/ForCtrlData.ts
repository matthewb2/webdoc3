import type { CtrlData } from "../../../../../object/bodytext/control/bookmark/CtrlData.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";
import { ForParameterSet } from "./ForParameterSet.js";

/**
 * 임의 데이타 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForCtrlData {
  /**
   * 임의 데이터 객체를 읽는다.
   *
   * @param cd 임의 데이터 객체
   * @param sr 스트림 리더
   */
  public static read(cd: CtrlData, sr: StreamReader): void {
    ForParameterSet.read(cd.getParameterSet(), sr);
  }
}
