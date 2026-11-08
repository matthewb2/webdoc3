/**
 * 글자 위치와 글자 모양의 쌍
 *
 * @author neolord
 */
export class CharPositionShapeIdPair {
  /**
   * 글자 모양이 바뀌는 시작 위치
   */
  private position = 0;
  /**
   * 글자 모양 ID
   */
  private shapeId = 0;

  /**
   * 생성자
   *
   * @param position 글자 모양이 바뀌는 시작 위치
   * @param shapeId  글자 모양 ID
   */
  constructor(position?: number, shapeId?: number) {
    if (position !== undefined && shapeId !== undefined) {
      this.position = position;
      this.shapeId = shapeId;
    }
  }

  /**
   * 글자 모양이 바뀌는 시작 위치를 반환한다.
   *
   * @return 글자 모양이 바뀌는 시작 위치
   */
  getPosition(): number {
    return this.position;
  }

  /**
   * 글자 모양이 바뀌는 시작 위치를 설정한다.
   *
   * @param position 글자 모양이 바뀌는 시작 위치
   */
  setPosition(position: number): void {
    this.position = position;
  }

  /**
   * 참조된 글자 모양 ID를 반환한다.
   *
   * @return 참조된 글자 모양 ID
   */
  getShapeId(): number {
    return this.shapeId;
  }

  /**
   * 참조된 글자 모양 ID를 설정한다.
   *
   * @param shapeId 참조된 글자 모양 ID
   */
  setShapeId(shapeId: number): void {
    this.shapeId = shapeId;
  }

  clone(): CharPositionShapeIdPair {
    const cloned = new CharPositionShapeIdPair();
    cloned.position = this.position;
    cloned.shapeId = this.shapeId;
    return cloned;
  }
}
