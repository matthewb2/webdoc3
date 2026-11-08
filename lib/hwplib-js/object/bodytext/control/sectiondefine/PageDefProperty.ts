import { BitFlag } from "../../../../util/binary/BitFlag.js";
import { PaperDirection } from "./PaperDirection.js";
import { MakingBookMethod } from "./MakingBookMethod.js";

/**
 * 용지 설정의 속성에 대한 객체
 * Ported from hwplib's `object.bodytext.control.sectiondefine.PageDefProperty`.
 *
 * @author neolord
 */
export class PageDefProperty {
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
   * 용지 방향을 반환한다. (0 bit)
   *
   * @return 용지 방향
   */
  public getPaperDirection(): PaperDirection {
    if (BitFlag.get(this.value, 0) === false) {
      return PaperDirection.Portrait;
    } else {
      return PaperDirection.Landscape;
    }
  }

  /**
   * 용지 방향을 설정한다. (0 bit)
   *
   * @param paperDirection 용지 방향
   */
  public setPaperDirection(paperDirection: PaperDirection): void {
    if (paperDirection === PaperDirection.Portrait) {
      this.value = BitFlag.set(this.value, 0, false);
    } else {
      this.value = BitFlag.set(this.value, 0, true);
    }
  }

  /**
   * 제책 방법을 반환한다. (1~2 bit)
   *
   * @return 제책 방법
   */
  public getMakingBookMethod(): MakingBookMethod {
    return MakingBookMethod.valueOf(BitFlag.getRange(this.value, 1, 2));
  }

  /**
   * 제책 방법을 설정한다. (1~2 bit)
   *
   * @param makingBookMethod
   */
  public setMakingBookMethod(makingBookMethod: MakingBookMethod): void {
    this.value = BitFlag.setRange(this.value, 1, 2, makingBookMethod);
  }

  public copy(from: PageDefProperty): void {
    this.value = from.value;
  }
}
