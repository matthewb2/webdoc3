import { Control } from "../Control.js";
import { CtrlHeaderGso } from "../ctrlheader/CtrlHeaderGso.js";
import { Caption } from "./caption/Caption.js";
import type { ShapeComponent } from "./shapecomponent/ShapeComponent.js";
import { ShapeComponentNormal } from "./shapecomponent/ShapeComponentNormal.js";
import { GsoControlType } from "./GsoControlType.js";

/**
 * 그리기 개체 컨트롤
 *
 * @author neolord
 */
export abstract class GsoControl extends Control {
  /**
   * 캡션 정보
   */
  private caption: Caption | null;
  /**
   * 그리기 개체의 공통 요소
   */
  protected shapeComponent: ShapeComponent;

  /**
   * 생상자
   *
   * @param header 그리기 개체를 위한 컨트롤 헤더
   */
  constructor(header: CtrlHeaderGso | null = new CtrlHeaderGso()) {
    super(header);

    this.caption = null;
    this.shapeComponent = new ShapeComponentNormal();
  }

  /**
   * 그리기 개체를 위한 컨트롤 헤더 객체를 반환한다.
   *
   * @return 그리기 개체를 위한 컨트롤 헤더 객체
   */
  getHeader(): CtrlHeaderGso {
    return this.header as CtrlHeaderGso;
  }

  /**
   * 그리기 개체 아이디를 반환환다.
   *
   * @return 그리기 개체 아이디
   */
  getGsoId(): number {
    return this.shapeComponent.getGsoId();
  }

  /**
   * 그리기 개체 아이디를 설정한다.
   *
   * @param gsoId 그리기 개체 아이디
   */
  protected setGsoId(gsoId: number): void {
    this.shapeComponent.setGsoId(gsoId);
  }

  /**
   * 그리기 개체 타입을 반환한다.
   *
   * @return 그리기 개체 타입
   */
  getGsoType(): GsoControlType {
    return GsoControlType.idOf(this.getGsoId());
  }

  /**
   * 캡션 객체를 생성한다.
   */
  createCaption(): void {
    this.caption = new Caption();
  }

  /**
   * 캡션 객체를 삭제한다.
   */
  deleteCaption(): void {
    this.caption = null;
  }

  /**
   * 캡션 정보 객체를 반환한다.
   *
   * @return 캡션 정보 객체
   */
  getCaption(): Caption | null {
    return this.caption;
  }

  /**
   * 캡션 정보 객체을 설정한다.
   *
   * @param caption 캡션 정보 객체
   */
  setCaption(caption: Caption): void {
    this.caption = caption;
  }

  /**
   * 그리기 개체의 공통 요소을 나태내는 객체를 반환한다.
   *
   * @return 그리기 개체의 공통 요소을 나태내는 객체
   */
  getShapeComponent(): ShapeComponent {
    return this.shapeComponent;
  }

  copyGsoControlPart(from: GsoControl): void {
    this.copyControlPart(from);

    if (from.caption !== null) {
      this.createCaption();
      this.caption!.copy(from.caption);
    }

    this.shapeComponent.copy(from.shapeComponent);
  }
}
