import type { ControlEquation } from "../../../../object/bodytext/control/ControlEquation.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import { ForEQEdit } from "./eqed/ForEQEdit.js";
import { ForCaption } from "./gso/part/ForCaption.js";
import { ForCtrlHeaderGso } from "./gso/part/ForCtrlHeaderGso.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 수식 컨트롤을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForControlEquation {
  /**
   * 수식 컨트롤
   */
  private eqed!: ControlEquation;
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;
  /**
   * 컨트롤 헤더 레코드의 레벨
   */
  private ctrlHeaderLevel = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 수식 컨트롤을 읽는다.
   *
   * @param eqed 수식 컨트롤
   * @param sr   스트림 리더
   */
  public read(eqed: ControlEquation, sr: StreamReader): void {
    this.eqed = eqed;
    this.sr = sr;
    this.ctrlHeaderLevel = sr.getCurrentRecordHeader().getLevel();

    this.ctrlHeader();
    this.caption();

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
   * 수식 컨트롤의 컨트롤 헤더 레코드를 읽는다.
   */
  private ctrlHeader(): void {
    ForCtrlHeaderGso.read(this.eqed.getHeader(), this.sr);
  }

  /**
   * 캡션 정보를 읽는다.
   */
  private caption(): void {
    this.sr.readRecordHeader();
    if (this.sr.getCurrentRecordHeader().getTagID() !== HWPTag.LIST_HEADER) return;

    this.eqed.createCaption();
    ForCaption.read(this.eqed.getCaption()!, this.sr);
  }

  /**
   * 이미 읽은 레코드 헤더에 따른 레코드 내용을 읽는다.
   */
  private readBody(): void {
    switch (this.sr.getCurrentRecordHeader().getTagID()) {
      case HWPTag.EQEDIT:
        this.eqEdit();
        break;
    }
  }

  /**
   * 수식 정보 레코드를 읽는다.
   */
  private eqEdit(): void {
    ForEQEdit.read(this.eqed.getEQEdit(), this.sr);
  }
}
