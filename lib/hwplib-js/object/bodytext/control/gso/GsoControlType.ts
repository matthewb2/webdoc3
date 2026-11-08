/**
 * 그리기 개체 타입, ported from hwplib's `object.bodytext.control.gso.GsoControlType`.
 *
 * A valued enum: each member's value is its gso id — the 32-bit value the Java source computes via
 * `CtrlID.make(a, b, c, d)` = `(a << 24) | (b << 16) | (c << 8) | d` over the four ASCII characters
 * shown in each member's comment. The values are inlined as literals here so the enum stays
 * self-contained; the comment records the original `CtrlID.make(...)` call for diffing.
 *
 * @author neolord
 */
export enum GsoControlType {
  /**
   * 선
   */
  Line = 0x246c696e, // CtrlID.make('$', 'l', 'i', 'n')
  /**
   * 사각형
   */
  Rectangle = 0x24726563, // CtrlID.make('$', 'r', 'e', 'c')
  /**
   * 타원
   */
  Ellipse = 0x24656c6c, // CtrlID.make('$', 'e', 'l', 'l')
  /**
   * 호
   */
  Arc = 0x24617263, // CtrlID.make('$', 'a', 'r', 'c')
  /**
   * 다각형
   */
  Polygon = 0x24706f6c, // CtrlID.make('$', 'p', 'o', 'l')
  /**
   * 곡선
   */
  Curve = 0x24637572, // CtrlID.make('$', 'c', 'u', 'r')
  /**
   * 그림
   */
  Picture = 0x24706963, // CtrlID.make('$', 'p', 'i', 'c')
  /**
   * OLE
   */
  OLE = 0x246f6c65, // CtrlID.make('$', 'o', 'l', 'e')
  /**
   * 묶음 객체
   */
  Container = 0x24636f6e, // CtrlID.make('$', 'c', 'o', 'n')
  /**
   * 객체 연결선
   */
  ObjectLinkLine = 0x24636f6c, // CtrlID.make('$', 'c', 'o', 'l')
  /**
   * 글맵시
   */
  TextArt = 0x24746174, // CtrlID.make('$', 't', 'a', 't')
  /**
   * 알 수 없는 개체
   */
  Unknown = 0x24756e6b, // CtrlID.make('$', 'u', 'n', 'k')
}

export namespace GsoControlType {
  /** Java getId(): the stored gso id (identity, since the member value IS the id). */
  export function getId(gct: GsoControlType): number {
    return gct;
  }

  /** Java GsoControlType.idOf(id): the matching constant, or Line when the id is unknown. */
  export function idOf(id: number): GsoControlType {
    return (GsoControlType as Record<number, string | undefined>)[id] !== undefined
      ? (id as GsoControlType)
      : GsoControlType.Line;
  }
}
