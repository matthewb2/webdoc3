import type { MemoShape } from "../../object/docinfo/MemoShape.js";
import { BorderThickness } from "../../object/docinfo/borderfill/BorderThickness.js";
import { BorderType } from "../../object/docinfo/borderfill/BorderType.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

export class ForMemoShape {
  public static read(ms: MemoShape, sr: StreamReader): void {
    ms.setWidth(sr.readUInt4());
    ms.setLineType(BorderType.valueOf(sr.readSInt1()));
    ms.setLineWidth(BorderThickness.valueOf(sr.readSInt1()));
    ms.getLineColor().setValue(sr.readUInt4());
    ms.getFillColor().setValue(sr.readUInt4());
    ms.getActiveColor().setValue(sr.readUInt4());
    ms.setUnknown(sr.readUInt4());
  }
}
