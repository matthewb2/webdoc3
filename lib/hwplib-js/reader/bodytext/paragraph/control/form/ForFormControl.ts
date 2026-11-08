import type { ControlForm } from "../../../../../object/bodytext/control/ControlForm.js";
import { ControlType } from "../../../../../object/bodytext/control/ControlType.js";
import { CtrlHeaderGso } from "../../../../../object/bodytext/control/ctrlheader/CtrlHeaderGso.js";
import type { FormObject } from "../../../../../object/bodytext/control/form/FormObject.js";
import { FormObjectType } from "../../../../../object/bodytext/control/form/FormObjectType.js";
import type { Paragraph } from "../../../../../object/bodytext/paragraph/Paragraph.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";
import { ForCtrlHeaderGso } from "../gso/part/ForCtrlHeaderGso.js";

export class ForFormControl {
  public static read(paragraph: Paragraph, sr: StreamReader): void {
    const header = ForFormControl.ctrlHeader(sr);

    const fc: ControlForm = paragraph.addNewFormControl(header);
    ForFormControl.formObject(fc.getFormObject(), sr);
  }

  private static ctrlHeader(sr: StreamReader): CtrlHeaderGso {
    const header = new CtrlHeaderGso(ControlType.Form);
    ForCtrlHeaderGso.read(header, sr);
    return header;
  }

  private static formObject(formObject: FormObject, sr: StreamReader): void {
    sr.readRecordHeader();
    if (sr.getCurrentRecordHeader().getTagID() !== HWPTag.FORM_OBJECT) return;

    const id = sr.readUInt4();
    sr.readUInt4();
    formObject.setType(FormObjectType.fromUint4(id) as FormObjectType);
    sr.skip(4);

    const propertiesString = sr.readUTF16LEString() ?? "";
    formObject.getProperties().parse(propertiesString);
  }
}
