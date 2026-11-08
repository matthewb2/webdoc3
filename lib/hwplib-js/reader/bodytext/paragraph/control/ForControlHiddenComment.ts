import type { ControlHiddenComment } from "../../../../object/bodytext/control/ControlHiddenComment.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForParagraphList } from "../../ForParagraphList.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 숨은 설명 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlHiddenComment {
  /**
   * 숨은 설명 컨트롤
   */
  private tcmt!: ControlHiddenComment;
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 숨은 설명 컨트롤을 읽는다.
   *
   * @param tcmt 숨은 설명 컨트롤
   * @param sr   스트림 리더
   */
  public read(tcmt: ControlHiddenComment, sr: StreamReader): void {
    this.tcmt = tcmt;
    this.sr = sr;

    this.listHeader();
    this.paragraphList();
  }

  /**
   * 숨은 설명 컨트롤의 문단 리스트 헤더 레코드을 읽는다.
   */
  private listHeader(): void {
    const rh = this.sr.readRecordHeader();
    if (rh.getTagID() === HWPTag.LIST_HEADER) {
      this.tcmt.getListHeader().setParaCount(this.sr.readSInt4());
      this.tcmt.getListHeader().getProperty().setValue(this.sr.readUInt4());
      this.sr.skipToEndRecord();
    } else {
      throw new Error("List header must be located.");
    }
  }

  /**
   * 문단 리스트를 읽는다.
   */
  private paragraphList(): void {
    ForParagraphList.read(this.tcmt.getParagraphList(), this.sr);
  }
}
