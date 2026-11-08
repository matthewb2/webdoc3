import type { Bullet } from "../../object/docinfo/Bullet.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";
import { ForFillInfo } from "./borderfill/ForFillInfo.js";
import { ForNumbering } from "./ForNumbering.js";

/**
 * 글머리표 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForBullet {
  /**
   * 글머리표 레코드를 쓴다.
   *
   * @param b  글머리표 레코드
   * @param sw 스트림 라이터
   */
  public static write(b: Bullet, sw: StreamWriter): void {
    ForBullet.recordHeader(sw);
    ForNumbering.paragraphHeadInfo(b.getParagraphHeadInfo(), sw);
    sw.writeWChar(b.getBulletChar().getBytes());
    if (b.getImageBullet()) {
      sw.writeUInt4(1);
    } else {
      sw.writeUInt4(0);
    }
    ForFillInfo.pictureInfo(b.getImageBulletInfo(), sw);
    sw.writeWChar(b.getCheckBulletChar().getBytes());
  }

  /**
   * 글머리표 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.BULLET, 25);
  }
}
