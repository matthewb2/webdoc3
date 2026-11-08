import type { ControlForm } from "../../../../../object/bodytext/control/ControlForm.js";
import type { FormObject } from "../../../../../object/bodytext/control/form/FormObject.js";
import { FormObjectType } from "../../../../../object/bodytext/control/form/FormObjectType.js";
import type { HWPString } from "../../../../../object/etc/HWPString.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";
import { ForCtrlHeaderGso } from "../gso/part/ForCtrlHeaderGso.js";

export class ForControlForm {
  public static write(form: ControlForm, sw: StreamWriter): void {
    ForCtrlHeaderGso.write(form.getHeader(), sw);

    sw.upRecordLevel();

    ForControlForm.formObject(form.getFormObject(), sw);

    sw.downRecordLevel();
  }

  private static formObject(fo: FormObject, sw: StreamWriter): void {
    const propertiesString = fo.getProperties().toHWPString();
    ForControlForm.recordHeader(fo, propertiesString, sw);
    sw.writeUInt4(FormObjectType.getId(fo.getType()!));
    sw.writeUInt4(FormObjectType.getId(fo.getType()!));
    sw.writeUInt2(propertiesString.getWCharsSize());
    sw.writeZero(2);
    sw.writeHWPString(propertiesString);
  }

  private static recordHeader(fo: FormObject, propertiesString: HWPString, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.FORM_OBJECT, ForControlForm.getSize(fo, propertiesString));
  }

  private static getSize(fo: FormObject, propertiesString: HWPString): number {
    return 12 + propertiesString.getWCharsSize();
  }
}
