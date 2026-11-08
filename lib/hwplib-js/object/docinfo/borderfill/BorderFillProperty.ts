import { BitFlag } from "../../../util/binary/BitFlag.js";
import { SlashDiagonalShape } from "./SlashDiagonalShape.js";
import { BackSlashDiagonalShape } from "./BackSlashDiagonalShape.js";
import { CenterLineSort } from "./CenterLineSort.js";

/**
 * 테두리/배경 객체의 속성
 * Ported from hwplib's `object.docinfo.borderfill.BorderFillProperty`.
 *
 * @author neolord
 */
export class BorderFillProperty {
  /**
   * 파일에 저장되는 정수값(unsigned 2 byte)
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
   * 3D 효과의 유무를 반한한다.(0 bit)
   *
   * @return 3D 효과의 유무를
   */
  public is3DEffect(): boolean {
    return BitFlag.get(this.value, 0);
  }

  /**
   * 3D 효과의 유무를 설정한다.(0 bit)
   *
   * @param _3DEffect 3D 효과의 유무
   */
  public set3DEffect(_3DEffect: boolean): void {
    this.value = BitFlag.set(this.value, 0, _3DEffect);
  }

  /**
   * 그림자 효과의 유무를 반환한다. (1 bit)
   *
   * @return 그림자 효과의 유무
   */
  public isShadowEffect(): boolean {
    return BitFlag.get(this.value, 1);
  }

  /**
   * 그림자 효과의 유무를 설정한다. (1 bit)
   *
   * @param shadowEffect
   */
  public setShadowEffect(shadowEffect: boolean): void {
    this.value = BitFlag.set(this.value, 1, shadowEffect);
  }

  /**
   * Slash 대각선 모양을 반환한다.(2~4 BitFlag)
   *
   * @return Slash 대각선 모양
   */
  public getSlashDiagonalShape(): SlashDiagonalShape {
    return SlashDiagonalShape.valueOf(BitFlag.getRange(this.value, 2, 4));
  }

  /**
   * Slash 대각선 모양를 설정한다. (2~4 BitFlag)
   *
   * @param diagonaShape Slash 대각선 모양
   */
  public setSlashDiagonalShape(diagonaShape: SlashDiagonalShape): void {
    this.value = BitFlag.setRange(this.value, 2, 4, diagonaShape);
  }

  /**
   * BackSlash 대각선 모양을 반환한다. (5~7 BitFlag)
   *
   * @return BackSlash 대각선 모양
   */
  public getBackSlashDiagonalShape(): BackSlashDiagonalShape {
    return BackSlashDiagonalShape.valueOf(BitFlag.getRange(this.value, 5, 7));
  }

  /**
   * BackSlash 대각선 모양를 설정한다. (5~7 BitFlag)
   *
   * @param diagonaShape BackSlash 대각선 모양
   */
  public setBackSlashDiagonalShape(diagonaShape: BackSlashDiagonalShape): void {
    this.value = BitFlag.setRange(this.value, 5, 7, diagonaShape);
  }

  /**
   * Slash 대각선이 꺽은선인지 아닌지 여부를 반환한다. (8~9 BitFlag)
   *
   * @return Slash 대각선이 꺽은선인지 아닌지 여부
   */
  public isBrokenSlashDiagonal(): boolean {
    return BitFlag.get(this.value, 8) || BitFlag.get(this.value, 9);
  }

  /**
   * Slash 대각선이 꺽은선인지 아닌지 여부를 설정한다. (8~9 BitFlag)
   *
   * @param brokenSlashDiagonal Slash 대각선이 꺽은선인지 아닌지 여부
   */
  public setBrokenSlashDiagonal(brokenSlashDiagonal: boolean): void {
    this.value = BitFlag.set(this.value, 8, brokenSlashDiagonal);
    this.value = BitFlag.set(this.value, 9, brokenSlashDiagonal);
  }

  /**
   * BackSlash 대각선이 꺽은선인지 아닌지 여부를 반환한다. (10 bit)
   *
   * @return BackSlash 대각선이 꺽은선인지 아닌지 여부
   */
  public isBrokenBackSlashDiagonal(): boolean {
    return BitFlag.get(this.value, 10);
  }

  /**
   * BackSlash 대각선이 꺽은선인지 아닌지 여부를 설정한다. (10 bit)
   *
   * @param brokenBackSlashDiagonal BackSlash 대각선이 꺽은선인지 아닌지 여부
   */
  public setBrokenBackSlashDiagonal(brokenBackSlashDiagonal: boolean): void {
    this.value = BitFlag.set(this.value, 10, brokenBackSlashDiagonal);
  }

  /**
   * Slash 대각선의 180도 회전 여부를 반환한다. (11 bit)
   *
   * @return Slash 대각선의 180도 회전 여부
   */
  public isRotateSlashDiagonal180(): boolean {
    return BitFlag.get(this.value, 11);
  }

  /**
   * Slash 대각선의 180도 회전 여부를 설정한다 (11 bit)
   *
   * @param rotateSlashDiagonal180 Slash 대각선의 180도 회전 여부
   */
  public setRotateSlashDiagonal180(rotateSlashDiagonal180: boolean): void {
    this.value = BitFlag.set(this.value, 11, rotateSlashDiagonal180);
  }

  /**
   * BackSlash 대각선의 180도 회전 여부를 반환한다. (12 bit)
   *
   * @return BackSlash 대각선의 180도 회전 여부
   */
  public isRotateBackSlashDiagonal180(): boolean {
    return BitFlag.get(this.value, 12);
  }

  /**
   * BackSlash 대각선의 180도 회전 여부를 설정한다. (12 bit)
   *
   * @param rotateBackSlashDiagonal180 BackSlash 대각선의 180도 회전 여부
   */
  public setRotateBackSlashDiagonal180(rotateBackSlashDiagonal180: boolean): void {
    this.value = BitFlag.set(this.value, 12, rotateBackSlashDiagonal180);
  }

  /**
   * 중심선을 가졌는지 여부를 반환한다. (13 bit)
   *
   * @return 중심선을 가졌는지 여부
   */
  public hasCenterLine(): boolean {
    return BitFlag.get(this.value, 13);
  }

  /**
   * 중심선을 가졌는지 여부를 설정한다. (13 bit)
   *
   * @param hasCenterLine 중심선을 가졌는지 여부를
   */
  public setHasCenterLine(hasCenterLine: boolean): void {
    this.value = BitFlag.set(this.value, 13, hasCenterLine);
  }

  public getCenterLineSort(): CenterLineSort {
    return CenterLineSort.valueOf(BitFlag.getRange(this.value, 8, 9));
  }

  public setCenterLineSort(centerLineSort: CenterLineSort): void {
    this.value = BitFlag.setRange(this.value, 8, 9, centerLineSort);
  }

  public copy(from: BorderFillProperty): void {
    this.value = from.value;
  }
}
