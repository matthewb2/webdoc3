import type { Numbering } from "../../object/docinfo/Numbering.js";
import type { LevelNumbering } from "../../object/docinfo/numbering/LevelNumbering.js";
import type { ParagraphHeadInfo } from "../../object/docinfo/numbering/ParagraphHeadInfo.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { FileVersion } from "../../object/fileheader/FileVersion.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 문단 번호 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForNumbering {
  /**
   * 문단 번호 레코드를 쓴다.
   *
   * @param n  문단 번호 레코드
   * @param sw 스트림 라이터
   */
  public static write(n: Numbering, sw: StreamWriter): void {
    ForNumbering.recordHeader(n, sw);

    ForNumbering.levelNumberings1To7(n, sw);
    sw.writeUInt2(n.getStartNumber());
    if (sw.getFileVersion()!.isOver(5, 0, 2, 5)) {
      ForNumbering.startNumbersFor1To7(n, sw);

      ForNumbering.levelNumberings8To10(n, sw);
      ForNumbering.startNumbersFor8To10(n, sw);
    }
  }

  /**
   * 문단 번호 레코드의 레코드 헤더를 쓴다.
   *
   * @param n  문단 번호 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(n: Numbering, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.NUMBERING, ForNumbering.getSize(n, sw.getFileVersion()!));
  }

  /**
   * 문단 번호 레코드의 크기를 반환한다.
   *
   * @param n       문단 번호 레코드
   * @param version 파일 버전
   * @return 문단 번호 레코드의 크기
   */
  private static getSize(n: Numbering, version: FileVersion): number {
    let size = 0;
    for (let level = 1; level <= 7; level++) {
      const ln = n.getLevelNumbering(level);
      size += 12 + ln.getNumberFormat().getWCharsSize();
    }
    size += 2;
    if (version.isOver(5, 0, 2, 5)) {
      size += 4 * 7;

      for (let level = 8; level <= 10; level++) {
        const ln = n.getLevelNumbering(level);
        size += 12 + ln.getNumberFormat().getWCharsSize();
      }
      size += 4 * 3;
    }
    return size;
  }

  /**
   * 1-7 수준에 해당하는 문단 번호 정보 부분을 쓴다.
   *
   * @param n  문단 번호 레코드
   * @param sw 스트림 라이터
   */
  private static levelNumberings1To7(n: Numbering, sw: StreamWriter): void {
    for (let level = 1; level <= 7; level++) {
      ForNumbering.levelNumbering(n.getLevelNumbering(level), sw);
    }
  }

  /**
   * 하나의 레벨에 해당하는 문단 번호 정보을 쓴다.
   *
   * @param ln 하나의 레벨에 해당하는 문단 번호 정보
   * @param sw 스트림 라이터
   */
  private static levelNumbering(ln: LevelNumbering, sw: StreamWriter): void {
    ForNumbering.paragraphHeadInfo(ln.getParagraphHeadInfo(), sw);
    sw.writeHWPString(ln.getNumberFormat());
  }

  /**
   * 문단 머리 정보 부분을 쓴다.
   *
   * @param phi 문단 머리 정보
   * @param sw  스트림 라이터
   */
  public static paragraphHeadInfo(phi: ParagraphHeadInfo, sw: StreamWriter): void {
    sw.writeUInt4(phi.getProperty().getValue());
    sw.writeUInt2(phi.getCorrectionValueForWidth());
    sw.writeUInt2(phi.getDistanceFromBody());
    sw.writeUInt4(phi.getCharShapeID());
  }

  /**
   * 1-7 수준의 시작번호을 쓴다.
   *
   * @param n  문단 번호 레코드
   * @param sw 스트림 라이터
   */
  private static startNumbersFor1To7(n: Numbering, sw: StreamWriter): void {
    for (let level = 1; level <= 7; level++) {
      sw.writeUInt4(n.getLevelNumbering(level).getStartNumber());
    }
  }

  /**
   * 8-10 수준에 해당하는 문단 번호 정보 부분을 쓴다.
   *
   * @param n  문단 번호 레코드
   * @param sw 스트림 라이터
   */
  private static levelNumberings8To10(n: Numbering, sw: StreamWriter): void {
    for (let level = 8; level <= 10; level++) {
      ForNumbering.levelNumbering(n.getLevelNumbering(level), sw);
    }
  }

  /**
   * 8-10 수준의 시작번호을 쓴다.
   *
   * @param n  문단 번호 레코드
   * @param sw 스트림 라이터
   */
  private static startNumbersFor8To10(n: Numbering, sw: StreamWriter): void {
    for (let level = 8; level <= 10; level++) {
      sw.writeUInt4(n.getLevelNumbering(level).getStartNumber());
    }
  }
}
