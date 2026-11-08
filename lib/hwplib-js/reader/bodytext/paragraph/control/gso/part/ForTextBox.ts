import { ParameterSet } from "../../../../../../object/bodytext/control/bookmark/ParameterSet.js";
import { ParameterType } from "../../../../../../object/bodytext/control/bookmark/ParameterType.js";
import { ForParagraphList } from "../../../../ForParagraphList.js";
import { ForParameterSet } from "../../bookmark/ForParameterSet.js";
import type { ListHeaderForTextBox } from "../../../../../../object/bodytext/control/gso/textbox/ListHeaderForTextBox.js";
import type { TextBox } from "../../../../../../object/bodytext/control/gso/textbox/TextBox.js";
import type { StreamReader } from "../../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 글상자를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForTextBox {
  /**
   * 글상자를 읽는다.
   *
   * @param textBox 글상자
   * @param sr      스트림 리더
   */
  public static read(textBox: TextBox, sr: StreamReader): void {
    ForTextBox.listHeader(textBox.getListHeader(), sr);
    ForParagraphList.read(textBox.getParagraphList(), sr);
  }

  /**
   * 글상자의 문단 리스트 헤더 레코드를 읽는다.
   *
   * @param lh 글상자의 문단 리스트 헤더 레코드
   * @param sr 스트림 리더
   */
  private static listHeader(
    lh: ListHeaderForTextBox,
    sr: StreamReader,
  ): void {
    lh.setParaCount(sr.readSInt4());
    lh.getProperty().setValue(sr.readUInt4());
    lh.setLeftMargin(sr.readUInt2());
    lh.setRightMargin(sr.readUInt2());
    lh.setTopMargin(sr.readUInt2());
    lh.setBottomMargin(sr.readUInt2());
    lh.setTextWidth(sr.readUInt4());

    if (sr.isEndOfRecord()) return;

    ForTextBox.unknownBytes(8, sr);

    if (sr.isEndOfRecord()) return;

    const temp = sr.readSInt4();
    if (temp === 1) {
      lh.setEditableAtFormMode(true);
    } else {
      lh.setEditableAtFormMode(false);
    }

    const flag = sr.readUInt1();
    if (flag === 0xff) {
      ForTextBox.fieldName(lh, sr);
    }
  }

  /**
   * 알려지지 않은 n 바이트틀 처리한다.
   *
   * @param n  알려지지 않은 바이트 개수
   * @param sr 스트림 리더
   */
  private static unknownBytes(n: number, sr: StreamReader): void {
    sr.skip(n);
  }

  /**
   * 필드 이름을 읽는다.
   *
   * @param lh 글상자의 문단 리스트 헤더 레코드
   * @param sr 스트림 리더
   */
  private static fieldName(lh: ListHeaderForTextBox, sr: StreamReader): void {
    const ps = new ParameterSet();
    ForParameterSet.read(ps, sr);

    if (ps.getId() !== 0x21b) return;

    for (const pi of ps.getParameterItemList()) {
      if (pi.getId() === 0x4000 && pi.getType() === ParameterType.String) {
        lh.setFieldName(pi.getValue_BSTR());
      }
    }
  }
}
