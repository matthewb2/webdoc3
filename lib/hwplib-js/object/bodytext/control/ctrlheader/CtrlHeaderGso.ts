import { ControlType } from "../ControlType.js";
import { GsoHeaderProperty } from "./gso/GsoHeaderProperty.js";
import { HWPString } from "../../../etc/HWPString.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 그리기 개체을 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderGso extends CtrlHeader {
  /**
   * 속성
   */
  private property: GsoHeaderProperty;
  /**
   * 세로 오프셋 값
   */
  private yOffset = 0;
  /**
   * 가로 오프셋 값
   */
  private xOffset = 0;
  /**
   * 오브젝트의 폭
   */
  private width = 0;
  /**
   * 오브젝트의 높이
   */
  private height = 0;
  /**
   * z-order
   */
  private zOrder = 0;
  /**
   * 오브젝트의 바깥 왼쪾 여백
   */
  private outterMarginLeft = 0;
  /**
   * 오브젝트의 바깥 오른쪽 여백
   */
  private outterMarginRight = 0;
  /**
   * 오브젝트의 바깥 위쪽 여백
   */
  private outterMarginTop = 0;
  /**
   * 오브젝트의 바깥 아래쪽 여백
   */
  private outterMarginBottom = 0;
  /**
   * 문서 내 각 개체에 대한 고유 아이디
   */
  private instanceId = 0;
  /**
   * 쪽나눔 방지 on(1) / off(0) = (객체와 조판 부호를 항상 같은 쪽에 넣기) ??
   */
  private preventPageDivide = false;
  /**
   * 개체 설명문
   */
  private explanation: HWPString;
  /**
   * 알 수 없는 바이트 : 2024 버전에서...
   */
  private unknown: Uint8Array | null = null;

  /**
   * 생성자
   *
   * @param controlType 컨트롤 타입
   */
  constructor(controlType: ControlType = ControlType.Gso) {
    super(controlType);

    this.property = new GsoHeaderProperty();
    this.explanation = new HWPString();
    this.unknown = null;
  }

  /**
   * 그리기 객체 컨트롤의 속성 객체를 반환한다.
   *
   * @return 그리기 객체 컨트롤의 속성 객체
   */
  getProperty(): GsoHeaderProperty {
    return this.property;
  }

  /**
   * 세로 오프셋 값을 반환한다.
   *
   * @return 세로 오프셋 값
   */
  getyOffset(): number {
    return this.yOffset;
  }

  /**
   * 세로 오프셋 값을 설정한다.
   *
   * @param yOffset 세로 오프셋 값
   */
  setyOffset(yOffset: number): void {
    this.yOffset = yOffset;
  }

  /**
   * 가로 오프셋 값을 반환한다.
   *
   * @return 가로 오프셋 값
   */
  getxOffset(): number {
    return this.xOffset;
  }

  /**
   * 가로 오프셋 값을 설정한다.
   *
   * @param xOffset 가로 오프셋 값
   */
  setxOffset(xOffset: number): void {
    this.xOffset = xOffset;
  }

  /**
   * 오브젝트의 폭을 반환한다.
   *
   * @return 오브젝트의 폭
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * 오브젝트의 폭를 설정한다.
   *
   * @param width 오브젝트의 폭
   */
  setWidth(width: number): void {
    this.width = width;
  }

  /**
   * 오브젝트의 높이를 반환한다.
   *
   * @return 오브젝트의 높이
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * 오브젝트의 높이를 설정한다.
   *
   * @param height 오브젝트의 높이
   */
  setHeight(height: number): void {
    this.height = height;
  }

  /**
   * z-order을 반환한다.
   *
   * @return z-order
   */
  getzOrder(): number {
    return this.zOrder;
  }

  /**
   * z-order을 설정한다.
   *
   * @param zOrder z-order
   */
  setzOrder(zOrder: number): void {
    this.zOrder = zOrder;
  }

  /**
   * 오브젝트의 바깥 왼쪾 여백을 반환한다.
   *
   * @return 오브젝트의 바깥 왼쪾 여백
   */
  getOutterMarginLeft(): number {
    return this.outterMarginLeft;
  }

  /**
   * 오브젝트의 바깥 왼쪾 여백을 설정한다.
   *
   * @param outterMarginLeft 오브젝트의 바깥 왼쪾 여백
   */
  setOutterMarginLeft(outterMarginLeft: number): void {
    this.outterMarginLeft = outterMarginLeft;
  }

  /**
   * 오브젝트의 바깥 오른쪽 여백을 반환한다.
   *
   * @return 오브젝트의 바깥 오른쪽 여백
   */
  getOutterMarginRight(): number {
    return this.outterMarginRight;
  }

  /**
   * 오브젝트의 바깥 오른쪽 여백을 설정한다.
   *
   * @param outterMarginRight 오브젝트의 바깥 오른쪽 여백
   */
  setOutterMarginRight(outterMarginRight: number): void {
    this.outterMarginRight = outterMarginRight;
  }

  /**
   * 오브젝트의 바깥 위쪽 여백을 반환한다.
   *
   * @return 오브젝트의 바깥 위쪽 여백
   */
  getOutterMarginTop(): number {
    return this.outterMarginTop;
  }

  /**
   * 오브젝트의 바깥 위쪽 여백을 설정한다.
   *
   * @param outterMarginTop 오브젝트의 바깥 위쪽 여백
   */
  setOutterMarginTop(outterMarginTop: number): void {
    this.outterMarginTop = outterMarginTop;
  }

  /**
   * 오브젝트의 바깥 아래쪽 여백을 반환한다.
   *
   * @return 오브젝트의 바깥 아래쪽 여백
   */
  getOutterMarginBottom(): number {
    return this.outterMarginBottom;
  }

  /**
   * 오브젝트의 바깥 아래쪽 여백을 설정한다.
   *
   * @param outterMarginBottom 오브젝트의 바깥 아래쪽 여백
   */
  setOutterMarginBottom(outterMarginBottom: number): void {
    this.outterMarginBottom = outterMarginBottom;
  }

  /**
   * 문서 내 각 개체에 대한 고유 아이디를 반환한다.
   *
   * @return 문서 내 각 개체에 대한 고유 아이디
   */
  getInstanceId(): number {
    return this.instanceId;
  }

  /**
   * 문서 내 각 개체에 대한 고유 아이디를 설정한다.
   *
   * @param instanceId 문서 내 각 개체에 대한 고유 아이디
   */
  setInstanceId(instanceId: number): void {
    this.instanceId = instanceId;
  }

  /**
   * 쪽나눔 방지를 반환한다.
   *
   * @return 쪽나눔 방지
   */
  isPreventPageDivide(): boolean {
    return this.preventPageDivide;
  }

  /**
   * 쪽나눔 방지를 설정한다.
   *
   * @param preventPageDivide 쪽나눔 방지
   */
  setPreventPageDivide(preventPageDivide: boolean): void {
    this.preventPageDivide = preventPageDivide;
  }

  /**
   * 개체 설명문을 반환한다.
   *
   * @return 개체 설명문
   */
  getExplanation(): HWPString {
    return this.explanation;
  }

  getUnknown(): Uint8Array | null {
    return this.unknown;
  }

  setUnknown(unknown: Uint8Array | null): void {
    this.unknown = unknown;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderGso;
    this.property.copy(from2.property);
    this.yOffset = from2.yOffset;
    this.xOffset = from2.xOffset;
    this.width = from2.width;
    this.height = from2.height;
    this.zOrder = from2.zOrder;
    this.outterMarginLeft = from2.outterMarginLeft;
    this.outterMarginRight = from2.outterMarginRight;
    this.outterMarginTop = from2.outterMarginTop;
    this.outterMarginBottom = from2.outterMarginBottom;
    this.instanceId = from2.instanceId;
    this.preventPageDivide = from2.preventPageDivide;
    this.explanation.copy(from2.explanation);
    if (from2.unknown !== null) {
      this.unknown = new Uint8Array(from2.unknown.length);
      this.unknown.set(from2.unknown);
    } else {
      this.unknown = null;
    }
  }
}
