/**
 * 인스턴스 id을 구하기 위한 객체
 *
 * @author neolord
 */
export class InstanceID {
  private static readonly START_OBJECT_ID = 0x5bb840e1;

  private id: number;

  constructor() {
    this.id = InstanceID.START_OBJECT_ID;
  }

  /**
   * 인스턴스 id을 반환한다.
   *
   * @return 인스턴스 id
   */
  get(): number {
    return this.id++;
  }
}
