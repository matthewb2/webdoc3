import type { CharShape } from "../../object/docinfo/CharShape.js";
import type { CharOffsets } from "../../object/docinfo/charshape/CharOffsets.js";
import type { CharSpaces } from "../../object/docinfo/charshape/CharSpaces.js";
import type { FaceNameIds } from "../../object/docinfo/charshape/FaceNameIds.js";
import type { Ratios } from "../../object/docinfo/charshape/Ratios.js";
import type { RelativeSizes } from "../../object/docinfo/charshape/RelativeSizes.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 글자 모양 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForCharShape {
  /**
   * 글자 모양을 읽는다.
   *
   * @param cs 글자 모양 레코드
   * @param sr 스트림 리더
   */
  public static read(cs: CharShape, sr: StreamReader): void {
    ForCharShape.faceNameIds(cs.getFaceNameIds(), sr);
    ForCharShape.ratios(cs.getRatios(), sr);
    ForCharShape.charSpaces(cs.getCharSpaces(), sr);
    ForCharShape.relativeSizes(cs.getRelativeSizes(), sr);
    ForCharShape.charPositions(cs.getCharOffsets(), sr);

    cs.setBaseSize(sr.readSInt4());
    cs.getProperty().setValue(sr.readUInt4());
    cs.setShadowGap1(sr.readSInt1());
    cs.setShadowGap2(sr.readSInt1());
    cs.getCharColor().setValue(sr.readUInt4());
    cs.getUnderLineColor().setValue(sr.readUInt4());
    cs.getShadeColor().setValue(sr.readUInt4());
    cs.getShadowColor().setValue(sr.readUInt4());

    if (sr.isEndOfRecord() === false && sr.getFileVersion()!.isOver(5, 0, 2, 1)) {
      cs.setBorderFillId(sr.readUInt2());
    }

    if (sr.isEndOfRecord() === false && sr.getFileVersion()!.isOver(5, 0, 3, 0)) {
      cs.getStrikeLineColor().setValue(sr.readUInt4());
    }
  }

  /**
   * 언어별 글꼴ID 부분을 읽는다.
   *
   * @param fnis 언어별 글꼴ID 부분을 나타내는 객체
   * @param sr   스트림 리더
   */
  private static faceNameIds(fnis: FaceNameIds, sr: StreamReader): void {
    const array: number[] = new Array<number>(7);
    for (let index = 0; index < 7; index++) {
      array[index] = sr.readUInt2();
    }
    fnis.setArray(array);
  }

  /**
   * 언어별 장평 부분을 읽는다.
   *
   * @param rs 언어별 장평 부분을 나타내는 객체
   * @param sr 스트림 리더
   */
  private static ratios(rs: Ratios, sr: StreamReader): void {
    const array: number[] = new Array<number>(7);
    for (let index = 0; index < 7; index++) {
      array[index] = sr.readUInt1();
    }
    rs.setArray(array);
  }

  /**
   * 언어별 자간 부분을 읽는다.
   *
   * @param css 언어별 자간 부분을 나타내는 객체
   * @param sr  스트림 리더
   */
  private static charSpaces(css: CharSpaces, sr: StreamReader): void {
    const array = new Uint8Array(7);
    for (let index = 0; index < 7; index++) {
      array[index] = sr.readSInt1();
    }
    css.setArray(array);
  }

  /**
   * 언어별 상대 크기 부분을 읽는다.
   *
   * @param rss 언어별 상대 크기을 나타내는 객체
   * @param sr  스트림 리더
   */
  private static relativeSizes(rss: RelativeSizes, sr: StreamReader): void {
    const array: number[] = new Array<number>(7);
    for (let index = 0; index < 7; index++) {
      array[index] = sr.readUInt1();
    }
    rss.setArray(array);
  }

  /**
   * 언어별 글자 위치 부분을 읽는다.
   *
   * @param cos 언어별 글자 위치을 나타내는 객체
   * @param sr  스트림 리더
   */
  private static charPositions(cos: CharOffsets, sr: StreamReader): void {
    const array = new Uint8Array(7);
    for (let index = 0; index < 7; index++) {
      array[index] = sr.readSInt1();
    }
    cos.setArray(array);
  }
}
