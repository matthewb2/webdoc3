import type { BorderFill } from "../../object/docinfo/BorderFill.js";
import type { BorderFillProperty } from "../../object/docinfo/borderfill/BorderFillProperty.js";
import { BorderThickness } from "../../object/docinfo/borderfill/BorderThickness.js";
import { BorderType } from "../../object/docinfo/borderfill/BorderType.js";
import type { EachBorder } from "../../object/docinfo/borderfill/EachBorder.js";
import type { FillInfo } from "../../object/docinfo/borderfill/fillinfo/FillInfo.js";
import { ForFillInfo } from "./borderfill/ForFillInfo.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 테두리/배경 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForBorderFill {
  /**
   * 테두리/배경 레코드를 읽는다.
   *
   * @param bf 테두리/배경 레코드
   * @param sr 스트림 리더
   */
  public static read(bf: BorderFill, sr: StreamReader): void {
    ForBorderFill.property(bf.getProperty(), sr);
    ForBorderFill.eachBorder(bf.getLeftBorder(), sr);
    ForBorderFill.eachBorder(bf.getRightBorder(), sr);
    ForBorderFill.eachBorder(bf.getTopBorder(), sr);
    ForBorderFill.eachBorder(bf.getBottomBorder(), sr);
    ForBorderFill.eachBorder(bf.getDiagonalBorder(), sr);
    ForBorderFill.fillInfo(bf.getFillInfo(), sr);
  }

  /**
   * 속성 부분을 읽는다.
   *
   * @param p  테두리/배경 속성 부분 객체
   * @param sr 스트림 리더
   */
  private static property(p: BorderFillProperty, sr: StreamReader): void {
    p.setValue(sr.readUInt2());
  }

  /**
   * 4방향의 테두리/대각선를 표현하는 각각의 선를 읽는다.
   *
   * @param eb 4방향의 테두리/대각선를 표현하는 각각 선 객체
   * @param sr 스트림 리더
   */
  private static eachBorder(eb: EachBorder, sr: StreamReader): void {
    eb.setType(BorderType.valueOf(sr.readUInt1()));
    eb.setThickness(BorderThickness.valueOf(sr.readUInt1()));
    eb.getColor().setValue(sr.readUInt4());
  }

  /**
   * 배경 정보을 읽는다.
   *
   * @param fi 배경 정보 객체
   * @param sr 스트림 리더
   */
  private static fillInfo(fi: FillInfo, sr: StreamReader): void {
    ForFillInfo.read(fi, sr);
  }
}
