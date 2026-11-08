/**
 * 컨트롤 헤더 객체들을 위한 부모 클래스
 *
 * @author neolord
 */
export abstract class CtrlHeader {
  /**
   * 컨트롤 아이디
   */
  protected ctrlId: number;

  /**
   * 생성자
   *
   * @param ctrlId 컨트롤 아이디
   */
  constructor(ctrlId: number) {
    this.ctrlId = ctrlId;
  }

  /**
   * 컨트롤 아이디를 반환한다.
   *
   * @return 컨트롤 아이디
   */
  getCtrlId(): number {
    return this.ctrlId;
  }

  abstract copy(from: CtrlHeader): void;
}
