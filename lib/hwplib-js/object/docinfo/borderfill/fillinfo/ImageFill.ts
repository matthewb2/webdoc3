import { PictureInfo } from "./PictureInfo.js";
import type { ImageFillType } from "./ImageFillType.js";

/**
 * 이미지 채우기 객체
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.ImageFill`.
 *
 * @author neolord
 */
export class ImageFill {
  /**
   * 이미지 채우기 유형
   */
  private imageFillType: ImageFillType | null = null;
  /**
   * 그림 정보
   */
  private pictureInfo: PictureInfo;

  /**
   * 생성자
   */
  public constructor() {
    this.pictureInfo = new PictureInfo();
  }

  /**
   * 이미지 채우기 유형을 반환한다.
   *
   * @return 이미지 채우기 유형
   */
  public getImageFillType(): ImageFillType | null {
    return this.imageFillType;
  }

  /**
   * 이미지 채우기 유형을 설정한다.
   *
   * @param imageFillType 이미지 채우기 유형
   */
  public setImageFillType(imageFillType: ImageFillType): void {
    this.imageFillType = imageFillType;
  }

  /**
   * 그림 정보 객체를 반환한다.
   *
   * @return 그림 정보 객체
   */
  public getPictureInfo(): PictureInfo {
    return this.pictureInfo;
  }

  public copy(from: ImageFill): void {
    this.imageFillType = from.imageFillType;
    this.pictureInfo.copy(from.pictureInfo);
  }
}
