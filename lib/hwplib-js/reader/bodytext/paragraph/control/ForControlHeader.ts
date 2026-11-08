import type { ControlHeader } from "../../../../object/bodytext/control/ControlHeader.js";
import { HeaderFooterApplyPage } from "../../../../object/bodytext/control/ctrlheader/header/HeaderFooterApplyPage.js";
import type { ListHeaderForHeaderFooter } from "../../../../object/bodytext/control/headerfooter/ListHeaderForHeaderFooter.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForParagraphList } from "../../ForParagraphList.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 머리말 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlHeader {
  /**
   * 머리말 컨트롤
   */
  private head!: ControlHeader;
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 머리말 컨트롤을 읽는다.
   *
   * @param head 머리말 컨트롤
   * @param sr   스트림 리더
   */
  public read(head: ControlHeader, sr: StreamReader): void {
    this.head = head;
    this.sr = sr;

    this.ctrlHeader();
    this.listHeader();
    this.paragraphList();
  }

  /**
   * 머리말 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   */
  private ctrlHeader(): void {
    this.head.getHeader().setApplyPage(HeaderFooterApplyPage.valueOf(this.sr.readUInt4()));

    if (this.sr.isEndOfRecord()) return;

    this.head.getHeader().setCreateIndex(this.sr.readSInt4());
  }

  /**
   * 머리말 컨트롤의 문단 리스트 헤더 레코드를 읽는다.
   */
  private listHeader(): void {
    const rh = this.sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      const lh: ListHeaderForHeaderFooter = this.head.getListHeader();
      lh.setParaCount(this.sr.readSInt4());
      lh.getProperty().setValue(this.sr.readUInt4());
      lh.setTextWidth(this.sr.readUInt4());
      lh.setTextHeight(this.sr.readUInt4());
      this.sr.skipToEndRecord();
    } else {
      throw new Error("List header must be located.");
    }
  }

  /**
   * 문단 리스트를 읽는다.
   */
  private paragraphList(): void {
    ForParagraphList.read(this.head.getParagraphList(), this.sr);
  }
}
