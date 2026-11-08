import { ParameterType } from "./ParameterType.js";
import { ParameterSet } from "./ParameterSet.js";

/**
 * 파라미터 아이탬 객체
 *
 * @author neolord
 */
export class ParameterItem {
  /**
   * 파라미터 아이탬 id
   */
  private id: number;
  /**
   * 파라미터 아이템 종류
   */
  private type: ParameterType;
  /**
   * 파라미터 아이템 값(문자열)
   */
  private value_BSTR: string | null;
  /**
   * 파라미터 아이템 값(1byte 정수)
   */
  private value_I1: number;
  /**
   * 파라미터 아이템 값(2byte 정수)
   */
  private value_I2: number;
  /**
   * 파라미터 아이템 값(4byte 정수)
   */
  private value_I4: number;
  /**
   * 파라미터 아이템 값(정수)
   */
  private value_I: number;
  /**
   * 파라미터 아이템 값(1byte 부호없는 정수)
   */
  private value_UI1: number;
  /**
   * 파라미터 아이템 값(2byte 부호없는 정수)
   */
  private value_UI2: number;
  /**
   * 파라미터 아이템 값(4byte 부호없는 정수)
   */
  private value_UI4: number;
  /**
   * 파라미터 아이템 값(부호없는 정수)
   */
  private value_UI: number;
  /**
   * 파라미터 아이템 값(파라미터 셋)
   */
  private value_ParameterSet: ParameterSet | null;
  /**
   * 파라미터 아이템 값(파라미터 배열)
   */
  private value_ParameterArray: ParameterItem[] | null;
  /**
   * 파라미터 아이템 값(binData id)
   */
  private value_binData: number;

  /**
   * 생성자
   */
  public constructor() {
    this.id = 0;
    this.type = ParameterType.NULL;

    this.value_BSTR = null;
    this.value_I1 = 0;
    this.value_I2 = 0;
    this.value_I4 = 0;
    this.value_I = 0;
    this.value_UI1 = 0;
    this.value_UI2 = 0;
    this.value_UI4 = 0;
    this.value_UI = 0;
    this.value_ParameterSet = null;
    this.value_ParameterArray = null;
    this.value_binData = -1;
  }

  /**
   * 파라미터 아이탬 id를 반환한다.
   *
   * @return 파라미터 아이탬 id
   */
  public getId(): number {
    return this.id;
  }

  /**
   * 파라미터 아이탬 id를 설정한다.
   *
   * @param id 파라미터 아이탬 id
   */
  public setId(id: number): void {
    this.id = id;
  }

  /**
   * 파라미터 아이템 종류를 반환한다.
   *
   * @return 파라미터 아이템 종류
   */
  public getType(): ParameterType {
    return this.type;
  }

  /**
   * 파라미터 아이템 종류를 설정한다.
   *
   * @param type 파라미터 아이템 종류
   */
  public setType(type: ParameterType): void {
    this.type = type;
  }

  /**
   * 파라미터 아이템 값(문자열)을 반환한다.
   *
   * @return 파라미터 아이템 값(문자열)
   */
  public getValue_BSTR(): string | null {
    return this.value_BSTR;
  }

  /**
   * 파라미터 아이템 값(문자열)을 설정한다.
   *
   * @param value_BSTR 파라미터 아이템 값(문자열)
   */
  public setValue_BSTR(value_BSTR: string | null): void {
    this.value_BSTR = value_BSTR;
  }

  /**
   * 파라미터 아이템 값(1byte 정수)을 반환한다.
   *
   * @return 파라미터 아이템 값(1byte 정수)
   */
  public getValue_I1(): number {
    return this.value_I1;
  }

  /**
   * 파라미터 아이템 값(1byte 정수)을 설정한다.
   *
   * @param value_I1 파라미터 아이템 값(1byte 정수)
   */
  public setValue_I1(value_I1: number): void {
    this.value_I1 = value_I1;
  }

  /**
   * 파라미터 아이템 값(2byte 정수)을 반환한다.
   *
   * @return 파라미터 아이템 값(2byte 정수)
   */
  public getValue_I2(): number {
    return this.value_I2;
  }

  /**
   * 파라미터 아이템 값(2byte 정수)을 설정한다.
   *
   * @param value_I2 파라미터 아이템 값(2byte 정수)
   */
  public setValue_I2(value_I2: number): void {
    this.value_I2 = value_I2;
  }

  /**
   * 파라미터 아이템 값(4byte 정수)을 반환한다.
   *
   * @return 파라미터 아이템 값(4byte 정수)
   */
  public getValue_I4(): number {
    return this.value_I4;
  }

  /**
   * 파라미터 아이템 값(4byte 정수)을 설정한다.
   *
   * @param value_I4 파라미터 아이템 값(4byte 정수)
   */
  public setValue_I4(value_I4: number): void {
    this.value_I4 = value_I4;
  }

  /**
   * 파라미터 아이템 값(정수)을 반환한다.
   *
   * @return 파라미터 아이템 값(정수)
   */
  public getValue_I(): number {
    return this.value_I;
  }

  /**
   * 파라미터 아이템 값(정수)을 설정한다.
   *
   * @param value_I 파라미터 아이템 값(정수)
   */
  public setValue_I(value_I: number): void {
    this.value_I = value_I;
  }

  /**
   * 파라미터 아이템 값(1byte 부호없는 정수)을 반환한다.
   *
   * @return 파라미터 아이템 값(1byte 부호없는 정수)
   */
  public getValue_UI1(): number {
    return this.value_UI1;
  }

  /**
   * 파라미터 아이템 값(1byte 부호없는 정수)을 설정한다.
   *
   * @param value_UI1 파라미터 아이템 값(1byte 부호없는 정수)
   */
  public setValue_UI1(value_UI1: number): void {
    this.value_UI1 = value_UI1;
  }

  /**
   * 파라미터 아이템 값(2byte 부호없는 정수)을 반환한다.
   *
   * @return 파라미터 아이템 값(2byte 부호없는 정수)
   */
  public getValue_UI2(): number {
    return this.value_UI2;
  }

  /**
   * 파라미터 아이템 값(2byte 부호없는 정수)을 설정한다.
   *
   * @param value_UI2 파라미터 아이템 값(2byte 부호없는 정수)
   */
  public setValue_UI2(value_UI2: number): void {
    this.value_UI2 = value_UI2;
  }

  /**
   * 파라미터 아이템 값(4byte 부호없는 정수)을 반환한다.
   *
   * @return 파라미터 아이템 값(4byte 부호없는 정수)
   */
  public getValue_UI4(): number {
    return this.value_UI4;
  }

  /**
   * 파라미터 아이템 값(4byte 부호없는 정수)을 설정한다.
   *
   * @param value_UI4 파라미터 아이템 값(4byte 부호없는 정수)
   */
  public setValue_UI4(value_UI4: number): void {
    this.value_UI4 = value_UI4;
  }

  /**
   * 파라미터 아이템 값(부호없는 정수)을 반환한다.
   *
   * @return 파라미터 아이템 값(부호없는 정수)
   */
  public getValue_UI(): number {
    return this.value_UI;
  }

  /**
   * 파라미터 아이템 값(부호없는 정수)을 설정한다.
   *
   * @param value_UI 파라미터 아이템 값(부호없는 정수)
   */
  public setValue_UI(value_UI: number): void {
    this.value_UI = value_UI;
  }

  /**
   * 파라미터 아이템 값(파라미터 셋)을 반환한다.
   *
   * @return 파라미터 아이템 값(파라미터 셋)
   */
  public getValue_ParameterSet(): ParameterSet | null {
    return this.value_ParameterSet;
  }

  /**
   * 파라미터 아이템 값(파라미터 셋) 객체를 생성한다.
   */
  public createValue_ParameterSet(): void {
    this.value_ParameterSet = new ParameterSet();
  }

  /**
   * 파라미터 아이템 값(파라미터 셋) 객체를 삭제한다.
   */
  public deleteValue_ParameterSet(): void {
    this.value_ParameterSet = null;
  }

  /**
   * 파라미터 아이템 값(파라미터 배열)의 원소 개수를 반환한다.
   *
   * @return 파라미터 아이템 값(파라미터 배열)의 원소 개수
   */
  public getValue_ParameterArrayCount(): number {
    if (this.value_ParameterArray !== null) {
      return this.value_ParameterArray.length;
    } else {
      return 0;
    }
  }

  /**
   * 파라미터 아이템 값(파라미터 배열)의 원소를 반환한다.
   *
   * @param index 파라미터 아이템 값(파라미터 배열)의 원소 인덱스
   * @return 파라미터 아이템 값(파라미터 배열)의 원소
   */
  public getValue_ParameterArray(index: number): ParameterItem | null {
    if (this.value_ParameterArray !== null) {
      return this.value_ParameterArray[index]!;
    } else {
      return null;
    }
  }

  /**
   * 파라미터 아이템 값(파라미터 배열)을 생성한다.
   *
   * @param count 파라미터 아이템 값(파라미터 배열)의 원소 개수
   */
  public createValue_ParameterArray(count: number): void {
    this.value_ParameterArray = new Array<ParameterItem>(count);
    for (let index = 0; index < count; index++) {
      this.value_ParameterArray[index] = new ParameterItem();
    }
  }

  /**
   * 파라미터 아이템 값(파라미터 배열)을 삭제한다.
   */
  public deleteValue_ParameterArray(): void {
    this.value_ParameterArray = null;
  }

  /**
   * 파라미터 아이템 값(binData id)을 반환한다.
   *
   * @return 파라미터 아이템 값(binData id)
   */
  public getValue_binData(): number {
    return this.value_binData;
  }

  /**
   * 파라미터 아이템 값(binData id)를 설정한다.
   *
   * @param value_binData 파라미터 아이템 값(binData id)
   */
  public setValue_binData(value_binData: number): void {
    this.value_binData = value_binData;
  }

  public clone(): ParameterItem {
    const cloned = new ParameterItem();
    cloned.copy(this);
    return cloned;
  }

  public copy(from: ParameterItem): void {
    this.id = from.id;
    this.type = from.type;
    this.value_BSTR = from.value_BSTR;
    this.value_I1 = from.value_I1;
    this.value_I2 = from.value_I2;
    this.value_I4 = from.value_I4;
    this.value_I = from.value_I;
    this.value_UI1 = from.value_UI1;
    this.value_UI2 = from.value_UI2;
    this.value_UI4 = from.value_UI4;
    this.value_UI = from.value_UI;

    if (from.value_ParameterSet !== null) {
      this.createValue_ParameterSet();
      this.value_ParameterSet!.copy(from.value_ParameterSet);
    } else {
      this.value_ParameterSet = null;
    }

    if (from.value_ParameterArray !== null) {
      const count = from.value_ParameterArray.length;
      this.createValue_ParameterArray(count);
      for (let index = 0; index < count; index++) {
        this.value_ParameterArray![index]!.copy(from.value_ParameterArray[index]!);
      }
    }

    this.value_binData = from.value_binData;
  }
}
