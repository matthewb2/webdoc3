import { ControlType } from "../ControlType.js";
import type { HeaderFooterApplyPage } from "./header/HeaderFooterApplyPage.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 꼬리말 컨트롤을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderFooter extends CtrlHeader {
  /**
   * 꼬리말이 적용될 범위(페이지 종류)
   */
  private applyPage: HeaderFooterApplyPage | null = null;
  /**
   * 생성 순서 (??)
   */
  private createIndex = 0;

  /**
   * 생성자
   */
  constructor() {
    super(ControlType.Footer);
  }

  /**
   * "
   * 꼬리말이 적용될 범위를 반환한다.
   *
   * @return 꼬리말이 적용될 범위
   */
  getApplyPage(): HeaderFooterApplyPage | null {
    return this.applyPage;
  }

  /**
   * 꼬리말이 적용될 범위를 설정한다.
   *
   * @param applyPage 꼬리말이 적용될 범위
   */
  setApplyPage(applyPage: HeaderFooterApplyPage): void {
    this.applyPage = applyPage;
  }

  /**
   * 생성 순서를 반환한다.
   *
   * @return 생성 순서
   */
  getCreateIndex(): number {
    return this.createIndex;
  }

  /**
   * 생성 순서를 설정한다.
   *
   * @param createIndex 생성 순서
   */
  setCreateIndex(createIndex: number): void {
    this.createIndex = createIndex;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderFooter;
    this.applyPage = from2.applyPage;
    this.createIndex = from2.createIndex;
  }
}
