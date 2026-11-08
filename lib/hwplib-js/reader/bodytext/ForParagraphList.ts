import type { ParagraphListInterface } from "../../object/bodytext/ParagraphListInterface.js";
import type { Paragraph } from "../../object/bodytext/paragraph/Paragraph.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";
import { ForParagraph } from "./paragraph/ForParagraph.js";

/**
 * 문단 리스트를 읽는 객체
 *
 * @author neolord
 */
export class ForParagraphList {
  /**
   * 문단 리스트을 읽는다.
   *
   * @param pli 문단 리스트 객체
   * @param sr  스트림 리더
   */
  public static read(pli: ParagraphListInterface, sr: StreamReader): void {
    const fp = new ForParagraph();
    sr.readRecordHeader();
    while (sr.isEndOfStream() === false) {
      const para: Paragraph = pli.addNewParagraph();
      fp.read(para, sr);
      if (para.getHeader().isLastInList()) {
        break;
      }
    }
  }
}
