/**
 * Control type, ported from hwplib's `object.bodytext.control.ControlType`.
 *
 * A valued enum: each member's value is its control id — the 32-bit value the Java source
 * computes via `CtrlID.make(a, b, c, d)` = `(a << 24) | (b << 16) | (c << 8) | d` over the four
 * ASCII characters shown in each member's comment. The values are inlined as literals here so the
 * enum stays self-contained; the comment records the original `CtrlID.make(...)` call for diffing.
 */
export enum ControlType {
  Table = 0x74626c20, // CtrlID.make('t', 'b', 'l', ' ')
  Gso = 0x67736f20, // CtrlID.make('g', 's', 'o', ' ')
  Equation = 0x65716564, // CtrlID.make('e', 'q', 'e', 'd')
  SectionDefine = 0x73656364, // CtrlID.make('s', 'e', 'c', 'd')
  ColumnDefine = 0x636f6c64, // CtrlID.make('c', 'o', 'l', 'd')
  Header = 0x68656164, // CtrlID.make('h', 'e', 'a', 'd')
  Footer = 0x666f6f74, // CtrlID.make('f', 'o', 'o', 't')
  Footnote = 0x666e2020, // CtrlID.make('f', 'n', ' ', ' ')
  Endnote = 0x656e2020, // CtrlID.make('e', 'n', ' ', ' ')
  AutoNumber = 0x61746e6f, // CtrlID.make('a', 't', 'n', 'o')
  NewNumber = 0x6e776e6f, // CtrlID.make('n', 'w', 'n', 'o')
  PageHide = 0x70676864, // CtrlID.make('p', 'g', 'h', 'd')
  PageOddEvenAdjust = 0x70676374, // CtrlID.make('p', 'g', 'c', 't')
  PageNumberPosition = 0x70676e70, // CtrlID.make('p', 'g', 'n', 'p')
  IndexMark = 0x6964786d, // CtrlID.make('i', 'd', 'x', 'm')
  Bookmark = 0x626f6b6d, // CtrlID.make('b', 'o', 'k', 'm')
  OverlappingLetter = 0x74637073, // CtrlID.make('t', 'c', 'p', 's')
  AdditionalText = 0x74647574, // CtrlID.make('t', 'd', 'u', 't')
  HiddenComment = 0x74636d74, // CtrlID.make('t', 'c', 'm', 't')
  Form = 0x666f726d, // CtrlID.make('f', 'o', 'r', 'm')

  FIELD_UNKNOWN = 0x25756e6b, // CtrlID.make('%', 'u', 'n', 'k')
  FIELD_DATE = 0x25647465, // CtrlID.make('%', 'd', 't', 'e')
  FIELD_DOCDATE = 0x25646474, // CtrlID.make('%', 'd', 'd', 't')
  FIELD_PATH = 0x25706174, // CtrlID.make('%', 'p', 'a', 't')
  FIELD_BOOKMARK = 0x25626d6b, // CtrlID.make('%', 'b', 'm', 'k')
  FIELD_MAILMERGE = 0x256d6d67, // CtrlID.make('%', 'm', 'm', 'g')
  FIELD_CROSSREF = 0x25787266, // CtrlID.make('%', 'x', 'r', 'f')
  FIELD_FORMULA = 0x25666d75, // CtrlID.make('%', 'f', 'm', 'u')
  FIELD_CLICKHERE = 0x25636c6b, // CtrlID.make('%', 'c', 'l', 'k')
  FIELD_SUMMARY = 0x25736d72, // CtrlID.make('%', 's', 'm', 'r')
  FIELD_USERINFO = 0x25757372, // CtrlID.make('%', 'u', 's', 'r')
  FIELD_HYPERLINK = 0x25686c6b, // CtrlID.make('%', 'h', 'l', 'k')
  FIELD_REVISION_SIGN = 0x25736967, // CtrlID.make('%', 's', 'i', 'g')
  FIELD_REVISION_DELETE = 0x25252a64, // CtrlID.make('%', '%', '*', 'd')
  FIELD_REVISION_ATTACH = 0x25252a61, // CtrlID.make('%', '%', '*', 'a')
  FIELD_REVISION_CLIPPING = 0x25252a43, // CtrlID.make('%', '%', '*', 'C')
  FIELD_REVISION_THINKING = 0x25252a54, // CtrlID.make('%', '%', '*', 'T')
  FIELD_REVISION_PRAISE = 0x25252a50, // CtrlID.make('%', '%', '*', 'P')
  FIELD_REVISION_LINE = 0x25252a4c, // CtrlID.make('%', '%', '*', 'L')
  FIELD_REVISION_SIMPLECHANGE = 0x25252a63, // CtrlID.make('%', '%', '*', 'c')
  FIELD_REVISION_HYPERLINK = 0x25252a68, // CtrlID.make('%', '%', '*', 'h')
  FIELD_REVISION_LINEATTACH = 0x25252a41, // CtrlID.make('%', '%', '*', 'A')
  FIELD_REVISION_LINELINK = 0x25252a69, // CtrlID.make('%', '%', '*', 'i')
  FIELD_REVISION_LINETRANSFER = 0x25252a74, // CtrlID.make('%', '%', '*', 't')
  FIELD_REVISION_RIGHTMOVE = 0x25252a72, // CtrlID.make('%', '%', '*', 'r')
  FIELD_REVISION_LEFTMOVE = 0x25252a6c, // CtrlID.make('%', '%', '*', 'l')
  FIELD_REVISION_TRANSFER = 0x25252a6e, // CtrlID.make('%', '%', '*', 'n')
  FIELD_REVISION_SIMPLEINSERT = 0x25252a65, // CtrlID.make('%', '%', '*', 'e')
  FIELD_REVISION_SPLIT = 0x2573706c, // CtrlID.make('%', 's', 'p', 'l')
  FIELD_REVISION_CHANGE = 0x25256d72, // CtrlID.make('%', '%', 'm', 'r')
  FIELD_MEMO = 0x25256d65, // CtrlID.make('%', '%', 'm', 'e')
  FIELD_PRIVATE_INFO_SECURITY = 0x25637072, // CtrlID.make('%', 'c', 'p', 'r')
  FIELD_TABLEOFCONTENTS = 0x25746f63, // CtrlID.make('%', 't', 'o', 'c')
}

export namespace ControlType {
  /** Java ControlType.ctrlIdOf(ctrlId): the matching constant, or Table when the id is unknown. */
  export function ctrlIdOf(ctrlId: number): ControlType {
    return (ControlType as Record<number, string | undefined>)[ctrlId] !== undefined
      ? (ctrlId as ControlType)
      : ControlType.Table;
  }

  /** Java getCtrlId(): the stored control id (identity, since the member value IS the id). */
  export function getCtrlId(ct: ControlType): number {
    return ct;
  }

  /** Java ControlType.isField(ctrlId): whether the given control id is a field control. */
  export function isField(ctrlId: number): boolean {
    return (
      ctrlId === ControlType.FIELD_UNKNOWN ||
      ctrlId === ControlType.FIELD_DATE ||
      ctrlId === ControlType.FIELD_DOCDATE ||
      ctrlId === ControlType.FIELD_PATH ||
      ctrlId === ControlType.FIELD_BOOKMARK ||
      ctrlId === ControlType.FIELD_MAILMERGE ||
      ctrlId === ControlType.FIELD_CROSSREF ||
      ctrlId === ControlType.FIELD_FORMULA ||
      ctrlId === ControlType.FIELD_CLICKHERE ||
      ctrlId === ControlType.FIELD_SUMMARY ||
      ctrlId === ControlType.FIELD_USERINFO ||
      ctrlId === ControlType.FIELD_HYPERLINK ||
      ctrlId === ControlType.FIELD_REVISION_SIGN ||
      ctrlId === ControlType.FIELD_REVISION_DELETE ||
      ctrlId === ControlType.FIELD_REVISION_ATTACH ||
      ctrlId === ControlType.FIELD_REVISION_CLIPPING ||
      ctrlId === ControlType.FIELD_REVISION_THINKING ||
      ctrlId === ControlType.FIELD_REVISION_PRAISE ||
      ctrlId === ControlType.FIELD_REVISION_LINE ||
      ctrlId === ControlType.FIELD_REVISION_SIMPLECHANGE ||
      ctrlId === ControlType.FIELD_REVISION_HYPERLINK ||
      ctrlId === ControlType.FIELD_REVISION_LINEATTACH ||
      ctrlId === ControlType.FIELD_REVISION_LINELINK ||
      ctrlId === ControlType.FIELD_REVISION_LINETRANSFER ||
      ctrlId === ControlType.FIELD_REVISION_RIGHTMOVE ||
      ctrlId === ControlType.FIELD_REVISION_LEFTMOVE ||
      ctrlId === ControlType.FIELD_REVISION_TRANSFER ||
      ctrlId === ControlType.FIELD_REVISION_SIMPLEINSERT ||
      ctrlId === ControlType.FIELD_REVISION_SPLIT ||
      ctrlId === ControlType.FIELD_REVISION_CHANGE ||
      ctrlId === ControlType.FIELD_MEMO ||
      ctrlId === ControlType.FIELD_PRIVATE_INFO_SECURITY ||
      ctrlId === ControlType.FIELD_TABLEOFCONTENTS
    );
  }
}
