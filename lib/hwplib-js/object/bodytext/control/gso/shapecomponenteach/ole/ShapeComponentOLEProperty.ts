import { BitFlag } from "../../../../../../util/binary/BitFlag.js";
import { DVASPECT } from "./DVASPECT.js";
import { ObjectSort } from "./ObjectSort.js";

/**
 * OLE 개체의 속성에 대한 객체
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ole.ShapeComponentOLEProperty`.
 *
 * @author neolord
 */
export class ShapeComponentOLEProperty {
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
   * DVASPECT값을 반환한다.
   *
   * @return DVASPECT값
   */
  public getDVASPECT(): DVASPECT {
    return DVASPECT.valueOf(BitFlag.getRange(this.value, 0, 7));
  }

  /**
   * DVASPECT값를 설정한다.
   *
   * @param dvaspect DVASPECT값
   */
  public setDVASPECT(dvaspect: DVASPECT): void {
    this.value = BitFlag.setRange(this.value, 0, 7, DVASPECT.getValue(dvaspect));
  }

  /**
   * moniker가 지정되었는지 여부를 반환한다.
   *
   * @return moniker가 지정되었는지 여부
   */
  public isMoniker(): boolean {
    return BitFlag.get(this.value, 8);
  }

  /**
   * moniker가 지정되었는지 여부를 설정한다.
   *
   * @param moniker moniker가 지정되었는지 여부
   */
  public setMoniker(moniker: boolean): void {
    this.value = BitFlag.set(this.value, 8, moniker);
  }

  /**
   * 베이스라인 값을 반환한다. 0은 디폴트(85%)를 뜻하고, 1～101이 0～100%를 나타낸다. 현재는 수식만이 베이스라인을 별도로
   * 가진다.
   *
   * @return 베이스라인 값
   */
  public getBaseLine(): number {
    return BitFlag.getRange(this.value, 9, 15);
  }

  /**
   * 베이스라인 값을 설정한다. 0은 디폴트(85%)를 뜻하고, 1～101이 0～100%를 나타낸다. 현재는 수식만이 베이스라인을 별도로
   * 가진다.
   *
   * @param baseLine 베이스라인 값
   */
  public setBaseLine(baseLine: number): void {
    this.value = BitFlag.setRange(this.value, 9, 15, baseLine);
  }

  /**
   * 개체 종류를 반환한다.
   *
   * @return 개체 종류
   */
  public getObjectSort(): ObjectSort {
    return ObjectSort.valueOf(BitFlag.getRange(this.value, 16, 21));
  }

  /**
   * 개체 종류를 설정한다.
   *
   * @param objectSort 개체 종류
   */
  public setObjectSort(objectSort: ObjectSort): void {
    this.value = BitFlag.setRange(this.value, 16, 21, ObjectSort.getValue(objectSort));
  }

  public copy(from: ShapeComponentOLEProperty): void {
    this.value = from.value;
  }
}
