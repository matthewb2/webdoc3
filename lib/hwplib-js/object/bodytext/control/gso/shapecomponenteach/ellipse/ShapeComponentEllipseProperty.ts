import { ArcType } from "../arc/ArcType.js";
import { BitFlag } from "../../../../../../util/binary/BitFlag.js";

/**
 * 타원 개체의 속성을 나타내는 객체
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ellipse.ShapeComponentEllipseProperty`.
 *
 * @author neolord
 */
export class ShapeComponentEllipseProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 4 byte)
   */
  private value: number = 0;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 파일에 저장되는 정수값을 반환한다.
   *
   * @return 파일에 저장되는 정수값
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * 파일에 저장되는 정수값을 설정한다.
   *
   * @param value 파일에 저장되는 정수값
   */
  public setValue(value: number): void {
    this.value = value;
  }

  /**
   * 호(ARC)로 바뀌었을 때 interval을 다시 계산해야 할 필요가 있는지 여부를 반환한다. (0 bit)
   *
   * @return 호(ARC)로 바뀌었을 때 interval을 다시 계산해야 할 필요가 있는지 여부
   */
  public isRecalculateIntervalWhenChangingArc(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 호(ARC)로 바뀌었을 때 interval을 다시 계산해야 할 필요가 있는지 여부를 설정한다. (0 bit)
   *
   * @param recalculateIntervalWhenChanging 호(ARC)로 바뀌었을 때 interval을 다시 계산해야 할 필요가 있는지 여부
   */
  public setRecalculateIntervalWhenChangingArc(
    recalculateIntervalWhenChanging: boolean,
  ): void {
    this.value = BitFlag.set(this.value, 0, recalculateIntervalWhenChanging);
  }

  /**
   * 호(ARC)로 바뀌었는지 여부를 반환한다. (1 bit)
   *
   * @return 호(ARC)로 바뀌었는지 여부
   */
  public isChangeArc(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 호(ARC)로 바뀌었는지 여부를 설정한다. (1 bit)
   *
   * @param changeArc 호(ARC)로 바뀌었는지 여부
   */
  public setChangeArc(changeArc: boolean): void {
    this.value = BitFlag.set(this.value, 1, changeArc);
  }

  /**
   * 호(ARC)의 타입를 반환한다. (2~9 bit)
   *
   * @return 호(ARC)의 타입
   */
  public getArcType(): ArcType {
    return ArcType.valueOf(BitFlag.getRange(this.value, 2, 9));
  }

  /**
   * 호(ARC)의 타입를 설정한다. (2~9 bit)
   *
   * @param arcType 호(ARC)의 타입
   */
  public setArcType(arcType: ArcType): void {
    this.value = BitFlag.setRange(this.value, 2, 9, ArcType.getValue(arcType));
  }

  public copy(from: ShapeComponentEllipseProperty): void {
    this.value = from.value;
  }
}
