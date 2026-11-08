import type { Control } from "../../../object/bodytext/control/Control.js";
import { ControlType } from "../../../object/bodytext/control/ControlType.js";
import type { Paragraph } from "../../../object/bodytext/paragraph/Paragraph.js";
import { HWPTag } from "../../../object/etc/HWPTag.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";
import { ForControl } from "./control/ForControl.js";
import { ForFormControl } from "./control/form/ForFormControl.js";
import { ForGsoControl } from "./control/gso/ForGsoControl.js";
import { ForParaCharShape } from "./ForParaCharShape.js";
import { ForParaHeader } from "./ForParaHeader.js";
import { ForParaLineSeg } from "./ForParaLineSeg.js";
import { ForParaRangeTag } from "./ForParaRangeTag.js";
import { ForParaText } from "./ForParaText.js";

/**
 * 하나의 문단을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForParagraph {
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;

  /**
   * 문단 헤더의 level
   */
  private paraHeaderLevel!: number;

  /**
   * 문단 객체
   */
  private paragraph!: Paragraph;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 하나의 문단을 읽는다.
   *
   * @param paragraph 문단 객체
   * @param sr        스트림 리더
   */
  public read(paragraph: Paragraph, sr: StreamReader): void {
    if (sr.getCurrentRecordHeader().getTagID() !== HWPTag.PARA_HEADER) {
      throw new Error("This is not paragraph.");
    }

    this.sr = sr;
    this.paragraph = paragraph;
    this.paraHeaderLevel = sr.getCurrentRecordHeader().getLevel();
    this.paraHeaderBody();
    this.paraText();
    this.paraCharShape();
    this.paraLineSeg();
    this.paraRangeTag();

    while (sr.isEndOfStream() === false) {
      if (sr.isImmediatelyAfterReadingHeader() === false) {
        sr.readRecordHeader();
      }
      if (this.isOutOfParagraph(sr) || this.isFollowLastBatangPageInfo(sr) || this.isFollowMemo(sr)) {
        break;
      }
      if (sr.getCurrentRecordHeader().getTagID() === HWPTag.CTRL_HEADER) {
        this.control();
      } else {
        this.skipETCRecord();
      }
    }
  }

  /**
   * 문단 헤더 레코드를 읽는다.
   */
  private paraHeaderBody(): void {
    ForParaHeader.read(this.paragraph.getHeader(), this.sr);
  }

  /**
   * 문단의 텍스트 레코드을 읽는다.
   */
  private paraText(): void {
    if (this.sr.isEndOfStream()) {
      return;
    }

    if (this.sr.isImmediatelyAfterReadingHeader() === false) {
      this.sr.readRecordHeader();
    }
    if (this.sr.getCurrentRecordHeader().getTagID() === HWPTag.PARA_TEXT) {
      ForParaText.read(this.paragraph, this.sr);
    }
  }

  /**
   * 문단의 문자 모양 레코드를 읽는다.
   */
  private paraCharShape(): void {
    if (this.sr.isEndOfStream()) {
      return;
    }

    if (this.sr.isImmediatelyAfterReadingHeader() === false) {
      this.sr.readRecordHeader();
    }
    if (this.sr.getCurrentRecordHeader().getTagID() === HWPTag.PARA_CHAR_SHAPE) {
      ForParaCharShape.read(this.paragraph, this.sr);
    }
  }

  /**
   * 문단의 레이아웃 레코드를 읽는다.
   */
  private paraLineSeg(): void {
    if (this.sr.isEndOfStream()) {
      return;
    }

    if (this.sr.isImmediatelyAfterReadingHeader() === false) {
      this.sr.readRecordHeader();
    }
    if (this.sr.getCurrentRecordHeader().getTagID() === HWPTag.PARA_LINE_SEG) {
      ForParaLineSeg.read(this.paragraph, this.sr);
    }
  }

  /**
   * 문단의 영역 태그 레코드를 읽는다.
   */
  private paraRangeTag(): void {
    if (this.sr.isEndOfStream()) {
      return;
    }

    if (this.sr.isImmediatelyAfterReadingHeader() === false) {
      this.sr.readRecordHeader();
    }
    if (this.sr.getCurrentRecordHeader().getTagID() === HWPTag.PARA_RANGE_TAG) {
      ForParaRangeTag.read(this.paragraph, this.sr);
    }
  }

  /**
   * 읽은 레코드 헤더가 문단 바깥쪽인지 여부를 반환한다.
   *
   * @param sr 스트림 리더
   * @return 읽은 레코드 헤더가 문단 바깥쪽인지 여부
   */
  private isOutOfParagraph(sr: StreamReader): boolean {
    return this.paraHeaderLevel >= sr.getCurrentRecordHeader().getLevel();
  }

  /**
   * 마지막 바탕쪽 정보가 뒤에 붙어 있는지 여부를 반환한다.
   *
   * @param sr 스트림 리더
   * @return 마지막 바탕쪽 정보가 뒤에 붙어 있는지 여부
   */
  private isFollowLastBatangPageInfo(sr: StreamReader): boolean {
    return (
      this.paraHeaderLevel === 0 &&
      sr.getCurrentRecordHeader().getTagID() === HWPTag.LIST_HEADER &&
      sr.getCurrentRecordHeader().getLevel() === 1
    );
  }

  private isFollowMemo(sr: StreamReader): boolean {
    return (
      this.paraHeaderLevel === 0 &&
      sr.getCurrentRecordHeader().getTagID() === HWPTag.MEMO_LIST &&
      sr.getCurrentRecordHeader().getLevel() === 1
    );
  }

  /**
   * 문단에 포함된 컨트롤을 읽는다.
   */
  private control(): void {
    const id = this.sr.readUInt4();
    if (id === ControlType.getCtrlId(ControlType.Gso)) {
      const fgc = new ForGsoControl();
      fgc.read(this.paragraph, this.sr);
    } else if (id === ControlType.getCtrlId(ControlType.Form)) {
      ForFormControl.read(this.paragraph, this.sr);
    } else {
      const c: Control = this.paragraph.addNewControl(id);
      ForControl.read(c, this.sr);
    }
  }

  /**
   * 기타 레코드를 스킵한다.
   */
  private skipETCRecord(): void {
    this.sr.readBytes(this.sr.getCurrentRecordHeader().getSize());
  }
}
