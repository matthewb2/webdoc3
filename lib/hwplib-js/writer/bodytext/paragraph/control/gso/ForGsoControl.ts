import { GsoControlType } from "../../../../../object/bodytext/control/gso/GsoControlType.js";
import { ForCaption } from "./part/ForCaption.js";
import { ForCtrlHeaderGso } from "./part/ForCtrlHeaderGso.js";
import { ForShapeComponentForContainer } from "./part/shapecomponent/ForShapeComponentForContainer.js";
import { ForShapeComponentForNormal } from "./part/shapecomponent/ForShapeComponentForNormal.js";
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
import type { ShapeComponentContainer } from "../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponentContainer.js";
import type { ShapeComponentNormal } from "../../../../../object/bodytext/control/gso/shapecomponent/ShapeComponentNormal.js";
import type { StreamWriter } from "../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 그리기 개체 컨트롤을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForGsoControl {
  /**
   * 그리기 개체 컨트롤을 쓴다.
   *
   * @param gso 그리기 개체 컨트롤
   * @param sw  스트림 라이터
   */
  public static write(gso: GsoControl, sw: StreamWriter): void {
    ForCtrlHeaderGso.write(gso.getHeader(), sw);

    sw.upRecordLevel();

    ForCaption.write(gso.getCaption(), sw);
    ForGsoControl.shapeComponent(gso, sw);
    ForGsoControl.restPart(gso, sw);

    sw.downRecordLevel();
  }

  /**
   * 그리기 개체 컨트롤의 객체 공통 속성 레코드을 쓴다.
   *
   * @param gso 그리기 개체 컨트롤
   * @param sw  스트림 라이터
   */
  private static shapeComponent(gso: GsoControl, sw: StreamWriter): void {
    if (gso.getGsoType() === GsoControlType.Container) {
      ForShapeComponentForContainer.write(
        gso.getShapeComponent() as ShapeComponentContainer,
        sw,
      );
    } else {
      ForShapeComponentForNormal.write(
        gso.getShapeComponent() as ShapeComponentNormal,
        sw,
      );
    }
  }

  /**
   * 그리기 개체 컨트롤의 나머지 부분을 쓴다.
   *
   * @param gso 그리기 개체 컨트롤
   * @param sw  스트림 라이터
   */
  private static restPart(gso: GsoControl, sw: StreamWriter): void {
    switch (gso.getGsoType()) {
      case GsoControlType.Line:
        ForControlLine.writeRest(gso as ControlLine, sw);
        break;
      case GsoControlType.Rectangle:
        ForControlRectangle.writeRest(gso as ControlRectangle, sw);
        break;
      case GsoControlType.Ellipse:
        ForControlEllipse.writeRest(gso as ControlEllipse, sw);
        break;
      case GsoControlType.Arc:
        ForControlArc.writeRest(gso as ControlArc, sw);
        break;
      case GsoControlType.Polygon:
        ForControlPolygon.writeRest(gso as ControlPolygon, sw);
        break;
      case GsoControlType.Curve:
        ForControlCurve.writeRest(gso as ControlCurve, sw);
        break;
      case GsoControlType.Picture:
        ForControlPicture.writeRest(gso as ControlPicture, sw);
        break;
      case GsoControlType.OLE:
        ForControlOLE.writeRest(gso as ControlOLE, sw);
        break;
      case GsoControlType.Container:
        ForControlContainer.writeRest(gso as ControlContainer, sw);
        break;
      case GsoControlType.ObjectLinkLine:
        ForControlObjectLinkLine.writeRest(gso as ControlObjectLinkLine, sw);
        break;
      case GsoControlType.TextArt:
        ForControlTextArt.writeRest(gso as ControlTextArt, sw);
        break;
    }
  }

  /**
   * 묶음 컨트롤 안에 있는 컨트롤을 쓴다.
   *
   * @param child 묶음 컨트롤 안에 있는 컨트롤
   * @param sw    스트림 라이터
   */
  public static writeInContainer(child: GsoControl, sw: StreamWriter): void {
    sw.upRecordLevel();

    ForGsoControl.shapeComponentInContainer(child, sw);
    ForGsoControl.restPart(child, sw);

    sw.downRecordLevel();
  }

  /**
   * 묶음 컨트롤 안에 있는 컨트롤의 객체 공통 속성 레코드을 쓴다.
   *
   * @param child 묶음 컨트롤 안에 있는 컨트롤
   * @param sw    스트림 라이터
   */
  private static shapeComponentInContainer(
    child: GsoControl,
    sw: StreamWriter,
  ): void {
    if (child.getGsoType() === GsoControlType.Container) {
      ForShapeComponentForContainer.writeInContainer(
        child.getShapeComponent() as ShapeComponentContainer,
        sw,
      );
    } else {
      ForShapeComponentForNormal.writeInContainer(
        child.getShapeComponent() as ShapeComponentNormal,
        sw,
      );
    }
  }
}
