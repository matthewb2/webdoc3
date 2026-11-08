import type { FillInfo } from "../../../object/docinfo/borderfill/fillinfo/FillInfo.js";
import type { GradientFill } from "../../../object/docinfo/borderfill/fillinfo/GradientFill.js";
import { GradientType } from "../../../object/docinfo/borderfill/fillinfo/GradientType.js";
import type { ImageFill } from "../../../object/docinfo/borderfill/fillinfo/ImageFill.js";
import { ImageFillType } from "../../../object/docinfo/borderfill/fillinfo/ImageFillType.js";
import type { PatternFill } from "../../../object/docinfo/borderfill/fillinfo/PatternFill.js";
import { PatternType } from "../../../object/docinfo/borderfill/fillinfo/PatternType.js";
import { PictureEffect } from "../../../object/docinfo/borderfill/fillinfo/PictureEffect.js";
import type { PictureInfo } from "../../../object/docinfo/borderfill/fillinfo/PictureInfo.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";

/**
 * 테두리/배경 레코드의 채우기 정보를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForFillInfo {
  /**
   * 테두리/배경 레코드의 채우기 정보를 읽는다.
   *
   * @param fi 테두리/배경 레코드의 채우기 정보
   * @param sr 스트림 리더
   */
  public static read(fi: FillInfo, sr: StreamReader): void {
    fi.getType().setValue(sr.readUInt4());
    if (fi.getType().getValue() !== 0) {
      if (fi.getType().hasPatternFill()) {
        fi.createPatternFill();
        ForFillInfo.patternFill(fi.getPatternFill()!, sr);
      }

      if (fi.getType().hasGradientFill()) {
        fi.createGradientFill();
        ForFillInfo.gradientFill(fi.getGradientFill()!, sr);
      }

      if (fi.getType().hasImageFill()) {
        fi.createImageFill();
        ForFillInfo.imageFill(fi.getImageFill()!, sr);
      }
      ForFillInfo.additionalProperty(fi, sr);

      if (sr.isEndOfRecord()) return;

      ForFillInfo.unknownBytes(fi, sr);
    } else {
      sr.skip(4);
    }
  }

  /**
   * 패턴 채움 정보를 읽는다.
   *
   * @param pf 패턴 채움 정보
   * @param sr 스트림 리더
   */
  private static patternFill(pf: PatternFill, sr: StreamReader): void {
    pf.getBackColor().setValue(sr.readUInt4());
    pf.getPatternColor().setValue(sr.readUInt4());
    pf.setPatternType(PatternType.valueOf(sr.readSInt4()));
  }

  /**
   * 그라데이션 채움 정보를 읽는다.
   *
   * @param gf 그라데이션 정보
   * @param sr 스트림 리더
   */
  private static gradientFill(gf: GradientFill, sr: StreamReader): void {
    gf.setGradientType(GradientType.valueOf(sr.readSInt1())); // 문서오류 2byte
    // -> 1 byte
    gf.setStartAngle(sr.readUInt4()); // 문서오류 2byte -> 4 byte
    gf.setCenterX(sr.readUInt4()); // 문서오류 2byte -> 4 byte
    gf.setCenterY(sr.readUInt4()); // 문서오류 2byte -> 4 byte
    gf.setBlurringDegree(sr.readUInt4()); // 문서오류 2byte -> 4 byte

    const colorCount = sr.readUInt4(); // 문서오류 2byte -> 4 byte
    if (colorCount > 2) {
      for (let index = 0; index < colorCount; index++) {
        gf.addChangePoint(sr.readSInt4());
      }
    }
    for (let index = 0; index < colorCount; index++) {
      gf.addNewColor().setValue(sr.readUInt4());
    }
  }

  /**
   * 이미지 채움 정보을 읽는다.
   *
   * @param imf 이미지 채움 정보
   * @param sr  스트림 러더
   */
  private static imageFill(imf: ImageFill, sr: StreamReader): void {
    imf.setImageFillType(ImageFillType.valueOf(sr.readUInt1()));
    ForFillInfo.pictureInfo(imf.getPictureInfo(), sr);
  }

  /**
   * 그림 정보을 읽는다.
   *
   * @param pi 그림 정보
   * @param sr 스트림 리더
   */
  public static pictureInfo(pi: PictureInfo, sr: StreamReader): void {
    pi.setBrightness(sr.readSInt1());
    pi.setContrast(sr.readSInt1());
    pi.setEffect(PictureEffect.valueOf(sr.readUInt1()));
    pi.setBinItemID(sr.readUInt2());
  }

  /**
   * 추가적인 속성을 읽는다.
   *
   * @param fi 채우기 정보
   * @param sr 스트림 러더
   */
  private static additionalProperty(fi: FillInfo, sr: StreamReader): void {
    const size = sr.readUInt4();
    if (size === 1) {
      if (fi.getType().hasGradientFill()) {
        fi.getGradientFill()!.setBlurringCenter(sr.readUInt1());
      }
    } else {
      sr.skip(size);
    }
  }

  /**
   * 알려지지 않은 바이트를 읽는다.
   *
   * @param fi 채우기 정보
   * @param sr 스트림 러더
   */
  private static unknownBytes(fi: FillInfo, sr: StreamReader): void {
    if (fi.getType().hasPatternFill()) {
      sr.skip(1);
    }
    if (fi.getType().hasGradientFill()) {
      sr.skip(1);
    }
    if (fi.getType().hasImageFill()) {
      sr.skip(1);
    }
  }
}
