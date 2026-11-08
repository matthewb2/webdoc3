import { LineInfoProperty } from "../shapecomponent/lineinfo/LineInfoProperty.js";
import { ShapeComponentOLEProperty } from "./ole/ShapeComponentOLEProperty.js";
import { Color4Byte } from "../../../../etc/Color4Byte.js";

/**
 * OLE 개체 속성 레코드
 * Ported from hwplib's
 * `object.bodytext.control.gso.shapecomponenteach.ShapeComponentOLE`.
 *
 * @author neolord
 */
export class ShapeComponentOLE {
  /**
   * 속성
   */
  private property: ShapeComponentOLEProperty;
  /**
   * 오브젝트 자체의 extent x크기
   */
  private extentWidth: number = 0;
  /**
   * 오브젝트 자체의 extent y크기
   */
  private extentHeight: number = 0;
  /**
   * 오브젝트가 사용하는 스토리지의 BinData ID
   */
  private binDataId: number = 0;
  /**
   * 테두리 색
   */
  private borderColor: Color4Byte;
  /**
   * 테두리 두꼐
   */
  private borderThickness: number = 0;
  /**
   * 테두리 속성
   */
  private borderProperty: LineInfoProperty;
  /**
   * 알 수 없는 데이터
   */
  private unknown: Uint8Array | null = null;

  /**
   * 생성자
   */
  public constructor() {
    this.property = new ShapeComponentOLEProperty();
    this.borderColor = new Color4Byte();
    this.borderProperty = new LineInfoProperty();
  }

  /**
   * 속성 객체를 반환한다.
   *
   * @return 속성 객체
   */
  public getProperty(): ShapeComponentOLEProperty {
    return this.property;
  }

  /**
   * 오브젝트 자체의 extent x크기를 반환한다.
   *
   * @return 오브젝트 자체의 extent x크기
   */
  public getExtentWidth(): number {
    return this.extentWidth;
  }

  /**
   * 오브젝트 자체의 extent x크기를 설정한다.
   *
   * @param extentWidth 오브젝트 자체의 extent x크기
   */
  public setExtentWidth(extentWidth: number): void {
    this.extentWidth = extentWidth;
  }

  /**
   * 오브젝트 자체의 extent y크기를 반환한다.
   *
   * @return 오브젝트 자체의 extent y크기
   */
  public getExtentHeight(): number {
    return this.extentHeight;
  }

  /**
   * 오브젝트 자체의 extent y크기를 설정한다.
   *
   * @param extentHeight 오브젝트 자체의 extent y크기
   */
  public setExtentHeight(extentHeight: number): void {
    this.extentHeight = extentHeight;
  }

  /**
   * 오브젝트가 사용하는 스토리지의 BinData ID를 반환한다.
   *
   * @return 오브젝트가 사용하는 스토리지의 BinData ID
   */
  public getBinDataId(): number {
    return this.binDataId;
  }

  /**
   * 오브젝트가 사용하는 스토리지의 BinData ID를 설정한다.
   *
   * @param binDataId 오브젝트가 사용하는 스토리지의 BinData ID
   */
  public setBinDataId(binDataId: number): void {
    this.binDataId = binDataId;
  }

  /**
   * 테두리 색상 객체를 반환한다.
   *
   * @return 테두리 색상 객체
   */
  public getBorderColor(): Color4Byte {
    return this.borderColor;
  }

  /**
   * 테두리 두꼐를 반환한다.
   *
   * @return 테두리 두꼐
   */
  public getBorderThickness(): number {
    return this.borderThickness;
  }

  /**
   * 테두리 두꼐를 설정한다.
   *
   * @param borderThickness 테두리 두꼐
   */
  public setBorderThickness(borderThickness: number): void {
    this.borderThickness = borderThickness;
  }

  /**
   * 알 수 없는 데이터를 반환한다.
   *
   * @return 알 수 없는 데이터
   */
  public getUnknown(): Uint8Array | null {
    return this.unknown;
  }

  /**
   * 알 수 없는 데이터를 설정한다.
   *
   * @param unknown
   */
  public setUnknown(unknown: Uint8Array | null): void {
    this.unknown = unknown;
  }

  /**
   * 테두리 속성 객체를 반환한다.
   *
   * @return 테두리 속성 객체
   */
  public getBorderProperty(): LineInfoProperty {
    return this.borderProperty;
  }

  public copy(from: ShapeComponentOLE): void {
    this.property.copy(from.property);
    this.extentWidth = from.extentWidth;
    this.extentHeight = from.extentHeight;
    this.binDataId = from.binDataId;
    this.borderColor.copy(from.borderColor);
    this.borderThickness = from.borderThickness;
    this.borderProperty.copy(from.borderProperty);

    if (from.unknown != null) {
      this.unknown = from.unknown.slice();
    } else {
      this.unknown = null;
    }
  }
}
