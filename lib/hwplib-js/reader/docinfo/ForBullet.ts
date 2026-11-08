import type { Bullet } from "../../object/docinfo/Bullet.js";
import { ForFillInfo } from "./borderfill/ForFillInfo.js";
import { ForNumbering } from "./ForNumbering.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 글머리표 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForBullet {
  /**
   * 글머리표 레코드를 읽는다.
   *
   * @param b  글머리표 레코드
   * @param sr 스트림 리더
   */
  public static read(b: Bullet, sr: StreamReader): void {
    ForNumbering.paragraphHeadInfo(b.getParagraphHeadInfo(), sr);
    b.getBulletChar().setBytes(sr.readWChar());

    if (sr.isEndOfRecord()) return;

    const imageBullet = sr.readUInt4();
    if (imageBullet === 1) {
      b.setImageBullet(true);
    } else {
      b.setImageBullet(false);
    }
    ForFillInfo.pictureInfo(b.getImageBulletInfo(), sr);

    if (sr.isEndOfRecord()) return;

    b.getCheckBulletChar().setBytes(sr.readWChar());
  }
}
