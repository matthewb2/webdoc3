import type { ParaShape } from "../../object/docinfo/ParaShape.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { FileVersion } from "../../object/fileheader/FileVersion.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 문단 모양 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParaShape {
  /**
   * 문단 모양 레코드를 쓴다.
   *
   * @param ps 문단 모양 레코드
   * @param sw 스트림 라이터
   */
  public static write(ps: ParaShape, sw: StreamWriter): void {
    ForParaShape.recordHeader(ps, sw);

    sw.writeUInt4(ps.getProperty1().getValue());
    sw.writeSInt4(ps.getLeftMargin());
    sw.writeSInt4(ps.getRightMargin());
    sw.writeSInt4(ps.getIndent());
    sw.writeSInt4(ps.getTopParaSpace());
    sw.writeSInt4(ps.getBottomParaSpace());
    sw.writeSInt4(ps.getLineSpace());
    sw.writeUInt2(ps.getTabDefId());
    sw.writeUInt2(ps.getParaHeadId());
    sw.writeUInt2(ps.getBorderFillId());
    sw.writeSInt2(ps.getLeftBorderSpace());
    sw.writeSInt2(ps.getRightBorderSpace());
    sw.writeSInt2(ps.getTopBorderSpace());
    sw.writeSInt2(ps.getBottomBorderSpace());
    if (sw.getFileVersion()!.isOver(5, 0, 1, 7)) {
      sw.writeUInt4(ps.getProperty2().getValue());
    }
    if (sw.getFileVersion()!.isOver(5, 0, 2, 5)) {
      sw.writeUInt4(ps.getProperty3().getValue());
      sw.writeUInt4(ps.getLineSpace2());
    }
    if (sw.getFileVersion()!.isOver(5, 0, 255, 255)) {
      sw.writeUInt4(ps.getParaLevel());
    }
  }

  /**
   * 문단 모양 레코드의 레코드 헤더를 쓴다.
   *
   * @param ps 문단 모양 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(ps: ParaShape, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.PARA_SHAPE, ForParaShape.getSize(sw.getFileVersion()!));
  }

  /**
   * 문단 모양 레코드의 크기를 반환한다.
   *
   * @param version 파일 버전
   * @return 문단 모양 레코드의 크기
   */
  private static getSize(version: FileVersion): number {
    let size = 0;
    size += 42;
    if (version.isOver(5, 0, 1, 7)) {
      size += 4;
    }
    if (version.isOver(5, 0, 2, 5)) {
      size += 8;
    }
    if (version.isOver(5, 0, 255, 255)) {
      size += 4;
    }

    return size;
  }
}
