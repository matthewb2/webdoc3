import { ControlType } from "../ControlType.js";
import { ColumnDefineHeaderProperty } from "./columndefine/ColumnDefineHeaderProperty.js";
import { ColumnInfo } from "./columndefine/ColumnInfo.js";
import { EachBorder } from "../../../docinfo/borderfill/EachBorder.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 단 정의 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderColumnDefine extends CtrlHeader {
  /**
   * 속성
   */
  private property: ColumnDefineHeaderProperty;
  /**
   * 단 사이 간격
   */
  private gapBetweenColumn = 0;
  /**
   * 속성2(정보 없음)
   */
  private property2 = 0;
  /**
   * 단 정보 리스트
   */
  private columnInfoList: ColumnInfo[];
  /**
   * 단 구분선 정보
   */
  private divideLine: EachBorder;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.ColumnDefine);

    this.property = new ColumnDefineHeaderProperty();
    this.columnInfoList = [];
    this.divideLine = new EachBorder();
  }

  /**
   * 단 정의 컨트롤의 속성 객체를 반환한다.
   *
   * @return 단 정의 컨트롤의 속성 객체
   */
  getProperty(): ColumnDefineHeaderProperty {
    return this.property;
  }

  /**
   * 단 사이 간격을 반환한다.
   *
   * @return 단 사이 간격
   */
  getGapBetweenColumn(): number {
    return this.gapBetweenColumn;
  }

  /**
   * 단 사이 간격를 설정한다.
   *
   * @param gapBetweenColumn 단 사이 간격
   */
  setGapBetweenColumn(gapBetweenColumn: number): void {
    this.gapBetweenColumn = gapBetweenColumn;
  }

  /**
   * 속성2를 반환한다.
   *
   * @return 속성2
   */
  getProperty2(): number {
    return this.property2;
  }

  /**
   * 속성2를 설정한다.
   *
   * @param property2 속성2
   */
  setProperty2(property2: number): void {
    this.property2 = property2;
  }

  /**
   * 새로운 단 정보 객체를 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 단 정보 객체
   */
  addNewColumnInfo(): ColumnInfo {
    const ci = new ColumnInfo();
    this.columnInfoList.push(ci);
    return ci;
  }

  /**
   * 단 정보 리스트를 반환한다.
   *
   * @return 단 정보 리스트
   */
  getColumnInfoList(): ColumnInfo[] {
    return this.columnInfoList;
  }

  /**
   * 단 구분선 정보를 반환한다.
   *
   * @return 단 구분선 종류
   */
  getDivideLine(): EachBorder {
    return this.divideLine;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderColumnDefine;
    this.property.copy(from2.property);
    this.gapBetweenColumn = from2.gapBetweenColumn;
    this.property2 = from2.property2;

    for (const columnInfo of from2.columnInfoList) {
      this.columnInfoList.push(columnInfo.clone());
    }
    this.divideLine.copy(from2.divideLine);
  }
}
