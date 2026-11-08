import type { Paragraph } from "../../../object/bodytext/paragraph/Paragraph.js";
import type { StreamWriter } from "../../../util/compoundFile/writer/StreamWriter.js";
import { ForControl } from "./control/ForControl.js";
import { ForParaCharShape } from "./ForParaCharShape.js";
import { ForParaHeader } from "./ForParaHeader.js";
import { ForParaLineSeg } from "./ForParaLineSeg.js";
import { ForParaRangeTag } from "./ForParaRangeTag.js";
import { ForParaText } from "./ForParaText.js";

/**
 * 문단을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForParagraph {
  /**
   * 문단을 쓴다.
   *
   * @param p  문단
   * @param sw 스트림 라이터
   */
  public static write(p: Paragraph, sw: StreamWriter): void {
    ForParaHeader.write(p.getHeader(), sw);
    sw.upRecordLevel();

    ForParaText.write(p, sw);
    ForParaCharShape.write(p.getCharShape(), sw);
    ForParaLineSeg.write(p.getLineSeg(), sw);
    ForParaRangeTag.write(p.getRangeTag(), sw);
    ForParagraph.controls(p, sw);

    sw.downRecordLevel();
  }

  /**
   * 문단에 포함된 컨트롤들을 쓴다.
   *
   * @param p  문단
   * @param sw 스트림 라이터
   */
  private static controls(p: Paragraph, sw: StreamWriter): void {
    if (p.getControlList() === null) {
      return;
    }

    for (const c of p.getControlList()!) {
      ForControl.write(c, sw);
    }
  }
}
