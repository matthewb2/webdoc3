import type { Control } from "../control/Control.js";
import type { ControlForm } from "../control/ControlForm.js";
import type { ControlType } from "../control/ControlType.js";
import { FactoryForControl } from "../control/FactoryForControl.js";
import { CtrlHeaderGso } from "../control/ctrlheader/CtrlHeaderGso.js";
import type { GsoControl } from "../control/gso/GsoControl.js";
import type { GsoControlType } from "../control/gso/GsoControlType.js";
import { ParaCharShape } from "./charshape/ParaCharShape.js";
import { ParaHeader } from "./header/ParaHeader.js";
import { ParaLineSeg } from "./lineseg/ParaLineSeg.js";
import { ParaRangeTag } from "./rangetag/ParaRangeTag.js";
import { ParaText } from "./text/ParaText.js";

/**
 * 하나의 문단을 나타내는 객체
 *
 * @author neolord
 */
export class Paragraph {
  static readonly Zero_Array: Paragraph[] = [];
  /**
   * 헤더
   */
  private header: ParaHeader;
  /**
   * 텍스트
   */
  private text: ParaText | null = null;
  /**
   * 글자 모양
   */
  private charShape: ParaCharShape | null = null;
  /**
   * 레이아웃
   */
  private lineSeg: ParaLineSeg | null = null;
  /**
   * 영역 태그
   */
  private rangeTag: ParaRangeTag | null = null;

  /**
   * 컨트롤 리스트
   */
  private controlList: Control[] | null = null;

  /**
   * 생성자
   */
  constructor() {
    this.header = new ParaHeader();
  }

  /**
   * 헤더에 대한 객체를 반환한다.
   *
   * @return 헤더에 대한 객체
   */
  getHeader(): ParaHeader {
    return this.header;
  }

  /**
   * 문단 텍스트에 대한 객체를 생성한다.
   */
  createText(): void {
    this.text = new ParaText();
  }

  /**
   * 문단 텍스트에 대한 객체를 삭제한다.
   */
  deleteText(): void {
    this.text = null;
  }

  /**
   * 문단 텍스트에 대한 객체를 반환한다.
   *
   * @return 문단 텍스트에 대한 객체
   */
  getText(): ParaText | null {
    return this.text;
  }

  /**
   * 문단의 글자 모양에 대한 객체를 생성한다.
   */
  createCharShape(): void {
    this.charShape = new ParaCharShape();
  }

  /**
   * 문단의 글자 모양에 대한 객체를 삭제한다.
   */
  deleteCharShape(): void {
    this.charShape = null;
  }

  /**
   * 문단의 글자 모양에 대한 객체를 반환한다.
   *
   * @return 문단의 글자 모양에 대한 객체
   */
  getCharShape(): ParaCharShape | null {
    return this.charShape;
  }

  /**
   * 문단의 레이아웃에 대한 객체를 생성한다.
   */
  createLineSeg(): void {
    this.lineSeg = new ParaLineSeg();
  }

  /**
   * 문단의 레이아웃에 대한 객체를 삭제한다.
   */
  deleteLineSeg(): void {
    this.lineSeg = null;
  }

  /**
   * 문단의 레이아웃에 대한 객체를 반환한다.
   *
   * @return 문단의 레이아웃에 대한 객체
   */
  getLineSeg(): ParaLineSeg | null {
    return this.lineSeg;
  }

  /**
   * 문단의 영역 태그에 대한 객체를 생성한다.
   */
  createRangeTag(): void {
    this.rangeTag = new ParaRangeTag();
  }

  /**
   * 문단의 영역 태그에 대한 객체를 삭제한다.
   */
  deleteRangeTag(): void {
    this.rangeTag = null;
  }

  /**
   * 문단의 영역 태그에 대한 객체를 반환한다.
   *
   * @return 문단의 영역 태그에 대한 객체
   */
  getRangeTag(): ParaRangeTag | null {
    return this.rangeTag;
  }

  /**
   * type에 해당하는 새로운 컨트롤을 생성하고 리스트에 추가한다.
   *
   * @param type 컨트롤 타입
   * @return 새로 생성된 컨트롤 객체
   */
  addNewControl(type: ControlType): Control;
  /**
   * id에 해당하는 새로운 컨트롤을 생성하고 리스트에 추가한다.
   *
   * @param id 컨트롤 id값
   * @return 새로 생성된 컨트롤 객체
   */
  addNewControl(id: number): Control;
  addNewControl(idOrType: ControlType | number): Control {
    if (this.controlList === null) {
      this.controlList = [];
    }
    const c = FactoryForControl.create(idOrType)!;
    this.controlList.push(c);
    return c;
  }

  /**
   * gsoType에 해당하는 새로운 GSO 컨트롤(그리기 객체)를 생성하고 리스트에 추가한다. 새로 생성한 GSO 컨트롤의 헤더를
   * header로 설정한다.
   *
   * @param gsoType GSO 컨트롤(그리기 객체) 타입
   * @param header  컨트롤 헤더 객체
   * @return 새로 생성한 GSO 컨트롤
   */
  addNewGsoControl(gsoType: GsoControlType): GsoControl;
  addNewGsoControl(gsoType: GsoControlType, header: CtrlHeaderGso): GsoControl;
  /**
   * gsoid에 해당하는 새로운 GSO 컨트롤(그리기 객체)를 생성하고 리스트에 추가한다. 새로 생성한 GSO 컨트롤의 헤더를 header로
   * 설정한다.
   *
   * @param gsoId  GSO 컨트롤(그리기 객체)의 id
   * @param header 컨트롤 헤더 객체
   * @return 새로 생성한 GSO 컨트롤
   */
  addNewGsoControl(gsoId: number, header: CtrlHeaderGso): GsoControl;
  addNewGsoControl(gsoIdOrType: GsoControlType | number, header?: CtrlHeaderGso): GsoControl {
    if (header === undefined) {
      return this.addNewGsoControl(gsoIdOrType, new CtrlHeaderGso());
    }
    if (this.controlList === null) {
      this.controlList = [];
    }
    const gc = FactoryForControl.createGso(gsoIdOrType, header);
    this.controlList.push(gc);
    return gc;
  }

  addNewFormControl(header: CtrlHeaderGso): ControlForm {
    if (this.controlList === null) {
      this.controlList = [];
    }
    const fc = FactoryForControl.createFormControl(header);
    this.controlList.push(fc);
    return fc;
  }

  /**
   * 컨트롤 리스트를 반환한다.
   *
   * @return 컨트롤 리스트
   */
  getControlList(): Control[] | null {
    return this.controlList;
  }

  createControlList(): void {
    this.controlList = [];
  }

  /**
   * 컨트롤 리스트에서 컨트롤의 순번을 반환한다.
   *
   * @param c 컨트롤
   * @return 컨트롤의 순번
   */
  getControlIndex(c: Control): number {
    return this.controlList!.indexOf(c);
  }

  /**
   * 문단 내의 일반 문자열을 반환한다.
   *
   * @return 문단 내의 일반 문자열
   */
  getNormalString(): string | null {
    if (this.text !== null) {
      return this.text.getNormalString(0);
    }
    return "";
  }

  clone(): Paragraph {
    const cloned = new Paragraph();

    cloned.header.copy(this.header);

    if (this.text !== null) {
      cloned.text = this.text.clone();
    } else {
      cloned.text = null;
    }

    if (this.charShape !== null) {
      cloned.charShape = this.charShape.clone();
    } else {
      cloned.charShape = null;
    }

    if (this.lineSeg !== null) {
      cloned.lineSeg = this.lineSeg.clone();
    } else {
      cloned.lineSeg = null;
    }

    if (this.rangeTag !== null) {
      cloned.rangeTag = this.rangeTag.clone();
    } else {
      cloned.rangeTag = null;
    }

    if (this.controlList !== null) {
      cloned.controlList = [];
      for (const control of this.controlList) {
        cloned.controlList.push(control.clone());
      }
    } else {
      cloned.controlList = null;
    }

    return cloned;
  }
}
