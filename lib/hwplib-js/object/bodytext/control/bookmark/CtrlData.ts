import { ParameterSet } from "./ParameterSet.js";

/**
 * 임의 데이터 레코드
 *
 * @author neolord
 */
export class CtrlData {
  /**
   * 파라미터 셋
   */
  private parameterSet: ParameterSet;

  /**
   * 생성자
   */
  public constructor() {
    this.parameterSet = new ParameterSet();
  }

  /**
   * 파라미터 셋을 반환한다.
   *
   * @return 파라미터 셋
   */
  public getParameterSet(): ParameterSet {
    return this.parameterSet;
  }

  public copy(from: CtrlData): void {
    this.parameterSet.copy(from.parameterSet);
  }
}
