import { ControlType } from "../ControlType.js";
import { FieldHeaderProperty } from "./field/FieldHeaderProperty.js";
import { HWPString } from "../../../etc/HWPString.js";
import { CtrlHeader } from "./CtrlHeader.js";

/**
 * 필드 컨트롤를 위한 컨트롤 헤더 레코드
 *
 * @author neolord
 */
export class CtrlHeaderField extends CtrlHeader {
  /**
   * 속성
   */
  private property: FieldHeaderProperty;
  /**
   * 기타 속성
   */
  private etcProperty = 0;
  /**
   * command
   */
  private command: HWPString;
  /**
   * id(문서 내 고유 아이디)
   */
  private instanceId = 0;
  /**
   * 메모 인덱스
   */
  private memoIndex = 0;

  /**
   * 생성자
   *
   * @param ctrlId 컨트롤 아이디(필드 아이디)
   */
  constructor(ctrlId: number = ControlType.FIELD_UNKNOWN) {
    super(ctrlId);

    this.property = new FieldHeaderProperty();
    this.command = new HWPString();
  }

  /**
   * 컨트롤 아이디(필드 아이디)를 설정한다.
   *
   * @param ctrlId 컨트롤 아이디
   */
  setCtrlId(ctrlId: number): void {
    this.ctrlId = ctrlId;
  }

  /**
   * 필드 컨트롤의 속성 객체를 반환한다.
   *
   * @return 필드 컨트롤의 속성 객체
   */
  getProperty(): FieldHeaderProperty {
    return this.property;
  }

  /**
   * 기타 속성을 반환한다.
   *
   * @return 기타 속성
   */
  getEtcProperty(): number {
    return this.etcProperty;
  }

  /**
   * 기타 속성을 설정한다.
   *
   * @param etcProperty 기타 속성
   */
  setEtcProperty(etcProperty: number): void {
    this.etcProperty = etcProperty;
  }

  /**
   * 필드 command를 반환한다.
   *
   * @return 필드 command
   */
  getCommand(): HWPString {
    return this.command;
  }

  /**
   * 문서 내 고유 아이디를 반환한다.
   *
   * @return 문서 내 고유 아이디
   */
  getInstanceId(): number {
    return this.instanceId;
  }

  /**
   * 문서 내 고유 아이디를 설정한다.
   *
   * @param instanceId 문서 내 고유 아이디
   */
  setInstanceId(instanceId: number): void {
    this.instanceId = instanceId;
  }

  /**
   * 메모 인덱스를 반환한다.
   *
   * @return 메모 인덱스
   */
  getMemoIndex(): number {
    return this.memoIndex;
  }

  /**
   * 메모 인덱스를 설정한다.
   *
   * @param memoIndex 메모 인덱스
   */
  setMemoIndex(memoIndex: number): void {
    this.memoIndex = memoIndex;
  }

  override copy(from: CtrlHeader): void {
    const from2 = from as CtrlHeaderField;
    this.property.copy(from2.property);
    this.etcProperty = from2.etcProperty;
    this.command.copy(from2.command);
    this.instanceId = from2.instanceId;
    this.memoIndex = from2.memoIndex;
  }
}
