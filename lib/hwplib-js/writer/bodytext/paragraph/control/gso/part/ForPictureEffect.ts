import type { PictureEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/PictureEffect.js";
import type { ShadowEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/ShadowEffect.js";
import type { ColorWithEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/ColorWithEffect.js";
import type { NeonEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/NeonEffect.js";
import type { SoftEdgeEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/SoftEdgeEffect.js";
import type { ReflectionEffect } from "../../../../../../object/bodytext/control/gso/shapecomponenteach/picture/ReflectionEffect.js";
import type { StreamWriter } from "../../../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 그림 개체 속성 레코드의 그림 효과 부분을 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForPictureEffect {
  /**
   * 그림 개체 속성 레코드의 그림 효과 부분을 쓴다.
   *
   * @param pe 그림 개체 속성 레코드의 그림 효과를 나타내는 객체
   * @param sw 스트림 라이터
   */
  public static write(pe: PictureEffect, sw: StreamWriter): void {
    sw.writeUInt4(pe.getProperty().getValue());

    ForPictureEffect.shadowEffect(pe.getShadowEffect(), sw);
    ForPictureEffect.neonEffect(pe.getNeonEffect(), sw);
    ForPictureEffect.softEdgeEffect(pe.getSoftEdgeEffect(), sw);
    ForPictureEffect.reflectionEffect(pe.getReflectionEffect(), sw);
  }

  /**
   * 그림자 효과 부분을 쓴다.
   *
   * @param se 그림자 효과를 나타내는 객체
   * @param sw 스트림 라이터
   */
  private static shadowEffect(
    se: ShadowEffect | null,
    sw: StreamWriter,
  ): void {
    if (se === null) {
      return;
    }
    sw.writeSInt4(se.getStyle());
    sw.writeFloat(se.getTransparency());
    sw.writeFloat(se.getCloudy());
    sw.writeFloat(se.getDirection());
    sw.writeFloat(se.getDistance());
    sw.writeSInt4(se.getSort());
    sw.writeFloat(se.getTiltAngleX());
    sw.writeFloat(se.getTiltAngleY());
    sw.writeFloat(se.getZoomRateX());
    sw.writeFloat(se.getZoomRateY());
    sw.writeSInt4(se.getRotateWithShape());
    ForPictureEffect.colorPropery(se.getColor(), sw);
  }

  /**
   * 색상 속성 부분을 쓴다.
   *
   * @param cp 색상 속성을 나타내는 객체
   * @param sw 스트림 라이터
   */
  private static colorPropery(cp: ColorWithEffect, sw: StreamWriter): void {
    sw.writeSInt4(cp.getType());
    if (cp.getType() === 0) {
      sw.writeBytes(cp.getColor()!);
    } else {
      throw new Error("not supported color type !!!");
    }

    const colorEffectCount = cp.getColorEffectList().length;
    sw.writeUInt4(colorEffectCount);

    for (const ce of cp.getColorEffectList()) {
      sw.writeSInt4(ce.getSort()!);
      sw.writeFloat(ce.getValue());
    }
  }

  /**
   * 네온 효과 부분을 쓴다.
   *
   * @param ne 네온 효과를 나타내는 겍체
   * @param sw 스트림 라이터
   */
  private static neonEffect(ne: NeonEffect | null, sw: StreamWriter): void {
    if (ne === null) {
      return;
    }
    sw.writeFloat(ne.getTransparency());
    sw.writeFloat(ne.getRadius());
    ForPictureEffect.colorPropery(ne.getColor(), sw);
  }

  /**
   * 부드러운 가장자리 효과 부분을 쓴다.
   *
   * @param see 부드러운 가장자리 효과를 나타내는 객체
   * @param sw  스트림 라이터
   */
  private static softEdgeEffect(
    see: SoftEdgeEffect | null,
    sw: StreamWriter,
  ): void {
    if (see === null) {
      return;
    }
    sw.writeFloat(see.getRadius());
  }

  /**
   * 반사 효과 부분을 쓴다.
   *
   * @param re 반사 효과를 나타내는 객체
   * @param sw 스트림 라이터
   */
  private static reflectionEffect(
    re: ReflectionEffect | null,
    sw: StreamWriter,
  ): void {
    if (re === null) {
      return;
    }
    sw.writeSInt4(re.getStyle());
    sw.writeFloat(re.getRadius());
    sw.writeFloat(re.getDirection());
    sw.writeFloat(re.getDistance());
    sw.writeFloat(re.getTiltAngleX());
    sw.writeFloat(re.getTiltAngleY());
    sw.writeFloat(re.getZoomRateX());
    sw.writeFloat(re.getZoomRateY());
    sw.writeSInt4(re.getRotationStyle());
    sw.writeFloat(re.getStartTransparency());
    sw.writeFloat(re.getStartPosition());
    sw.writeFloat(re.getEndTransparency());
    sw.writeFloat(re.getEndPosition());
    sw.writeFloat(re.getOffsetDirection());
  }

  /**
   * 그림 개체 속성 레코드의 그림 효과 부분의 크기를 반환한다.
   *
   * @param pe 그림 개체 속성 레코드의 그림 효과을 나타내는 객체
   * @return 그림 개체 속성 레코드의 그림 효과 부분의 크기
   */
  public static getSize(pe: PictureEffect): number {
    let size = 0;
    size += 4;
    if (pe.getShadowEffect() !== null) {
      size += 44;
      size += ForPictureEffect.getSizeOfColor(pe.getShadowEffect()!.getColor());
    }
    if (pe.getNeonEffect() !== null) {
      size += 8;
      size += ForPictureEffect.getSizeOfColor(pe.getNeonEffect()!.getColor());
    }
    if (pe.getSoftEdgeEffect() !== null) {
      size += 4;
    }
    if (pe.getReflectionEffect() !== null) {
      size += 56;
    }
    return size;
  }

  /**
   * 색상 속성을 나타내는 객체의 크기를 반환한다.
   *
   * @param color 색상 속성을 나타내는 객체
   * @return 색상 속성을 나타내는 객체의 크기
   */
  private static getSizeOfColor(color: ColorWithEffect): number {
    let size = 0;
    size += 8;
    size += 4;
    size += 8 * color.getColorEffectList().length;
    return size;
  }
}
