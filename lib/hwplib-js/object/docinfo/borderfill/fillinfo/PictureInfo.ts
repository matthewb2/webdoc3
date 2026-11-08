import { PictureEffect } from "./PictureEffect.js";

/**
 * 그림 정보 객체
 * Ported from hwplib's `object.docinfo.borderfill.fillinfo.PictureInfo`.
 *
 * @author neolord
 */
export class PictureInfo {
  /**
   * 밝기
   */
  private brightness: number = 0;
  /**
   * 명암
   */
  private contrast: number = 0;
  /**
   * 그림 효과
   */
  private effect: PictureEffect;
  /**
   * BinItem의 아이디 참조값 - 이미지가 저장된 바이너리 데이터의 id
   */
  private binItemID: number = 0;

  /**
   * 생성자
   */
  public constructor() {
    this.effect = PictureEffect.RealPicture;
  }

  /**
   * 밝기를 반환한다.
   *
   * @return 밝기
   */
  public getBrightness(): number {
    return this.brightness;
  }

  /**
   * 밝기를 설정한다.
   *
   * @param brightness 밝기
   */
  public setBrightness(brightness: number): void {
    this.brightness = brightness;
  }

  /**
   * 명암을 반환한다.
   *
   * @return 명암
   */
  public getContrast(): number {
    return this.contrast;
  }

  /**
   * 명암를 설정한다.
   *
   * @param contrast 명암
   */
  public setContrast(contrast: number): void {
    this.contrast = contrast;
  }

  /**
   * 그림 효과를 반환한다.
   *
   * @return 그림 효과
   */
  public getEffect(): PictureEffect {
    return this.effect;
  }

  /**
   * 그림 효과를 설정한다.
   *
   * @param effect 그림 효과
   */
  public setEffect(effect: PictureEffect): void {
    this.effect = effect;
  }

  /**
   * BinItem의 아이디 참조값를 반환한다.
   *
   * @return BinItem의 아이디 참조값
   */
  public getBinItemID(): number {
    return this.binItemID;
  }

  /**
   * BinItem의 아이디 참조값를 설정한다.
   *
   * @param binItemID BinItem의 아이디 참조값
   */
  public setBinItemID(binItemID: number): void {
    this.binItemID = binItemID;
  }

  public copy(from: PictureInfo): void {
    this.brightness = from.brightness;
    this.contrast = from.contrast;
    this.effect = from.effect;
    this.binItemID = from.binItemID;
  }
}
