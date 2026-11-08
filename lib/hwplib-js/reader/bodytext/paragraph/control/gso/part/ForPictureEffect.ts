import { ColorEffectSort } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/ColorEffectSort.js";
import type { PictureEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/PictureEffect.js";
import type { ShadowEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/ShadowEffect.js";
import type { ColorWithEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/ColorWithEffect.js";
import type { NeonEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/NeonEffect.js";
import type { SoftEdgeEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/SoftEdgeEffect.js";
import type { ReflectionEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/ReflectionEffect.js";
import type { StreamReader } from "../../../../../../util/compoundFile/reader/StreamReader.js";

/**
 * 그림 개체 속성 레코드의 그림 효과 부분을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForPictureEffect {
  /**
   * 그림 개체 속성 레코드의 그림 효과 부분을 읽는다.
   *
   * @param pe 그림 개체 속성 레코드의 그림 효과를 나타내는 객체
   * @param sr 스트림 리더
   */
  public static read(pe: PictureEffect, sr: StreamReader): void {
    pe.getProperty().setValue(sr.readUInt4());
    if (pe.getProperty().hasShadowEffect()) {
      pe.createShadowEffect();
      ForPictureEffect.shadowEffect(pe.getShadowEffect()!, sr);
    }
    if (pe.getProperty().hasNeonEffect()) {
      pe.createNeonEffect();
      ForPictureEffect.neonEffect(pe.getNeonEffect()!, sr);
    }
    if (pe.getProperty().hasSoftBorderEffect()) {
      pe.createSoftEdgeEffect();
      ForPictureEffect.softEdgeEffect(pe.getSoftEdgeEffect()!, sr);
    }
    if (pe.getProperty().hasReflectionEffect()) {
      pe.createReflectionEffect();
      ForPictureEffect.reflectionEffect(pe.getReflectionEffect()!, sr);
    }
  }

  /**
   * 그림자 효과 부분을 읽는다.
   *
   * @param se 그림자 효과 부분을 나타내는 객체
   * @param sr 스트림 리더
   */
  private static shadowEffect(se: ShadowEffect, sr: StreamReader): void {
    se.setStyle(sr.readSInt4());
    se.setTransparency(sr.readFloat());
    se.setCloudy(sr.readFloat());
    se.setDirection(sr.readFloat());
    se.setDistance(sr.readFloat());
    se.setSort(sr.readSInt4());
    se.setTiltAngleX(sr.readFloat());
    se.setTiltAngleY(sr.readFloat());
    se.setZoomRateX(sr.readFloat());
    se.setZoomRateY(sr.readFloat());
    se.setRotateWithShape(sr.readSInt4());

    ForPictureEffect.colorProperty(se.getColor(), sr);
  }

  /**
   * 색상 속성 부분을 읽는다.
   *
   * @param cp 색상 속성을 나타내는  객체
   * @param sr 스트림 리더
   */
  private static colorProperty(cp: ColorWithEffect, sr: StreamReader): void {
    cp.setType(sr.readSInt4());
    if (cp.getType() === 0) {
      const color = sr.readBytes(4);
      cp.setColor(color);
    } else {
      throw new Error("not supported color type !!!");
    }
    const colorEffectCount = sr.readUInt4();
    for (let index = 0; index < colorEffectCount; index++) {
      const ce = cp.addNewColorEffect();
      ce.setSort(ColorEffectSort.valueOf(sr.readSInt4()));
      ce.setValue(sr.readFloat());
    }
  }

  /**
   * 네온 효과 부분을 읽는다.
   *
   * @param ne 네온 효과을 나타내는 객체
   * @param sr 스트림 리더
   */
  private static neonEffect(ne: NeonEffect, sr: StreamReader): void {
    ne.setTransparency(sr.readFloat());
    ne.setRadius(sr.readFloat());
    ForPictureEffect.colorProperty(ne.getColor(), sr);
  }

  /**
   * 부드러운 가장자리 효과 부분을 읽는다.
   *
   * @param see 부드러운 가장자리 효과을 나타내는 객체
   * @param sr  스트림 리더
   */
  private static softEdgeEffect(see: SoftEdgeEffect, sr: StreamReader): void {
    see.setRadius(sr.readFloat());
  }

  /**
   * 반사 효과 부분을 읽는다.
   *
   * @param re 반사 효과을 나타내는 객체
   * @param sr 스트림 리더
   */
  private static reflectionEffect(re: ReflectionEffect, sr: StreamReader): void {
    re.setStyle(sr.readSInt4());
    re.setRadius(sr.readFloat());
    re.setDirection(sr.readFloat());
    re.setDistance(sr.readFloat());
    re.setTiltAngleX(sr.readFloat());
    re.setTiltAngleY(sr.readFloat());
    re.setZoomRateX(sr.readFloat());
    re.setZoomRateY(sr.readFloat());
    re.setRotationStyle(sr.readSInt4());
    re.setStartTransparency(sr.readFloat());
    re.setStartPosition(sr.readFloat());
    re.setEndTransparency(sr.readFloat());
    re.setEndPosition(sr.readFloat());
    re.setOffsetDirection(sr.readFloat());
  }
}
