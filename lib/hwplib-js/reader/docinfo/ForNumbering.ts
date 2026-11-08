import type { Numbering } from "../../object/docinfo/Numbering.js";
import type { LevelNumbering } from "../../object/docinfo/numbering/LevelNumbering.js";
import type { ParagraphHeadInfo } from "../../object/docinfo/numbering/ParagraphHeadInfo.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 문단 번호 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForNumbering {
  /**
   * 문단 번호 레코드를 읽는다.
   *
   * @param n  문단 번호 레코드
   * @param sr 스트림 리더
   */
  public static read(n: Numbering, sr: StreamReader): void {
    ForNumbering.levelNumberingsFor1To7(n, sr);
    n.setStartNumber(sr.readUInt2());

    if (sr.isEndOfRecord() === false && sr.getFileVersion()!.isOver(5, 0, 2, 5)) {
      ForNumbering.startNumbersFor1To7(n, sr);
    }

    if (sr.isEndOfRecord()) return;

    ForNumbering.levelNumberingsFor8To10(n, sr);
    ForNumbering.startNumbersFor8To10(n, sr);
  }

  /**
   * 1～7 수준에 해당하는 문단 번호 정보 부분을 읽는다.
   *
   * @param n  문단 번호 레코드
   * @param sr 스트림 리더
   */
  private static levelNumberingsFor1To7(n: Numbering, sr: StreamReader): void {
    for (let level = 1; level <= 7; level++) {
      ForNumbering.levelNumbering(n.getLevelNumbering(level), sr);
    }
  }

  /**
   * 하나의 레벨에 해당하는 문단 번호 정보을 읽는다.
   *
   * @param ln 하나의 레벨에 해당하는 문단 번호 정보
   * @param sr 스트림 리더
   */
  private static levelNumbering(ln: LevelNumbering, sr: StreamReader): void {
    ForNumbering.paragraphHeadInfo(ln.getParagraphHeadInfo(), sr);
    ln.getNumberFormat().setBytes(sr.readHWPString());
  }

  /**
   * 문단 머리 정보 부분을 읽는다.
   *
   * @param phi 문단 머리 정보 부분을 나타내는 객체
   * @param sr  스트림 리더
   */
  public static paragraphHeadInfo(phi: ParagraphHeadInfo, sr: StreamReader): void {
    phi.getProperty().setValue(sr.readUInt4());
    phi.setCorrectionValueForWidth(sr.readUInt2());
    phi.setDistanceFromBody(sr.readUInt2());
    phi.setCharShapeID(sr.readUInt4());
  }

  /**
   * 1～7 수준의 시작번호 부분을 읽는다.
   *
   * @param n  문단 번호 레코드
   * @param sr 스트림 리더
   */
  private static startNumbersFor1To7(n: Numbering, sr: StreamReader): void {
    for (let level = 1; level <= 7; level++) {
      n.getLevelNumbering(level).setStartNumber(sr.readUInt4());
    }
  }

  /**
   * 8～10 수준에 해당하는 문단 번호 정보 부분을 읽는다.
   *
   * @param n  문단 번호 레코드
   * @param sr 스트림 리더
   */
  private static levelNumberingsFor8To10(n: Numbering, sr: StreamReader): void {
    for (let level = 8; level <= 10; level++) {
      ForNumbering.levelNumbering(n.getLevelNumbering(level), sr);
    }
  }

  /**
   * 8～10 수준의 시작번호 부분을 읽는다.
   *
   * @param n  문단 번호 레코드
   * @param sr 스트림 리더
   */
  private static startNumbersFor8To10(n: Numbering, sr: StreamReader): void {
    for (let level = 8; level <= 10; level++) {
      n.getLevelNumbering(level).setStartNumber(sr.readUInt4());
    }
  }
}
