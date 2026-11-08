import type { MemoShape } from "../../object/docinfo/MemoShape.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

export class ForMemoShape {
  public static write(ms: MemoShape, sw: StreamWriter): void {
    ForMemoShape.recordHeader(ms, sw);

    sw.writeUInt4(ms.getWidth());
    sw.writeSInt1(ms.getLineType());
    sw.writeSInt1(ms.getLineWidth());
    sw.writeUInt4(ms.getLineColor().getValue());
    sw.writeUInt4(ms.getFillColor().getValue());
    sw.writeUInt4(ms.getActiveColor().getValue());
    sw.writeUInt4(ms.getUnknown());
  }

  private static recordHeader(ms: MemoShape, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.MEMO_SHAPE, 22);
  }
}
