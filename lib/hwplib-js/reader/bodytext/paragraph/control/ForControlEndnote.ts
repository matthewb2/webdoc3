import type { ControlEndnote } from "../../../../object/bodytext/control/ControlEndnote.js";
import type { CtrlHeaderEndnote } from "../../../../object/bodytext/control/ctrlheader/CtrlHeaderEndnote.js";
import type { ListHeaderForFootnodeEndnote } from "../../../../object/bodytext/control/footnoteendnote/ListHeaderForFootnodeEndnote.js";
import { NumberShape } from "../../../../object/bodytext/control/sectiondefine/NumberShape.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForParagraphList } from "../../ForParagraphList.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 미주 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlEndnote {
  /**
   * 미주 컨트롤
   */
  private en!: ControlEndnote;
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 미주 컨트롤을 읽는다.
   *
   * @param en 미주 컨트롤
   * @param sr 스트림 리더
   */
  public read(en: ControlEndnote, sr: StreamReader): void {
    this.en = en;
    this.sr = sr;

    this.ctrlHeader();
    this.listHeader();
    this.paragraphList();
  }

  /**
   * 미주 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   */
  private ctrlHeader(): void {
    const h: CtrlHeaderEndnote = this.en.getHeader();
    h.setNumber(this.sr.readUInt4());
    h.getBeforeDecorationLetter().setBytes(this.sr.readWChar());
    h.getAfterDecorationLetter().setBytes(this.sr.readWChar());
    h.setNumberShape(NumberShape.valueOf(this.sr.readUInt4()));

    if (this.sr.isEndOfRecord()) return;

    h.setInstanceId(this.sr.readUInt4());
  }

  /**
   * 미주 컨트롤의 문단 리스트 헤더 레코드를 읽는다.
   */
  private listHeader(): void {
    const rh = this.sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      const lh: ListHeaderForFootnodeEndnote = this.en.getListHeader();
      lh.setParaCount(this.sr.readSInt4());
      lh.getProperty().setValue(this.sr.readUInt4());
      this.sr.skipToEndRecord();
    } else {
      throw new Error("List header must be located.");
    }
  }

  /**
   * 문단 리스트를 읽는다.
   */
  private paragraphList(): void {
    ForParagraphList.read(this.en.getParagraphList(), this.sr);
  }
}
