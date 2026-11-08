import type { ControlFooter } from "../../../../object/bodytext/control/ControlFooter.js";
import { HeaderFooterApplyPage } from "../../../../object/bodytext/control/ctrlheader/header/HeaderFooterApplyPage.js";
import type { ListHeaderForHeaderFooter } from "../../../../object/bodytext/control/headerfooter/ListHeaderForHeaderFooter.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForParagraphList } from "../../ForParagraphList.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 꼬리말 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlFooter {
  /**
   * 꼬리말 컨트롤
   */
  private foot!: ControlFooter;
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 꼬리말 컨트롤을 읽는다.
   *
   * @param foot 꼬리말 컨트롤
   * @param sr   스트림 리더
   */
  public read(foot: ControlFooter, sr: StreamReader): void {
    this.foot = foot;
    this.sr = sr;

    this.ctrlHeader();
    this.listHeader();
    this.paragraphList();
  }

  /**
   * 꼬리말 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   */
  private ctrlHeader(): void {
    this.foot.getHeader().setApplyPage(HeaderFooterApplyPage.valueOf(this.sr.readUInt4()));
    if (this.sr.getCurrentRecordHeader().getSize() > this.sr.getCurrentPositionAfterHeader()) {
      this.foot.getHeader().setCreateIndex(this.sr.readSInt4());
    }
  }

  /**
   * 꼬리말 컨트롤의 문단 리스트 헤더 레코드를 읽는다.
   */
  private listHeader(): void {
    const rh = this.sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      const lh: ListHeaderForHeaderFooter = this.foot.getListHeader();
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
    ForParagraphList.read(this.foot.getParagraphList(), this.sr);
  }
}
