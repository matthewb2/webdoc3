import type { BinData } from "../../object/docinfo/BinData.js";
import { BinDataType } from "../../object/docinfo/bindata/BinDataType.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import { StringUtil } from "../../util/StringUtil.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";

/**
 * 바이너리 데이타 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForBinData {
  /**
   * 바이너리 데이타 레코드를 쓴다.
   *
   * @param bd 바이너리 데이타 레코드
   * @param sw 스트림 라이터
   */
  public static write(bd: BinData, sw: StreamWriter): void {
    ForBinData.recordHeader(bd, sw);

    sw.writeUInt2(bd.getProperty().getValue());
    if (bd.getProperty().getType() === BinDataType.Link) {
      sw.writeUTF16LEString(bd.getAbsolutePathForLink());
      sw.writeUTF16LEString(bd.getRelativePathForLink());
    }
    if (
      bd.getProperty().getType() === BinDataType.Embedding ||
      bd.getProperty().getType() === BinDataType.Storage
    ) {
      sw.writeUInt2(bd.getBinDataID());
      sw.writeUTF16LEString(bd.getExtensionForEmbedding());
    }
  }

  /**
   * 바이너리 데이타 레코드의 레코드 헤더를 쓴다.
   *
   * @param bd 바이너리 데이타 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(bd: BinData, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.BIN_DATA, ForBinData.getSize(bd));
  }

  /**
   * 바이너리 데이타 레코드의 크기를 반환한다.
   *
   * @param bd 바이너리 데이타 레코드
   * @return 바이너리 데이타 레코드의 크기
   */
  private static getSize(bd: BinData): number {
    let size = 0;
    size += 2;
    if (bd.getProperty().getType() === BinDataType.Link) {
      size += StringUtil.getUTF16LEStringSize(bd.getAbsolutePathForLink());
      size += StringUtil.getUTF16LEStringSize(bd.getRelativePathForLink());
    }
    if (
      bd.getProperty().getType() === BinDataType.Embedding ||
      bd.getProperty().getType() === BinDataType.Storage
    ) {
      size += 2;
      size += StringUtil.getUTF16LEStringSize(bd.getExtensionForEmbedding());
    }
    return size;
  }
}
