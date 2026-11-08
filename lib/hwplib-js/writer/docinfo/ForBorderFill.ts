import type { BorderFill } from "../../object/docinfo/BorderFill.js";
import type { EachBorder } from "../../object/docinfo/borderfill/EachBorder.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";
import { ForFillInfo } from "./borderfill/ForFillInfo.js";

/**
 * 테두리/배경 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForBorderFill {
  /**
   * 테두리/배경 레코드를 쓴다.
   *
   * @param bf 테두리/배경 레코드
   * @param sw 스트림 라이터
   */
  public static write(bf: BorderFill, sw: StreamWriter): void {
    ForBorderFill.recordHeader(bf, sw);

    sw.writeUInt2(bf.getProperty().getValue());

    ForBorderFill.eachBorder(bf.getLeftBorder(), sw);
    ForBorderFill.eachBorder(bf.getRightBorder(), sw);
    ForBorderFill.eachBorder(bf.getTopBorder(), sw);
    ForBorderFill.eachBorder(bf.getBottomBorder(), sw);
    ForBorderFill.eachBorder(bf.getDiagonalBorder(), sw);
    ForFillInfo.write(bf.getFillInfo(), sw);
  }

  /**
   * 테두리/배경 레코드의 레코드 헤더를 쓴다.
   *
   * @param bf 테두리/배경 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(bf: BorderFill, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.BORDER_FILL, ForBorderFill.getSize(bf));
  }

  /**
   * 테두리/배경 레코드의 크기를 반환한다.
   *
   * @param bf 테두리/배경 레코드
   * @return 테두리/배경 레코드의 크기
   */
  private static getSize(bf: BorderFill): number {
    let size = 0;
    size += 2;
    size += (1 + 1 + 4) * 5;
    size += ForFillInfo.getSize(bf.getFillInfo());
    return size;
  }

  /**
   * 4방향의 테두리를 표현하는 각각의 선를 쓴다.
   *
   * @param eb 4방향의 테두리를 표현하는 각각의 선
   * @param sw 스트림 라이터
   */
  private static eachBorder(eb: EachBorder, sw: StreamWriter): void {
    sw.writeUInt1(eb.getType()!);
    sw.writeUInt1(eb.getThickness()!);
    sw.writeUInt4(eb.getColor().getValue());
  }
}
