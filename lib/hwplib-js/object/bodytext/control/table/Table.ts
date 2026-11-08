import { TableProperty } from "./TableProperty.js";
import { ZoneInfo } from "./ZoneInfo.js";

/**
 * 테이블 정보를 포함하는 레코드
 *
 * @author neolord
 */
export class Table {
  /**
   * 속성
   */
  private property: TableProperty;
  /**
   * 행의 개수
   */
  private rowCount = 0;
  /**
   * 열의 개수
   */
  private columnCount = 0;
  /**
   * 셀 사이의 공간
   */
  private cellSpacing = 0;
  /**
   * 왼쪽 안쪽 여백
   */
  private leftInnerMargin = 0;
  /**
   * 오른쪽 안쪽 여백
   */
  private rightInnerMargin = 0;
  /**
   * 위쪽 안쪽 여백
   */
  private topInnerMargin = 0;
  /**
   * 아래쪽 안쪽 여백
   */
  private bottomInnerMargin = 0;
  /**
   * 각 행의 셀의 개수를 저장하는 리스트
   */
  private cellCountOfRowList: number[];
  /**
   * 참조된 테두리/배경 id
   */
  private borderFillId = 0;
  /**
   * 영역 속성 리스트 (5.0.1.0 이상)
   */
  private zoneInfoList: ZoneInfo[];

  /**
   * 생성자
   */
  public constructor() {
    this.property = new TableProperty();
    this.cellCountOfRowList = [];
    this.zoneInfoList = [];
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  public getProperty(): TableProperty {
    return this.property;
  }

  /**
   * 행의 개수를 반환한다.
   *
   * @return 행의 개수
   */
  public getRowCount(): number {
    return this.rowCount;
  }

  /**
   * 행의 개수를 설정한다.
   *
   * @param rowCount 행의 개수
   */
  public setRowCount(rowCount: number): void {
    this.rowCount = rowCount;
  }

  /**
   * 열의 개수를 반환한다.
   *
   * @return 열의 개수
   */
  public getColumnCount(): number {
    return this.columnCount;
  }

  /**
   * 열의 개수를 설정한다.
   *
   * @param columnCount 열의 개수
   */
  public setColumnCount(columnCount: number): void {
    this.columnCount = columnCount;
  }

  /**
   * 셀 사이의 공간의 크기를 반환한다.
   *
   * @return 셀 사이의 공간의 크기
   */
  public getCellSpacing(): number {
    return this.cellSpacing;
  }

  /**
   * 셀 사이의 공간의 크기를 설정한다.
   *
   * @param cellSpacing 셀 사이의 공간의 크기
   */
  public setCellSpacing(cellSpacing: number): void {
    this.cellSpacing = cellSpacing;
  }

  /**
   * 왼쪽 안쪽 여백의 크기를 반환한다.
   *
   * @return 왼쪽 안쪽 여백의 크기
   */
  public getLeftInnerMargin(): number {
    return this.leftInnerMargin;
  }

  /**
   * 왼쪽 안쪽 여백의 크기를 설정한다.
   *
   * @param leftInnerMargin 왼쪽 안쪽 여백의 크기
   */
  public setLeftInnerMargin(leftInnerMargin: number): void {
    this.leftInnerMargin = leftInnerMargin;
  }

  /**
   * 오른쪽 안쪽 여백의 크기를 반환한다.
   *
   * @return 오른쪽 안쪽 여백의 크기
   */
  public getRightInnerMargin(): number {
    return this.rightInnerMargin;
  }

  /**
   * 오른쪽 안쪽 여백의 크기를 설정한다.
   *
   * @param rightInnerMargin 오른쪽 안쪽 여백의 크기
   */
  public setRightInnerMargin(rightInnerMargin: number): void {
    this.rightInnerMargin = rightInnerMargin;
  }

  /**
   * 위쪽 안쪽 여백의 크기를 반환한다.
   *
   * @return 위쪽 안쪽 여백의 크기
   */
  public getTopInnerMargin(): number {
    return this.topInnerMargin;
  }

  /**
   * 위쪽 안쪽 여백의 크기를 설정한다.
   *
   * @param topInnerMargin 위쪽 안쪽 여백의 크기
   */
  public setTopInnerMargin(topInnerMargin: number): void {
    this.topInnerMargin = topInnerMargin;
  }

  /**
   * 아래쪽 안쪽 여백의 크기를 반환한다.
   *
   * @return 아래쪽 안쪽 여백의 크기
   */
  public getBottomInnerMargin(): number {
    return this.bottomInnerMargin;
  }

  /**
   * 아래쪽 안쪽 여백의 크기를 설정한다.
   *
   * @param bottomInnerMargin 아래쪽 안쪽 여백의 크기
   */
  public setBottomInnerMargin(bottomInnerMargin: number): void {
    this.bottomInnerMargin = bottomInnerMargin;
  }

  /**
   * 행의 셀 개수를 추가한다.
   *
   * @param cellCountOfRow 특정 행의 셀 개수
   */
  public addCellCountOfRow(cellCountOfRow: number): void {
    this.cellCountOfRowList.push(cellCountOfRow);
  }

  /**
   * 각 행의 셀의 개수를 저장하는 리스트를 반환한다.
   *
   * @return 각 행의 셀의 개수를 저장하는 리스트
   */
  public getCellCountOfRowList(): number[] {
    return this.cellCountOfRowList;
  }

  /**
   * 참조된 테두리/배경 id를 반환한다.
   *
   * @return 참조된 테두리/배경 id
   */
  public getBorderFillId(): number {
    return this.borderFillId;
  }

  /**
   * 참조된 테두리/배경 id를 설정한다.
   *
   * @param borderFillId 참조된 테두리/배경 id
   */
  public setBorderFillId(borderFillId: number): void {
    this.borderFillId = borderFillId;
  }

  /**
   * 새로운 영역 속성 객체를 생성하고 리스트에 추가한다. (5.0.1.0 이상)
   *
   * @return 새로 생성된 영역 속성 객체
   */
  public addNewZoneInfo(): ZoneInfo {
    const zi = new ZoneInfo();
    this.zoneInfoList.push(zi);
    return zi;
  }

  /**
   * 영역 속성 리스트를 반환한다. (5.0.1.0 이상)
   *
   * @return 영역 속성 리스트
   */
  public getZoneInfoList(): ZoneInfo[] {
    return this.zoneInfoList;
  }

  public copy(from: Table): void {
    this.property.copy(from.property);
    this.rowCount = from.rowCount;
    this.columnCount = from.columnCount;
    this.cellSpacing = from.cellSpacing;
    this.leftInnerMargin = from.leftInnerMargin;
    this.rightInnerMargin = from.rightInnerMargin;
    this.topInnerMargin = from.topInnerMargin;
    this.bottomInnerMargin = from.bottomInnerMargin;

    for (const integer of from.cellCountOfRowList) {
      this.cellCountOfRowList.push(integer);
    }

    this.borderFillId = from.borderFillId;

    this.zoneInfoList.length = 0;
    for (const zoneInfo of from.zoneInfoList) {
      this.zoneInfoList.push(zoneInfo.clone());
    }
  }
}
