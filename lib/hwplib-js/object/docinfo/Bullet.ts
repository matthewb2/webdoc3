import { PictureInfo } from "./borderfill/fillinfo/PictureInfo.js";
import { ParagraphHeadInfo } from "./numbering/ParagraphHeadInfo.js";
import { HWPString } from "../etc/HWPString.js";

/**
 * Record for a bullet.
 * Ported from hwplib's `object.docinfo.Bullet`.
 */
export class Bullet {
  /** paragraph head information */
  private paragraphHeadInfo: ParagraphHeadInfo;
  /** bullet character */
  private bulletChar: HWPString;
  /** whether the bullet is an image bullet */
  private imageBullet: boolean;
  /** image bullet information */
  private imageBulletInfo: PictureInfo;
  /** check bullet character */
  private checkBulletChar: HWPString;

  constructor() {
    this.paragraphHeadInfo = new ParagraphHeadInfo();
    this.bulletChar = new HWPString();
    this.imageBullet = false;
    this.imageBulletInfo = new PictureInfo();
    this.checkBulletChar = new HWPString();
  }

  getParagraphHeadInfo(): ParagraphHeadInfo {
    return this.paragraphHeadInfo;
  }

  getBulletChar(): HWPString {
    return this.bulletChar;
  }

  getImageBullet(): boolean {
    return this.imageBullet;
  }

  setImageBullet(imageBullet: boolean): void {
    this.imageBullet = imageBullet;
  }

  getImageBulletInfo(): PictureInfo {
    return this.imageBulletInfo;
  }

  getCheckBulletChar(): HWPString {
    return this.checkBulletChar;
  }

  clone(): Bullet {
    const cloned = new Bullet();
    cloned.paragraphHeadInfo.copy(this.paragraphHeadInfo);
    cloned.bulletChar.copy(this.bulletChar);
    cloned.imageBullet = this.imageBullet;
    cloned.imageBulletInfo.copy(this.imageBulletInfo);
    cloned.checkBulletChar.copy(this.checkBulletChar);
    return cloned;
  }
}
