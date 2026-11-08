import type { IDMappings } from "../../object/docinfo/IDMappings.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { FileVersion } from "../../object/fileheader/FileVersion.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 아이디 매핑 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForIDMappings {
  /**
   * 아이디 매핑 레코드를 쓴다.
   *
   * @param im 아이디 매핑 레코드
   * @param sw 스트림 라이터
   */
  public static write(im: IDMappings, sw: StreamWriter): void {
    ForIDMappings.recordHeader(sw);

    sw.writeSInt4(im.getBinDataCount()); // 0
    sw.writeSInt4(im.getHangulFaceNameCount()); // 1
    sw.writeSInt4(im.getEnglishFaceNameCount()); // 2
    sw.writeSInt4(im.getHanjaFaceNameCount()); // 3
    sw.writeSInt4(im.getJapaneseFaceNameCount()); // 4
    sw.writeSInt4(im.getEtcFaceNameCount()); // 5
    sw.writeSInt4(im.getSymbolFaceNameCount()); // 6
    sw.writeSInt4(im.getUserFaceNameCount()); // 7
    sw.writeSInt4(im.getBorderFillCount()); // 8
    sw.writeSInt4(im.getCharShapeCount()); // 9
    sw.writeSInt4(im.getTabDefCount()); // 10
    sw.writeSInt4(im.getNumberingCount()); // 11
    sw.writeSInt4(im.getBulletCount()); // 12
    sw.writeSInt4(im.getParaShapeCount()); // 13
    sw.writeSInt4(im.getStyleCount()); // 14
    if (sw.getFileVersion()!.isOver(5, 0, 2, 1)) {
      sw.writeSInt4(im.getMemoShapeCount()); // 15
    }
    if (sw.getFileVersion()!.isOver(5, 0, 3, 2)) {
      sw.writeSInt4(im.getTrackChangeCount()); // 16
      sw.writeSInt4(im.getTrackChangeAuthorCount()); // 17
    }
  }

  /**
   * 아이디 매핑 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.ID_MAPPINGS, ForIDMappings.getSize(sw.getFileVersion()!));
  }

  /**
   * 아이디 매핑 레코드의 크기를 반환한다.
   *
   * @param version 파일 버전
   * @return 아이디 매핑 레코드
   */
  private static getSize(version: FileVersion): number {
    if (version.isOver(5, 0, 3, 2)) {
      return 72;
    } else if (version.isOver(5, 0, 2, 1)) {
      return 64;
    } else {
      return 60;
    }
  }
}
