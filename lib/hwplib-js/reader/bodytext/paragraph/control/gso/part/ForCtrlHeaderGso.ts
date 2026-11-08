import { BitFlag } from "../../../../../../util/binary/BitFlag.js";
import type { CtrlHeaderGso } from "../../../../../../object/bodytext/control/ctrlheader/CtrlHeaderGso.js";
import type { StreamReader } from "../../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 그리기 개체의 컨트롤 헤더 레코드를 읽는다.
 *
 * @author neolord
 */
export class ForCtrlHeaderGso {
  /**
   * 그리기 개체의 컨트롤 헤더 레코드를 읽는다.
   *
   * @param header 그리기 개체의 컨트롤 헤더 레코드
   * @param sr     스트림 리더
   */
  public static read(header: CtrlHeaderGso, sr: StreamReader): void {
    header.getProperty().setValue(sr.readUInt4());
    header.setyOffset(sr.readUInt4());
    header.setxOffset(sr.readUInt4());
    header.setWidth(sr.readUInt4());
    header.setHeight(sr.readUInt4());
    header.setzOrder(sr.readSInt4());
    header.setOutterMarginLeft(sr.readUInt2());
    header.setOutterMarginRight(sr.readUInt2());
    header.setOutterMarginTop(sr.readUInt2());
    header.setOutterMarginBottom(sr.readUInt2());
    header.setInstanceId(sr.readUInt4());

    if (sr.isEndOfRecord()) return;

    const temp = sr.readSInt4();
    header.setPreventPageDivide(BitFlag.get(temp, 0));

    if (sr.isEndOfRecord()) return;

    header.getExplanation().setBytes(sr.readHWPString());

    if (sr.isEndOfRecord()) return;

    const length =
      sr.getCurrentRecordHeader().getSize() - sr.getCurrentPositionAfterHeader();
    const unknown = sr.readBytes(length);
    header.setUnknown(unknown);
  }
}
