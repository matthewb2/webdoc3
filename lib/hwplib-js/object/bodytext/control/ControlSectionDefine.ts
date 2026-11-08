import { CtrlHeaderSectionDefine } from "./ctrlheader/CtrlHeaderSectionDefine.js";
import { BatangPageInfo } from "./sectiondefine/BatangPageInfo.js";
import { FootEndNoteShape } from "./sectiondefine/FootEndNoteShape.js";
import { PageBorderFill } from "./sectiondefine/PageBorderFill.js";
import { PageDef } from "./sectiondefine/PageDef.js";
import { Control } from "./Control.js";

/**
 * Section-define (구역 정의) control, ported from hwplib's
 * `object.bodytext.control.ControlSectionDefine`.
 */
export class ControlSectionDefine extends Control {
  /**
   * Page-setup information.
   */
  private pageDef: PageDef;
  /**
   * Footnote shape information.
   */
  private footNoteShape: FootEndNoteShape;
  /**
   * Endnote shape information.
   */
  private endNoteShape: FootEndNoteShape;
  /**
   * Page border/fill information - both pages.
   */
  private bothPageBorderFill: PageBorderFill;
  /**
   * Page border/fill information - even pages.
   */
  private evenPageBorderFill: PageBorderFill;
  /**
   * Page border/fill information - odd pages.
   */
  private oddPageBorderFill: PageBorderFill;
  /**
   * Batang-page information (both/even/odd) list.
   */
  private batangPageInfoList: BatangPageInfo[];

  constructor() {
    super(new CtrlHeaderSectionDefine());

    this.pageDef = new PageDef();
    this.footNoteShape = new FootEndNoteShape();
    this.endNoteShape = new FootEndNoteShape();
    this.bothPageBorderFill = new PageBorderFill();
    this.evenPageBorderFill = new PageBorderFill();
    this.oddPageBorderFill = new PageBorderFill();
    this.batangPageInfoList = [];
  }

  /**
   * Returns the control header for the section-define control.
   *
   * @return control header for the section-define control
   */
  getHeader(): CtrlHeaderSectionDefine {
    return this.header as CtrlHeaderSectionDefine;
  }

  /**
   * Returns the page-setup information.
   *
   * @return page-setup information
   */
  getPageDef(): PageDef {
    return this.pageDef;
  }

  /**
   * Returns the footnote shape information.
   *
   * @return footnote shape information
   */
  getFootNoteShape(): FootEndNoteShape {
    return this.footNoteShape;
  }

  /**
   * Returns the endnote shape information.
   *
   * @return endnote shape information
   */
  getEndNoteShape(): FootEndNoteShape {
    return this.endNoteShape;
  }

  /**
   * Returns the page border/fill information (both pages).
   *
   * @return page border/fill information (both pages)
   */
  getBothPageBorderFill(): PageBorderFill {
    return this.bothPageBorderFill;
  }

  /**
   * Returns the page border/fill information (even pages).
   *
   * @return page border/fill information (even pages)
   */
  getEvenPageBorderFill(): PageBorderFill {
    return this.evenPageBorderFill;
  }

  /**
   * Returns the page border/fill information (odd pages).
   *
   * @return page border/fill information (odd pages)
   */
  getOddPageBorderFill(): PageBorderFill {
    return this.oddPageBorderFill;
  }

  /**
   * Creates a new batang-page information object and adds it to the list.
   *
   * @return the newly created batang-page information object
   */
  addNewBatangPageInfo(): BatangPageInfo {
    const bpi = new BatangPageInfo();
    this.batangPageInfoList.push(bpi);
    return bpi;
  }

  /**
   * Returns the batang-page information list.
   *
   * @return batang-page information list
   */
  getBatangPageInfoList(): BatangPageInfo[] {
    return this.batangPageInfoList;
  }

  override clone(): Control {
    const cloned = new ControlSectionDefine();
    cloned.copyControlPart(this);
    cloned.pageDef.copy(this.pageDef);
    cloned.footNoteShape.copy(this.footNoteShape);
    cloned.endNoteShape.copy(this.endNoteShape);
    cloned.bothPageBorderFill.copy(this.bothPageBorderFill);
    cloned.evenPageBorderFill.copy(this.evenPageBorderFill);
    cloned.oddPageBorderFill.copy(this.oddPageBorderFill);

    for (const batangPageInfo of this.batangPageInfoList) {
      cloned.batangPageInfoList.push(batangPageInfo.clone());
    }

    return cloned;
  }
}
