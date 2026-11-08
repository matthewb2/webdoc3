import type { Table } from "../../../../../object/bodytext/control/table/Table.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import type { FileVersion } from "../../../../../object/fileheader/FileVersion.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 표 정보 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForTable {
  /**
   * 표 정보 레코드를 쓴다.
   *
   * @param t  표 정보 레코드
   * @param sw 스트림 라이터
   */
  public static write(t: Table, sw: StreamWriter): void {
    ForTable.recordHeader(t, sw);

    sw.writeUInt4(t.getProperty().getValue());
    sw.writeUInt2(t.getRowCount());
    sw.writeUInt2(t.getColumnCount());
    sw.writeUInt2(t.getCellSpacing());
    sw.writeUInt2(t.getLeftInnerMargin());
    sw.writeUInt2(t.getRightInnerMargin());
    sw.writeUInt2(t.getTopInnerMargin());
    sw.writeUInt2(t.getBottomInnerMargin());

    for (let index = 0; index < t.getRowCount(); index++) {
      sw.writeUInt2(t.getCellCountOfRowList()[index]!);
    }
    sw.writeUInt2(t.getBorderFillId());

    if (sw.getFileVersion()!.isOver(5, 0, 1, 0)) {
      ForTable.zoneInfo(t, sw);
    }
  }

  /**
   * 표 정보 레코드의 레코드 헤더를 쓴다.
   *
   * @param t  표 정보 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(t: Table, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.TABLE, ForTable.getSize(t, sw.getFileVersion()!));
  }

  /**
   * 표 정보 레코드의 크기를 반환한다.
   *
   * @param t       표 정보 레코드
   * @param version 파일 버전
   * @return 표 정보 레코드의 크기
   */
  private static getSize(t: Table, version: FileVersion): number {
    let size = 0;

    size += 18;
    size += 2 * t.getRowCount();
    size += 2;
    if (version.isOver(5, 0, 1, 0)) {
      size += 2;
      size += 10 * t.getZoneInfoList().length;
    }

    return size;
  }

  /**
   * zone info을 쓴다.
   *
   * @param t  표 정보 레코드
   * @param sw 스트림 라이터
   */
  private static zoneInfo(t: Table, sw: StreamWriter): void {
    const ziList = t.getZoneInfoList();
    const count = ziList.length;
    sw.writeUInt2(count);

    for (let index = 0; index < count; index++) {
      const zi = ziList[index]!;

      sw.writeUInt2(zi.getStartColumn());
      sw.writeUInt2(zi.getStartRow());
      sw.writeUInt2(zi.getEndColumn());
      sw.writeUInt2(zi.getEndRow());
      sw.writeUInt2(zi.getBorderFillId());
    }
  }
}
