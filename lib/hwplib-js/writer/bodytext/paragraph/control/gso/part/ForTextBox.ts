import { ParameterSet } from "../../../../../../object/bodytext/control/bookmark/ParameterSet.js";
import { HWPTag } from "../../../../../../object/etc/HWPTag.js";
import { ForParagraphList } from "../../../ForParagraphList.js";
import { ForParameterSet } from "../../bookmark/ForParameterSet.js";
import type { ListHeaderForTextBox } from "../../../../../../object/bodytext/control/gso/textbox/ListHeaderForTextBox.js";
import type { TextBox } from "../../../../../../object/bodytext/control/gso/textbox/TextBox.js";
import type { StreamWriter } from "../../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 글상자를 쓰기 위한 객체
 *
 * @author 박성균
 */
export class ForTextBox {
  /**
   * 글상자를 쓴다.
   *
   * @param tb 글상자 객체
   * @param sw 스트림 라이터
   */
  public static write(tb: TextBox | null, sw: StreamWriter): void {
    if (tb === null) {
      return;
    }

    ForTextBox.listHeader(tb.getListHeader(), sw);
    ForParagraphList.write(tb.getParagraphList(), sw);
  }

  /**
   * 글상자의 리스트 헤더 레코드를 쓴다.
   *
   * @param lh 글상자의 리스트 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static listHeader(
    lh: ListHeaderForTextBox,
    sw: StreamWriter,
  ): void {
    const psFieldName = ParameterSet.createForFieldName(lh.getFieldName());

    ForTextBox.recordHeader(psFieldName, sw);

    sw.writeSInt4(lh.getParaCount());
    sw.writeUInt4(lh.getProperty().getValue());
    sw.writeUInt2(lh.getLeftMargin());
    sw.writeUInt2(lh.getRightMargin());
    sw.writeUInt2(lh.getTopMargin());
    sw.writeUInt2(lh.getBottomMargin());
    sw.writeUInt4(lh.getTextWidth());
    sw.writeZero(8);
    if (lh.isEditableAtFormMode()) {
      sw.writeSInt4(1);
    } else {
      sw.writeSInt4(0);
    }

    if (psFieldName !== null) {
      const flag = 0xff;
      sw.writeUInt1(flag);

      ForParameterSet.write(psFieldName, sw);
    } else {
      const flag = 0x0;
      sw.writeUInt1(flag);
    }
  }

  /**
   * 글상자의 리스트 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param psFieldName 필드 이름을 위한 파라미터셋 객체
   * @param sw          스트림 라이터
   */
  private static recordHeader(
    psFieldName: ParameterSet | null,
    sw: StreamWriter,
  ): void {
    sw.writeRecordHeader(HWPTag.LIST_HEADER, ForTextBox.getSize(psFieldName));
  }

  /**
   * 글상자의 리스트 헤더 레코드의 크기를 반환한다.
   *
   * @param psFieldName 필드 이름을 위한 파라미터셋 객체
   * @return 글상자의 리스트 헤더 레코드의 크기
   */
  private static getSize(psFieldName: ParameterSet | null): number {
    let size = 0;
    size += 32;
    if (psFieldName !== null) {
      size += 1;
      size += ForParameterSet.getSize(psFieldName);
    } else {
      size += 1;
    }
    return size;
  }
}
