import type { ParagraphListInterface } from "../../../object/bodytext/ParagraphListInterface.js";
import type { StreamWriter } from "../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraph } from "./ForParagraph.js";

/**
 * 문단 리스트를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParagraphList {
  /**
   * 문단 리스트를 쓴다.
   *
   * @param pl 문단 리스트
   * @param sw 스트림 라이터
   */
  public static write(pl: ParagraphListInterface, sw: StreamWriter): void {
    for (const p of pl) {
      ForParagraph.write(p, sw);
    }
  }
}
