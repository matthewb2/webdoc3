import { ControlPoint } from "./objectlinkline/ControlPoint.js";
import type { LinkLineType } from "./objectlinkline/LinkLineType.js";

/**
 * 객체 연결선 컨트롤을 위한 선 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentLineForObjectLinkLine`.
 *
 * @author neolord
 */
export class ShapeComponentLineForObjectLinkLine {
  /**
   * 시작점 x 좌표
   */
  private startX: number = 0;
  /**
   * 시작점 y 좌표
   */
  private startY: number = 0;
  /**
   * 끝점 x 좌표
   */
  private endX: number = 0;
  /**
   * 끝점 y 좌표
   */
  private endY: number = 0;
  private type: LinkLineType | null = null;
  private startSubjectID: number = 0;
  private startSubjectIndex: number = 0;
  private endSubjectID: number = 0;
  private endSubjectIndex: number = 0;
  private controlPoints: ControlPoint[];

  /**
   * 생성자
   */
  public constructor() {
    this.controlPoints = [];
  }

  /**
   * 시작점 x 좌표를 반환한다.
   *
   * @return 시작점 x 좌표
   */
  public getStartX(): number {
    return this.startX;
  }

  /**
   * 시작점 x 좌표를 설정한다.
   *
   * @param startX 시작점 x 좌표
   */
  public setStartX(startX: number): void {
    this.startX = startX;
  }

  /**
   * 시작점 y 좌표를 반환한다.
   *
   * @return 시작점 y 좌표
   */
  public getStartY(): number {
    return this.startY;
  }

  /**
   * 시작점 y 좌표를 설정한다.
   *
   * @param startY 시작점 y 좌표
   */
  public setStartY(startY: number): void {
    this.startY = startY;
  }

  /**
   * 끝점 x 좌표를 반환한다.
   *
   * @return 끝점 x 좌표
   */
  public getEndX(): number {
    return this.endX;
  }

  /**
   * 끝점 x 좌표를 설정한다.
   *
   * @param endX 끝점 x 좌표
   */
  public setEndX(endX: number): void {
    this.endX = endX;
  }

  /**
   * 끝점 y 좌표를 반환한다.
   *
   * @return 끝점 y 좌표
   */
  public getEndY(): number {
    return this.endY;
  }

  /**
   * 끝점 y 좌표를 설정한다.
   *
   * @param endY 끝점 y 좌표
   */
  public setEndY(endY: number): void {
    this.endY = endY;
  }

  public getType(): LinkLineType | null {
    return this.type;
  }

  public setType(type: LinkLineType | null): void {
    this.type = type;
  }

  public getStartSubjectID(): number {
    return this.startSubjectID;
  }

  public setStartSubjectID(startSubjectID: number): void {
    this.startSubjectID = startSubjectID;
  }

  public getStartSubjectIndex(): number {
    return this.startSubjectIndex;
  }

  public setStartSubjectIndex(startSubjectIndex: number): void {
    this.startSubjectIndex = startSubjectIndex;
  }

  public getEndSubjectID(): number {
    return this.endSubjectID;
  }

  public setEndSubjectID(endSubjectID: number): void {
    this.endSubjectID = endSubjectID;
  }

  public getEndSubjectIndex(): number {
    return this.endSubjectIndex;
  }

  public setEndSubjectIndex(endSubjectIndex: number): void {
    this.endSubjectIndex = endSubjectIndex;
  }

  public addNewControlPoint(): ControlPoint {
    const newCP = new ControlPoint();
    this.controlPoints.push(newCP);
    return newCP;
  }

  public getControlPoints(): ControlPoint[] {
    return this.controlPoints;
  }

  public copy(from: ShapeComponentLineForObjectLinkLine): void {
    this.startX = from.startX;
    this.startY = from.startY;
    this.endX = from.endX;
    this.endY = from.endY;
    this.type = from.type;
    this.startSubjectID = from.startSubjectID;
    this.startSubjectIndex = from.startSubjectIndex;
    this.endSubjectID = from.endSubjectID;
    this.endSubjectIndex = from.endSubjectIndex;

    for (const fromCP of from.controlPoints) {
      this.addNewControlPoint().copy(fromCP);
    }
  }
}
