import type { CharShape } from "../../object/docinfo/CharShape.js";
import type { CharOffsets } from "../../object/docinfo/charshape/CharOffsets.js";
import type { CharSpaces } from "../../object/docinfo/charshape/CharSpaces.js";
import type { FaceNameIds } from "../../object/docinfo/charshape/FaceNameIds.js";
import type { Ratios } from "../../object/docinfo/charshape/Ratios.js";
import type { RelativeSizes } from "../../object/docinfo/charshape/RelativeSizes.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { FileVersion } from "../../object/fileheader/FileVersion.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 글자 모양 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForCharShape {
  /**
   * 글자 모양 레코드를 쓴다.
   *
   * @param cs 글자 모양 레코드
   * @param sw 스트림 라이터
   */
  public static write(cs: CharShape, sw: StreamWriter): void {
    ForCharShape.recordHeader(sw);

    ForCharShape.faceNameIds(cs.getFaceNameIds(), sw);
    ForCharShape.ratios(cs.getRatios(), sw);
    ForCharShape.charSpaces(cs.getCharSpaces(), sw);
    ForCharShape.relativeSizes(cs.getRelativeSizes(), sw);
    ForCharShape.charPositions(cs.getCharOffsets(), sw);

    sw.writeSInt4(cs.getBaseSize());
    sw.writeUInt4(cs.getProperty().getValue());
    sw.writeSInt1(cs.getShadowGap1());
    sw.writeSInt1(cs.getShadowGap2());
    sw.writeUInt4(cs.getCharColor().getValue());
    sw.writeUInt4(cs.getUnderLineColor().getValue());
    sw.writeUInt4(cs.getShadeColor().getValue());
    sw.writeUInt4(cs.getShadowColor().getValue());

    if (sw.getFileVersion()!.isOver(5, 0, 2, 1)) {
      sw.writeUInt2(cs.getBorderFillId());
    }
    if (sw.getFileVersion()!.isOver(5, 0, 3, 0)) {
      sw.writeUInt4(cs.getStrikeLineColor().getValue());
    }
  }

  /**
   * 글자 모양 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.CHAR_SHAPE, ForCharShape.getSize(sw.getFileVersion()!));
  }

  /**
   * 글자 모양 레코드의 크기를 반환한다.
   *
   * @param version 파일 버전
   * @return 글자 모양 레코드의 크기
   */
  private static getSize(version: FileVersion): number {
    let size = 0;
    size += 14 + 7 + 7 + 7 + 7;
    size += 26;
    if (version.isOver(5, 0, 2, 1)) {
      size += 2;
    }
    if (version.isOver(5, 0, 3, 0)) {
      size += 4;
    }
    return size;
  }

  private static faceNameIds(fni: FaceNameIds, sw: StreamWriter): void {
    for (const faceNameId of fni.getArray()) {
      sw.writeUInt2(faceNameId);
    }
  }

  private static ratios(ratios: Ratios, sw: StreamWriter): void {
    for (const ratio of ratios.getArray()) {
      sw.writeUInt1(ratio);
    }
  }

  private static charSpaces(charSpaces: CharSpaces, sw: StreamWriter): void {
    for (const charSpace of charSpaces.getArray()) {
      sw.writeSInt1(charSpace);
    }
  }

  private static relativeSizes(rss: RelativeSizes, sw: StreamWriter): void {
    for (const rs of rss.getArray()) {
      sw.writeUInt1(rs);
    }
  }

  private static charPositions(cos: CharOffsets, sw: StreamWriter): void {
    for (const co of cos.getArray()) {
      sw.writeSInt1(co);
    }
  }
}
