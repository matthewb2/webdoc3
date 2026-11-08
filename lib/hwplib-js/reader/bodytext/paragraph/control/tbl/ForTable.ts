import type { Table } from "../../../../../object/bodytext/control/table/Table.js";
import type { ZoneInfo } from "../../../../../object/bodytext/control/table/ZoneInfo.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 표 정보 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForTable {
  /**
   * 표 정보 레코드를 읽는다.
   *
   * @param table 표 정보 레코드
   * @param sr    스트림 리더
   */
  public static read(table: Table, sr: StreamReader): void {
    table.getProperty().setValue(sr.readUInt4());

    table.setRowCount(sr.readUInt2());
    table.setColumnCount(sr.readUInt2());
    table.setCellSpacing(sr.readUInt2());
    table.setLeftInnerMargin(sr.readUInt2());
    table.setRightInnerMargin(sr.readUInt2());
    table.setTopInnerMargin(sr.readUInt2());
    table.setBottomInnerMargin(sr.readUInt2());

    for (let index = 0; index < table.getRowCount(); index++) {
      table.addCellCountOfRow(sr.readUInt2());
    }

    table.setBorderFillId(sr.readUInt2());
    if (sr.getFileVersion()!.isOver(5, 0, 1, 0)) {
      ForTable.zoneInfo(table, sr);
    }
  }

  /**
   * zone info을 읽는다.
   *
   * @param table 표 정보 레코드
   * @param sr    스트림 리더
   */
  private static zoneInfo(table: Table, sr: StreamReader): void {
    const count = sr.readUInt2();
    for (let index = 0; index < count; index++) {
      const zi: ZoneInfo = table.addNewZoneInfo();
      zi.setStartColumn(sr.readUInt2());
      zi.setStartRow(sr.readUInt2());
      zi.setEndColumn(sr.readUInt2());
      zi.setEndRow(sr.readUInt2());
      zi.setBorderFillId(sr.readUInt2());
    }
  }
}
