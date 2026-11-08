import { ParameterItem } from "./ParameterItem.js";
import { ParameterType } from "./ParameterType.js";

/**
 * 파라미터 셋 객체
 *
 * @author neolord
 */
export class ParameterSet {
  /**
   * 파라미터 셋 id
   */
  private id: number;
  /**
   * 파라미터 아이탬 리스트
   */
  private parameterItemList: ParameterItem[];

  /**
   * 생성자
   */
  public constructor() {
    this.id = 0;
    this.parameterItemList = [];
  }

  /**
   * 파라미터 셋 id를 반환한다.
   *
   * @return 파라미터 셋 id
   */
  public getId(): number {
    return this.id;
  }

  /**
   * 파라미터 셋 id를 설정한다.
   *
   * @param id 파라미터 셋 id
   */
  public setId(id: number): void {
    this.id = id;
  }

  /**
   * 파라미터 아이탬을 생성하고 리스트에 추가한다.
   *
   * @return 새로 생성된 파라미터 아이탬
   */
  public addNewParameterItem(): ParameterItem {
    const pi = new ParameterItem();
    this.parameterItemList.push(pi);
    return pi;
  }

  /**
   * 파라미터 아이탬 리스트를 반환한다.
   *
   * @return 파라미터 아이탬 리스트
   */
  public getParameterItemList(): ParameterItem[] {
    return this.parameterItemList;
  }

  /**
   * 아이디가 id인 파라미터 아이탬을 반환한다.
   *
   * @param id 파리미터 아이탬의 아이디
   * @return 아이디가 id인 파라미터 아이탬
   */
  public getParameterItem(id: number): ParameterItem | null {
    for (const pi of this.parameterItemList) {
      if (pi.getId() === id) {
        return pi;
      }
    }
    return null;
  }

  /**
   * 필드 이름을 위한 파라미터 셋 객체를 만든다.
   *
   * @param fieldName 필드 이름
   * @return 필드 이름을 위한 파라미터 셋 객체
   */
  public static createForFieldName(fieldName: string | null): ParameterSet | null {
    if (fieldName === null || fieldName.length === 0) {
      return null;
    }

    const ps = new ParameterSet();
    ps.setId(0x21b);
    const pi = ps.addNewParameterItem();
    pi.setId(0x4000);
    pi.setType(ParameterType.String);
    pi.setValue_BSTR(fieldName);
    return ps;
  }

  public copy(from: ParameterSet): void {
    this.id = from.id;

    for (const parameterItem of from.parameterItemList) {
      this.parameterItemList.push(parameterItem.clone());
    }
  }
}
