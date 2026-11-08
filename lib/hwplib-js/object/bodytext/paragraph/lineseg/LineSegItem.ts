import { LineSegItemTag } from "./LineSegItemTag.js";

/**
 * 각 중의 align 정보에 대한 객체
 *
 * @author neolord
 */
export class LineSegItem {
  /**
   * 텍스트 시작 위치
   */
  private textStartPosition = 0;
  /**
   * 줄의 세로 위치
   */
  private lineVerticalPosition = 0;
  /**
   * 줄의 높이
   */
  private lineHeight = 0;
  /**
   * 텍스트 부분의 높이
   */
  private textPartHeight = 0;
  /**
   * 줄의 세로 위치에서 베이스라인까지 거리
   */
  private distanceBaseLineToLineVerticalPosition = 0;
  /**
   * 줄간격
   */
  private lineSpace = 0;
  /**
   * 컬럼에서의 시작 위치
   */
  private startPositionFromColumn = 0;
  /**
   * 세그먼트의 폭
   */
  private segmentWidth = 0;
  /**
   * tag 정보
   */
  private tag: LineSegItemTag;

  /**
   * 생성자
   */
  constructor() {
    this.tag = new LineSegItemTag();
  }

  /**
   * 텍스트 시작 위치를 반환한다.
   *
   * @return 텍스트 시작 위치
   */
  getTextStartPosition(): number {
    return this.textStartPosition;
  }

  /**
   * 텍스트 시작 위치를 설정한다.
   *
   * @param textStartPosition 텍스트 시작 위치
   */
  setTextStartPosition(textStartPosition: number): void {
    this.textStartPosition = textStartPosition;
  }

  /**
   * 줄의 세로 위치를 반환한다.
   *
   * @return 줄의 세로 위치
   */
  getLineVerticalPosition(): number {
    return this.lineVerticalPosition;
  }

  /**
   * 줄의 세로 위치를 설정한다.
   *
   * @param lineVerticalPosition 줄의 세로 위치
   */
  setLineVerticalPosition(lineVerticalPosition: number): void {
    this.lineVerticalPosition = lineVerticalPosition;
  }

  /**
   * 줄의 높이를 반환한다.
   *
   * @return 줄의 높이
   */
  getLineHeight(): number {
    return this.lineHeight;
  }

  /**
   * 줄의 높이를 설정한다.
   *
   * @param lineHeight 줄의 높이
   */
  setLineHeight(lineHeight: number): void {
    this.lineHeight = lineHeight;
  }

  /**
   * 텍스트 부분의 높이를 반환한다.
   *
   * @return 텍스트 부분의 높이
   */
  getTextPartHeight(): number {
    return this.textPartHeight;
  }

  /**
   * 텍스트 부분의 높이를 설정한다.
   *
   * @param textPartHeight 텍스트 부분의 높이
   */
  setTextPartHeight(textPartHeight: number): void {
    this.textPartHeight = textPartHeight;
  }

  /**
   * 줄의 세로 위치에서 베이스라인까지 거리를 반환한다.
   *
   * @return 줄의 세로 위치에서 베이스라인까지 거리
   */
  getDistanceBaseLineToLineVerticalPosition(): number {
    return this.distanceBaseLineToLineVerticalPosition;
  }

  /**
   * 줄의 세로 위치에서 베이스라인까지 거리를 설정한다.
   *
   * @param distanceBaseLineToLineVerticalPosition 줄의 세로 위치에서 베이스라인까지 거리
   */
  setDistanceBaseLineToLineVerticalPosition(
    distanceBaseLineToLineVerticalPosition: number,
  ): void {
    this.distanceBaseLineToLineVerticalPosition = distanceBaseLineToLineVerticalPosition;
  }

  /**
   * 줄간격을 반환한다.
   *
   * @return 줄간격
   */
  getLineSpace(): number {
    return this.lineSpace;
  }

  /**
   * 줄간격을 설정한다.
   *
   * @param lineSpace 줄간격
   */
  setLineSpace(lineSpace: number): void {
    this.lineSpace = lineSpace;
  }

  /**
   * 컬럼에서의 시작 위치를 반환한다.
   *
   * @return 컬럼에서의 시작 위치
   */
  getStartPositionFromColumn(): number {
    return this.startPositionFromColumn;
  }

  /**
   * 컬럼에서의 시작 위치를 설정한다.
   *
   * @param startPositionFromColumn 컬럼에서의 시작 위치
   */
  setStartPositionFromColumn(startPositionFromColumn: number): void {
    this.startPositionFromColumn = startPositionFromColumn;
  }

  /**
   * 세그먼트의 폭을 반환한다.
   *
   * @return 세그먼트의 폭
   */
  getSegmentWidth(): number {
    return this.segmentWidth;
  }

  /**
   * 세그먼트의 폭을 설정한다.
   *
   * @param segmentWidth 세그먼트의 폭
   */
  setSegmentWidth(segmentWidth: number): void {
    this.segmentWidth = segmentWidth;
  }

  /**
   * tag 정보에 대한 객체를 반환한다.
   *
   * @return tag 정보에 대한 객체
   */
  getTag(): LineSegItemTag {
    return this.tag;
  }

  clone(): LineSegItem {
    const cloned = new LineSegItem();
    cloned.textStartPosition = this.textStartPosition;
    cloned.lineVerticalPosition = this.lineVerticalPosition;
    cloned.lineHeight = this.lineHeight;
    cloned.textPartHeight = this.textPartHeight;
    cloned.distanceBaseLineToLineVerticalPosition = this.distanceBaseLineToLineVerticalPosition;
    cloned.lineSpace = this.lineSpace;
    cloned.startPositionFromColumn = this.startPositionFromColumn;
    cloned.segmentWidth = this.segmentWidth;
    cloned.tag.copy(this.tag);
    return cloned;
  }
}
