import type { ControlSectionDefine } from "../../../../object/bodytext/control/ControlSectionDefine.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "./bookmark/ForCtrlData.js";
import { ForBatangPageInfo } from "./secd/ForBatangPageInfo.js";
import { ForCtrlHeaderSecd } from "./secd/ForCtrlHeaderSecd.js";
import { ForFootEndNoteShape } from "./secd/ForFootEndNoteShape.js";
import { ForPageBorderFill } from "./secd/ForPageBorderFill.js";
import { ForPageDef } from "./secd/ForPageDef.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 구역 정의 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlSectionDefine {
  /**
   * 구역 정의 컨트롤
   */
  private secd!: ControlSectionDefine;
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;

  /**
   * 컨트롤헤더의 레벨
   */
  private ctrlHeaderLevel = 0;
  /**
   * 미/각주모양 레코드 인덱스
   */
  private endFootnoteShapeIndex: number;
  /**
   * 쪽 테두리/배경 레코드 인덱스
   */
  private pageBorderFillIndex: number;

  /**
   * 생성자
   */
  public constructor() {
    this.endFootnoteShapeIndex = 0;
    this.pageBorderFillIndex = 0;
  }

  /**
   * 구역 정의 컨트롤을 읽는다.
   *
   * @param secd 구역 정의 컨트롤 객체
   * @param sr   스트림 리더
   */
  public read(secd: ControlSectionDefine, sr: StreamReader): void {
    this.secd = secd;
    this.sr = sr;
    this.ctrlHeaderLevel = sr.getCurrentRecordHeader().getLevel();

    this.ctrlHeader();

    while (this.sr.isEndOfStream() === false) {
      if (this.sr.isImmediatelyAfterReadingHeader() === false) {
        this.sr.readRecordHeader();
      }

      if (this.ctrlHeaderLevel >= this.sr.getCurrentRecordHeader().getLevel()) {
        break;
      }
      this.readBody();
    }
  }

  /**
   * 구역 정의 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   */
  private ctrlHeader(): void {
    ForCtrlHeaderSecd.read(this.secd.getHeader(), this.sr);
  }

  /**
   * 이미 읽은 레코드 헤더에 따른 레코드 내용을 읽는다.
   */
  private readBody(): void {
    switch (this.sr.getCurrentRecordHeader().getTagID()) {
      case HWPTag.PAGE_DEF:
        this.pageDef();
        break;
      case HWPTag.FOOTNOTE_SHAPE:
        this.endFootnoteShapes();
        break;
      case HWPTag.PAGE_BORDER_FILL:
        this.pageBorderFills();
        break;
      case HWPTag.LIST_HEADER:
        this.batangPageInfo();
        break;
      case HWPTag.CTRL_DATA:
        this.ctrlData();
        break;
    }
  }

  /**
   * 용지 설정 레코드를 읽는다.
   */
  private pageDef(): void {
    ForPageDef.read(this.secd.getPageDef(), this.sr);
  }

  /**
   * 각주/미주 모양 레코드를 읽는다.
   */
  private endFootnoteShapes(): void {
    if (this.endFootnoteShapeIndex === 0) {
      this.footNoteShape();
    } else if (this.endFootnoteShapeIndex === 1) {
      this.endNoteShape();
    }
    this.endFootnoteShapeIndex++;
  }

  /**
   * 각주 모양 레코드를 읽는다.
   */
  private footNoteShape(): void {
    ForFootEndNoteShape.read(this.secd.getFootNoteShape(), this.sr);
  }

  /**
   * 미주 모양 레코드를 읽는다.
   */
  private endNoteShape(): void {
    ForFootEndNoteShape.read(this.secd.getEndNoteShape(), this.sr);
  }

  /**
   * 쪽 테두리/배경 레코드를 읽는다.
   */
  private pageBorderFills(): void {
    if (this.pageBorderFillIndex === 0) {
      this.bothPageBorderFill();
    } else if (this.pageBorderFillIndex === 1) {
      this.evenPageBorderFill();
    } else if (this.pageBorderFillIndex === 2) {
      this.oddPageBorderFill();
    }

    this.pageBorderFillIndex++;
  }

  /**
   * 양쪽 페이지를 위한 쪽 테두리/배경 레코드를 읽느다.
   */
  private bothPageBorderFill(): void {
    ForPageBorderFill.read(this.secd.getBothPageBorderFill(), this.sr);
  }

  /**
   * 짝수쪽 페이지를 위한 쪽 테두리/배경 레코드를 읽느다.
   */
  private evenPageBorderFill(): void {
    ForPageBorderFill.read(this.secd.getEvenPageBorderFill(), this.sr);
  }

  /**
   * 홀수쪽 페이지를 위한 쪽 테두리/배경 레코드를 읽느다.
   */
  private oddPageBorderFill(): void {
    ForPageBorderFill.read(this.secd.getOddPageBorderFill(), this.sr);
  }

  /**
   * 바탕쪽 정보를 읽는다.
   */
  private batangPageInfo(): void {
    ForBatangPageInfo.read(this.secd.addNewBatangPageInfo(), this.sr);
  }

  /**
   * 컨트롤 데이터를 읽는다.
   */
  private ctrlData(): void {
    this.secd.createCtrlData();
    ForCtrlData.read(this.secd.getCtrlData()!, this.sr);
  }
}
