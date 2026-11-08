import type { FillInfo } from "../../../object/docinfo/borderfill/fillinfo/FillInfo.js";
import type { GradientFill } from "../../../object/docinfo/borderfill/fillinfo/GradientFill.js";
import type { ImageFill } from "../../../object/docinfo/borderfill/fillinfo/ImageFill.js";
import type { PatternFill } from "../../../object/docinfo/borderfill/fillinfo/PatternFill.js";
import type { PictureInfo } from "../../../object/docinfo/borderfill/fillinfo/PictureInfo.js";
import type { StreamWriter } from "../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 테두리/배경 레코드의 채우기 정보를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForFillInfo {
  /**
   * 테두리/배경 레코드의 채우기 정보를 쓴다.
   *
   * @param fi 테두리/배경 레코드의 채우기 정보
   * @param sw 스트림 라이터
   */
  public static write(fi: FillInfo, sw: StreamWriter): void {
    sw.writeUInt4(fi.getType().getValue());
    if (fi.getType().getValue() !== 0) {
      if (fi.getType().hasPatternFill()) {
        ForFillInfo.writePatternFill(fi.getPatternFill()!, sw);
      }
      if (fi.getType().hasGradientFill()) {
        ForFillInfo.writeGradientFill(fi.getGradientFill()!, sw);
      }
      if (fi.getType().hasImageFill()) {
        ForFillInfo.writeImageFill(fi.getImageFill()!, sw);
      }
      ForFillInfo.additionalProperty(fi, sw);
      ForFillInfo.unknownBytes(fi, sw);
    } else {
      sw.writeZero(4);
    }
  }

  /**
   * 패턴 채움 정보를 쓴다.
   *
   * @param pf 패턴 채움 정보
   * @param sw 스트림 라이터
   */
  private static writePatternFill(pf: PatternFill, sw: StreamWriter): void {
    sw.writeUInt4(pf.getBackColor().getValue());
    sw.writeUInt4(pf.getPatternColor().getValue());
    sw.writeUInt4(pf.getPatternType()!);
  }

  /**
   * 그라데이션 채움 정보를 쓴다.
   *
   * @param gf 그라데이션 채움 정보
   * @param sw 스트림 라이터
   */
  private static writeGradientFill(gf: GradientFill, sw: StreamWriter): void {
    sw.writeSInt1(gf.getGradientType()!);
    sw.writeUInt4(gf.getStartAngle());
    sw.writeUInt4(gf.getCenterX());
    sw.writeUInt4(gf.getCenterY());
    sw.writeUInt4(gf.getBlurringDegree());

    const colorCount = gf.getColorList().length;
    sw.writeUInt4(colorCount);
    if (colorCount > 2) {
      for (const cp of gf.getChangePointList()) {
        sw.writeSInt4(cp);
      }
    }
    for (const c of gf.getColorList()) {
      sw.writeUInt4(c.getValue());
    }
  }

  /**
   * 이미지 채움 정보을 쓴다.
   *
   * @param imf 이미지 채움 정보
   * @param sw  스트림 라이터
   */
  private static writeImageFill(imf: ImageFill, sw: StreamWriter): void {
    sw.writeUInt1(imf.getImageFillType()!);
    ForFillInfo.pictureInfo(imf.getPictureInfo(), sw);
  }

  /**
   * 그림 정보을 쓴다.
   *
   * @param pi 그림 정보
   * @param sw 스트림 라이터
   */
  public static pictureInfo(pi: PictureInfo, sw: StreamWriter): void {
    sw.writeSInt1(pi.getBrightness());
    sw.writeSInt1(pi.getContrast());
    sw.writeUInt1(pi.getEffect());
    sw.writeUInt2(pi.getBinItemID());
  }

  /**
   * 추가적인 속성을 쓴다.
   *
   * @param fi 테두리/배경 레코드의 채우기 정보
   * @param sw 스트림 라이터
   */
  private static additionalProperty(fi: FillInfo, sw: StreamWriter): void {
    if (fi.getType().hasGradientFill() === true) {
      sw.writeUInt4(1);
      sw.writeUInt1(fi.getGradientFill()!.getBlurringCenter());
    } else {
      sw.writeUInt4(0);
    }
  }

  /**
   * 알려지지 않은 바이트를 쓴다.
   *
   * @param fi 테두리/배경 레코드의 채우기 정보
   * @param sw 스트림 라이터
   */
  private static unknownBytes(fi: FillInfo, sw: StreamWriter): void {
    if (fi.getType().hasPatternFill()) {
      sw.writeZero(1);
    }
    if (fi.getType().hasGradientFill()) {
      sw.writeZero(1);
    }
    if (fi.getType().hasImageFill()) {
      sw.writeZero(1);
    }
  }

  /**
   * 테두리/배경 레코드의 채우기 정보의 크기를 반환한다.
   *
   * @param fi 테두리/배경 레코드의 채우기 정보
   * @return 테두리/배경 레코드의 채우기 정보의 크기
   */
  public static getSize(fi: FillInfo): number {
    let size = 0;
    size += 4;
    if (fi.getType().getValue() !== 0) {
      if (fi.getType().hasPatternFill()) {
        size += 12;
      }
      if (fi.getType().hasGradientFill()) {
        size += 17;

        size += 4;
        const colorCount = fi.getGradientFill()!.getColorList().length;
        if (colorCount > 2) {
          size += colorCount * 4;
        }
        size += colorCount * 4;
      }
      if (fi.getType().hasImageFill()) {
        size += 6;
      }

      // additionalProperty
      if (fi.getType().hasGradientFill() === true) {
        size += 4;
        size += 1;
      } else {
        size += 4;
      }

      // unknownBytes
      if (fi.getType().hasPatternFill()) {
        size += 1;
      }
      if (fi.getType().hasGradientFill()) {
        size += 1;
      }
      if (fi.getType().hasImageFill()) {
        size += 1;
      }
    } else {
      size += 4;
    }
    return size;
  }
}
