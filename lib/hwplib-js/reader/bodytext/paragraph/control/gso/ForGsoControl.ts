import { FactoryForControl } from "../../../../../object/bodytext/control/FactoryForControl.js";
import { CtrlData } from "../../../../../object/bodytext/control/bookmark/CtrlData.js";
import { CtrlHeaderGso } from "../../../../../object/bodytext/control/ctrlheader/CtrlHeaderGso.js";
import { Caption } from "../../../../../object/bodytext/control/gso/caption/Caption.js";
import { GsoControlType } from "../../../../../object/bodytext/control/gso/GsoControlType.js";
import { HWPTag } from "../../../../../object/etc/HWPTag.js";
import { ForCtrlData } from "../bookmark/ForCtrlData.js";
import { ForCaption } from "./part/ForCaption.js";
import { ForCtrlHeaderGso } from "./part/ForCtrlHeaderGso.js";
import { ForShapeComponent } from "./part/ForShapeComponent.js";
import { ForControlLine } from "./ForControlLine.js";
import { ForControlRectangle } from "./ForControlRectangle.js";
import { ForControlEllipse } from "./ForControlEllipse.js";
import { ForControlArc } from "./ForControlArc.js";
import { ForControlPolygon } from "./ForControlPolygon.js";
import { ForControlCurve } from "./ForControlCurve.js";
import { ForControlPicture } from "./ForControlPicture.js";
import { ForControlOLE } from "./ForControlOLE.js";
import { ForControlContainer } from "./ForControlContainer.js";
import { ForControlObjectLinkLine } from "./ForControlObjectLinkLine.js";
import { ForControlTextArt } from "./ForControlTextArt.js";
import type { GsoControl } from "../../../../../object/bodytext/control/gso/GsoControl.js";
import type { ControlLine } from "../../../../../object/bodytext/control/gso/ControlLine.js";
import type { ControlRectangle } from "../../../../../object/bodytext/control/gso/ControlRectangle.js";
import type { ControlEllipse } from "../../../../../object/bodytext/control/gso/ControlEllipse.js";
import type { ControlArc } from "../../../../../object/bodytext/control/gso/ControlArc.js";
import type { ControlPolygon } from "../../../../../object/bodytext/control/gso/ControlPolygon.js";
import type { ControlCurve } from "../../../../../object/bodytext/control/gso/ControlCurve.js";
import type { ControlPicture } from "../../../../../object/bodytext/control/gso/ControlPicture.js";
import type { ControlOLE } from "../../../../../object/bodytext/control/gso/ControlOLE.js";
import type { ControlContainer } from "../../../../../object/bodytext/control/gso/ControlContainer.js";
import type { ControlObjectLinkLine } from "../../../../../object/bodytext/control/gso/ControlObjectLinkLine.js";
import type { ControlTextArt } from "../../../../../object/bodytext/control/gso/ControlTextArt.js";
import type { Paragraph } from "../../../../../object/bodytext/paragraph/Paragraph.js";
import type { StreamReader } from "../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 그리기 개체 컨트롤들을 읽는다.
 *
 * @author neolord
 */
export class ForGsoControl {
  /**
   * 문단 객체
   */
  private paragraph: Paragraph | null = null;
  /**
   * 스트림 리더
   */
  private sr: StreamReader | null = null;

  /**
   * 생성된 그리기 개체 컨트롤
   */
  private gsoControl: GsoControl | null = null;

  private header: CtrlHeaderGso | null = null;
  private caption: Caption | null = null;
  private ctrlData: CtrlData | null = null;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 그리기 개체 컨트롤을 읽는다.
   *
   * @param paragraph 문단 객체
   * @param sr        스트림 리더
   */
  public read(paragraph: Paragraph, sr: StreamReader): void {
    this.paragraph = paragraph;
    this.sr = sr;

    this.ctrlHeader();
    this.captionAndCtrlData(sr);

    const gsoId = this.gsoIDFromShapeComponent();
    this.gsoControl = this.createGsoControl(gsoId);
    this.restPartOfShapeComponent();
    this.restPartOfControl();
  }

  /**
   * 그리기 개체의 컨트롤 헤더 레코드를 읽는다.
   */
  private ctrlHeader(): void {
    this.header = new CtrlHeaderGso();
    ForCtrlHeaderGso.read(this.header, this.sr!);
  }

  private captionAndCtrlData(sr: StreamReader): void {
    this.caption = null;
    this.ctrlData = null;

    sr.readRecordHeader();
    while (sr.getCurrentRecordHeader().getTagID() !== HWPTag.SHAPE_COMPONENT) {
      if (sr.getCurrentRecordHeader().getTagID() === HWPTag.LIST_HEADER) {
        this.caption = new Caption();
        ForCaption.read(this.caption, sr);
        if (sr.isImmediatelyAfterReadingHeader() === false) {
          sr.readRecordHeader();
        }
      } else if (
        sr.getCurrentRecordHeader().getTagID() === HWPTag.CTRL_DATA
      ) {
        this.ctrlData = new CtrlData();
        ForCtrlData.read(this.ctrlData, sr);
        if (sr.isImmediatelyAfterReadingHeader() === false) {
          sr.readRecordHeader();
        }
      }
    }
  }

  /**
   * 객체 공통 속성 레코드로 부터 그리기 개체의 id를 읽는다.
   *
   * @return 그리기 개체의 id
   */
  private gsoIDFromShapeComponent(): number {
    if (this.sr!.isImmediatelyAfterReadingHeader() === false) {
      this.sr!.readRecordHeader();
    }
    if (
      this.sr!.getCurrentRecordHeader().getTagID() === HWPTag.SHAPE_COMPONENT
    ) {
      const id = this.sr!.readUInt4();
      this.sr!.skip(4); // id2;
      return id;
    } else {
      throw new Error(
        "Shape Component must come after CtrlHeader for gso control.",
      );
    }
  }

  /**
   * 그리기 개체 컨트롤을 생성한다.
   *
   * @param gsoId 그리기 개체 아이디
   * @return 생성된 그리기 개체 컨트롤
   */
  private createGsoControl(gsoId: number): GsoControl {
    const gc = this.paragraph!.addNewGsoControl(gsoId, this.header!);
    if (this.caption !== null) {
      gc.setCaption(this.caption);
    }
    if (this.ctrlData !== null) {
      gc.setCtrlData(this.ctrlData);
    }
    return gc;
  }

  /**
   * 객체 공통 속성 레코드의 나머지 부분을 읽는다.
   */
  private restPartOfShapeComponent(): void {
    ForShapeComponent.read(this.gsoControl!, this.sr!);
  }

  /**
   * 컨트롤의 너머지 부분을 읽는다.
   */
  private restPartOfControl(): void {
    switch (this.gsoControl!.getGsoType()) {
      case GsoControlType.Line:
        ForControlLine.readRest(this.gsoControl! as ControlLine, this.sr!);
        break;
      case GsoControlType.Rectangle:
        ForControlRectangle.readRest(
          this.gsoControl! as ControlRectangle,
          this.sr!,
        );
        break;
      case GsoControlType.Ellipse:
        ForControlEllipse.readRest(
          this.gsoControl! as ControlEllipse,
          this.sr!,
        );
        break;
      case GsoControlType.Arc:
        ForControlArc.readRest(this.gsoControl! as ControlArc, this.sr!);
        break;
      case GsoControlType.Polygon:
        ForControlPolygon.readRest(
          this.gsoControl! as ControlPolygon,
          this.sr!,
        );
        break;
      case GsoControlType.Curve:
        ForControlCurve.readRest(this.gsoControl! as ControlCurve, this.sr!);
        break;
      case GsoControlType.Picture:
        ForControlPicture.readRest(
          this.gsoControl! as ControlPicture,
          this.sr!,
        );
        break;
      case GsoControlType.OLE:
        ForControlOLE.readRest(this.gsoControl! as ControlOLE, this.sr!);
        break;
      case GsoControlType.Container:
        ForControlContainer.readRest(
          this.gsoControl! as ControlContainer,
          this.sr!,
        );
        break;
      case GsoControlType.ObjectLinkLine:
        ForControlObjectLinkLine.readRest(
          this.gsoControl! as ControlObjectLinkLine,
          this.sr!,
        );
        break;
      case GsoControlType.TextArt:
        ForControlTextArt.readRest(
          this.gsoControl! as ControlTextArt,
          this.sr!,
        );
        break;
    }
  }

  /**
   * 묶음 컨트롤 안에 포함된 컨트롤을 읽는다.
   *
   * @param sr 스트림 리더
   * @return 묶음 컨트롤 안에 포함된 컨트롤
   */
  public readInContainer(sr: StreamReader): GsoControl {
    this.sr = sr;
    this.shapeComponentInContainer();
    this.restPartOfControl();
    return this.gsoControl!;
  }

  /**
   * 묶음 컨트롤 안에 포함된 컨트롤을 위한 그리기 개체 컨트롤 헤더 레코드를 읽는다.
   */
  private shapeComponentInContainer(): void {
    this.sr!.readRecordHeader();
    if (
      this.sr!.getCurrentRecordHeader().getTagID() === HWPTag.SHAPE_COMPONENT
    ) {
      const id = this.sr!.readUInt4();
      this.gsoControl = FactoryForControl.createGso(id, null);
      ForShapeComponent.read(this.gsoControl, this.sr!);
    } else {
      throw new Error(
        "Shape Component must come after CtrlHeader for gso control.",
      );
    }
  }
}
