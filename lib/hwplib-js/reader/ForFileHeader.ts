import { FileHeader } from "../object/fileheader/FileHeader.js";
import type { FileVersion } from "../object/fileheader/FileVersion.js";
import * as BitFlag from "../util/binary/BitFlag.js";
import type { StreamReader } from "../util/compoundFile/reader/StreamReader.js";

/**
 * 파일 헤더를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForFileHeader {
  /**
   * File Header 스트림을 읽는다.
   *
   * @param fh 파일 헤더 객체
   * @param sr 스트림 리더
   */
  public static read(fh: FileHeader, sr: StreamReader): void {
    ForFileHeader.signature(sr);
    ForFileHeader.fileVersion(fh.getVersion(), sr);
    ForFileHeader.properties(fh, sr);
  }

  /**
   * 한글 파일 시그니처(이 파일이 한글 파일인지 확인하는 부분)을 읽는다.
   *
   * @param sr 스트림 리더
   */
  private static signature(sr: StreamReader): void {
    const sign = sr.readBytes(32);

    if (ForFileHeader.byteArrayEquals(FileHeader.getFileSignature(), sign) === false) {
      throw new Error("this is not hwp file.");
    }
  }

  /**
   * 파일 버전 부분을 읽는다.
   *
   * @param fv 읽은 내을을 저장할 객체
   * @param sr 스트림 리더
   */
  private static fileVersion(fv: FileVersion, sr: StreamReader): void {
    fv.setVersion(sr.readUInt4());
  }

  /**
   * 속성 부분을 읽는다.
   *
   * @param fh 읽은 내을을 저장할 객체
   * @param sr 스트림 리더
   */
  private static properties(fh: FileHeader, sr: StreamReader): void {
    const flag = sr.readUInt4();
    fh.setCompressed(BitFlag.get(flag, 0));
    fh.setHasPassword(BitFlag.get(flag, 1));
    fh.setDistribution(BitFlag.get(flag, 2));
    fh.setSaveScript(BitFlag.get(flag, 3));
    fh.setDRMDocument(BitFlag.get(flag, 4));
    fh.setHasXMLTemplate(BitFlag.get(flag, 5));
    fh.setHasDocumentHistory(BitFlag.get(flag, 6));
    fh.setHasSignature(BitFlag.get(flag, 7));
    fh.setEncryptPublicCertification(BitFlag.get(flag, 8));
    fh.setSavePrepareSignature(BitFlag.get(flag, 9));
    fh.setPublicCertificationDRMDocument(BitFlag.get(flag, 10));
    fh.setCCLDocument(BitFlag.get(flag, 11));
  }

  /**
   * java.util.Arrays.equals 를 대신한다.
   */
  private static byteArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i]! !== b[i]!) {
        return false;
      }
    }
    return true;
  }
}
