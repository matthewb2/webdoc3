import type { Paragraph } from "../../../object/bodytext/paragraph/Paragraph.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";

/**
 * 문단의 글자 모양 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForParaCharShape {
  /**
   * 문단의 글자 모양 레코드를 읽는다.
   *
   * @param paragraph 문단 객체
   * @param sr        스트림 리더
   */
  public static read(paragraph: Paragraph, sr: StreamReader): void {
    paragraph.createCharShape();

    const count = paragraph.getHeader().getCharShapeCount();
    if (count !== 0) {
      for (let index = 0; index < count; index++) {
        const position = sr.readUInt4();
        const charShapeId = sr.readUInt4();

        paragraph.getCharShape()!.addParaCharShape(position, charShapeId);
      }
    } else {
      sr.nextRecord();
    }
  }
}
