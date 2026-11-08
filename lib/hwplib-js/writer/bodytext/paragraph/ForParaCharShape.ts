import type { CharPositionShapeIdPair } from "../../../object/bodytext/paragraph/charshape/CharPositionShapeIdPair.js";
import type { ParaCharShape } from "../../../object/bodytext/paragraph/charshape/ParaCharShape.js";
import { HWPTag } from "../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 문단의 글자 모양 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParaCharShape {
  /**
   * 문단의 글자 모양 레코드를 쓴다.
   *
   * @param pcs 문단의 글자 모양 레코드
   * @param sw  스트림 라이터
   */
  public static write(pcs: ParaCharShape | null, sw: StreamWriter): void {
    if (pcs === null) {
      return;
    }

    ForParaCharShape.recordHeader(pcs, sw);

    for (const cpsip of pcs.getPositonShapeIdPairList()) {
      ForParaCharShape.charPositonShapeIdPair(cpsip, sw);
    }
  }

  /**
   * 문단의 글자 모양 레코드의 레코드 헤더를 쓴다.
   *
   * @param pcs 문단의 글자 모양 레코드의 레코드 헤더
   * @param sw  스트림 라이터
   */
  private static recordHeader(pcs: ParaCharShape, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.PARA_CHAR_SHAPE, ForParaCharShape.getSize(pcs));
  }

  /**
   * 문단 글자 모양 레코드의 크기를 반환한다.
   *
   * @param pcs 문단 글자 모양 레코드
   * @return 문단 글자 모양 레코드의 크기
   */
  private static getSize(pcs: ParaCharShape): number {
    return pcs.getPositonShapeIdPairList().length * 8;
  }

  /**
   * 글자 모양 위치/글자 모양 아이디의 쌍을 쓴다.
   *
   * @param cpsip 글자 모양 위치/글자 모양 아이디의 쌍
   * @param sw    스트림 라이터
   */
  private static charPositonShapeIdPair(cpsip: CharPositionShapeIdPair, sw: StreamWriter): void {
    sw.writeUInt4(cpsip.getPosition());
    sw.writeUInt4(cpsip.getShapeId());
  }
}
