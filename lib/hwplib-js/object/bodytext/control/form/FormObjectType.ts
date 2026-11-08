/**
 * A valued enum: each member's value is its control id — the 32-bit value the Java source
 * computes via `CtrlID.make(a, b, c, d)` over the four ASCII characters shown in each member's
 * comment. The values are inlined as literals here so the enum stays self-contained; the comment
 * records the original `CtrlID.make(...)` call for diffing.
 */
export enum FormObjectType {
  /**
   * 양식개체_명령단추
   */
  PushButton = 0x2b706274, // CtrlID.make('+', 'p', 'b', 't')
  /**
   * 양식개체_선택상자
   */
  CheckBox = 0x2b636274, // CtrlID.make('+', 'c', 'b', 't')
  /**
   * 양식개체_목록상자
   */
  ComboBox = 0x2b636f62, // CtrlID.make('+', 'c', 'o', 'b')
  /**
   * 양식개체_라디오단추
   */
  RadioButton = 0x2b726274, // CtrlID.make('+', 'r', 'b', 't')
  /**
   * 양식개체_입력상자
   */
  EditorBox = 0x2b656474, // CtrlID.make('+', 'e', 'd', 't')
}

export namespace FormObjectType {
  /**
   * 컨트롤 id를 반환한다.
   *
   * @return 컨트롤 id
   */
  export function getId(fot: FormObjectType): number {
    return fot;
  }

  export function fromUint4(id: number): FormObjectType | null {
    return (FormObjectType as Record<number, string | undefined>)[id] !== undefined
      ? (id as FormObjectType)
      : null;
  }
}
