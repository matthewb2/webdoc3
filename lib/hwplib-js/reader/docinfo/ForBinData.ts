import type { BinData } from "../../object/docinfo/BinData.js";
import { BinDataType } from "../../object/docinfo/bindata/BinDataType.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";

/**
 * 바이너리 데이타 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForBinData {
  /**
   * 바이너리 데이타 레코드를 읽는다.
   *
   * @param bd 바이너리 데이타 레코드
   * @param sr 스트림 리더
   */
  public static read(bd: BinData, sr: StreamReader): void {
    bd.getProperty().setValue(sr.readUInt2());
    if (bd.getProperty().getType() === BinDataType.Link) {
      bd.setAbsolutePathForLink(sr.readUTF16LEString());
      bd.setRelativePathForLink(sr.readUTF16LEString());
    }

    if (
      bd.getProperty().getType() === BinDataType.Embedding ||
      bd.getProperty().getType() === BinDataType.Storage
    ) {
      bd.setBinDataID(sr.readUInt2());
      bd.setExtensionForEmbedding(sr.readUTF16LEString());
    }
  }
}
