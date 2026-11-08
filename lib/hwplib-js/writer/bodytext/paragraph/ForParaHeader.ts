import type { ParaHeader } from "../../../object/bodytext/paragraph/header/ParaHeader.js";
import { HWPTag } from "../../../object/etc/HWPTag.js";
import type { FileVersion } from "../../../object/fileheader/FileVersion.js";
import type { StreamWriter } from "../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 문단 헤더 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParaHeader {
  /**
   * 문단 헤더 레코드를 쓴다.
   *
   * @param ph 문단 헤더 레코드
   * @param sw 스트림 라이터
   */
  public static write(ph: ParaHeader, sw: StreamWriter): void {
    ForParaHeader.recordHeader(ph, sw);

    ForParaHeader.lastInList_TextCount(ph, sw);
    sw.writeUInt4(ph.getControlMask().getValue());
    sw.writeUInt2(sw.correctParaShapeId(ph.getParaShapeId()));
    sw.writeUInt1(ph.getStyleId());
    sw.writeUInt1(ph.getDivideSort().getValue());
    sw.writeUInt2(ph.getCharShapeCount());
    sw.writeUInt2(ph.getRangeTagCount());
    sw.writeUInt2(ph.getLineAlignCount());
    sw.writeUInt4(ph.getInstanceID());
    if (sw.getFileVersion()!.isOver(5, 0, 3, 2)) {
      sw.writeUInt2(ph.getIsMergedByTrack());
    }
  }

  /**
   * 문단 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param ph 문단 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(ph: ParaHeader, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.PARA_HEADER, ForParaHeader.getSize(sw.getFileVersion()!));
  }

  /**
   * 문단 헤더 레코드의 크기를 반환한다.
   *
   * @param version 파일 버전
   * @return 문단 헤더 레코드의 크기
   */
  private static getSize(version: FileVersion): number {
    let size = 0;
    size += 22;
    if (version.isOver(5, 0, 3, 2)) {
      size += 2;
    }
    return size;
  }

  /**
   * 문단 리스트에서 마지막 문단여부와 문자수를 쓴다.
   *
   * @param ph 문단 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static lastInList_TextCount(ph: ParaHeader, sw: StreamWriter): void {
    let value = 0;
    if (ph.isLastInList()) {
      value += 0x80000000;
    }
    value += ph.getCharacterCount() & 0x7fffffff;
    sw.writeUInt4(value);
  }
}
