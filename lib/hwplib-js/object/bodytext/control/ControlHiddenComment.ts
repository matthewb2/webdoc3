import type { CtrlHeader } from "./ctrlheader/CtrlHeader.js";
import { CtrlHeaderDefault } from "./ctrlheader/CtrlHeaderDefault.js";
import { ListHeaderForHiddenComment } from "./hiddencomment/ListHeaderForHiddenComment.js";
import { ParagraphList } from "../paragraph/ParagraphList.js";
import { Control } from "./Control.js";
import { ControlType } from "./ControlType.js";

/**
 * Hidden-comment (숨은 설명) control, ported from hwplib's
 * `object.bodytext.control.ControlHiddenComment`.
 */
export class ControlHiddenComment extends Control {
  /**
   * List header for hidden comment.
   */
  private listHeader: ListHeaderForHiddenComment;
  /**
   * Paragraph list.
   */
  private paragraphList: ParagraphList;

  constructor() {
    super(new CtrlHeaderDefault(ControlType.getCtrlId(ControlType.HiddenComment)));

    this.listHeader = new ListHeaderForHiddenComment();
    this.paragraphList = new ParagraphList();
  }

  /**
   * Returns the control header.
   *
   * @return control header
   */
  getHeader(): CtrlHeader {
    return this.header!;
  }

  /**
   * Returns the list header for hidden comment.
   *
   * @return list header for hidden comment
   */
  getListHeader(): ListHeaderForHiddenComment {
    return this.listHeader;
  }

  /**
   * Returns the paragraph list.
   *
   * @return paragraph list
   */
  getParagraphList(): ParagraphList {
    return this.paragraphList;
  }

  override clone(): Control {
    const cloned = new ControlHiddenComment();
    cloned.copyControlPart(this);
    cloned.listHeader.copy(this.listHeader);
    cloned.paragraphList.copy(this.paragraphList);
    return cloned;
  }
}
