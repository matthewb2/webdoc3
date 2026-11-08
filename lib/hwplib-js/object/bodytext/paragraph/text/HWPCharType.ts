/**
 * 한글(HWP) 글자의 종류
 *
 * Ported from hwplib `object.bodytext.paragraph.text.HWPCharType` (plain enum).
 *
 * @author neolord
 */
export enum HWPCharType {
  /**
   * 일반
   */
  Normal,
  /**
   * 문자 컨트롤
   */
  ControlChar,
  /**
   * 인라인 컨트롤
   */
  ControlInline,
  /**
   * 확장 컨트롤
   */
  ControlExtend,
}
