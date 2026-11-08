import type { FileHeader } from "../object/fileheader/FileHeader.js";
import type { FileVersion } from "../object/fileheader/FileVersion.js";
import * as BitFlag from "../util/binary/BitFlag.js";
import type { StreamWriter } from "../util/compoundFile/writer/StreamWriter.js";

/**
 * 파일 헤더를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForFileHeader {
  /**
   * 파일 헤더를 쓴다.
   *
   * @param fh 파일 헤더
   * @param sw 스트림 라이터
   */
  public static write(fh: FileHeader, sw: StreamWriter): void {
    ForFileHeader.signature(sw);
    ForFileHeader.fileVersion(fh.getVersion(), sw);
    ForFileHeader.properties(fh, sw);
    ForFileHeader.zero216(sw);
  }

  /**
   * 파일 시그널을 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static signature(sw: StreamWriter): void {
    const signature = new Uint8Array([
      0x48, 0x57, 0x50, 0x20, 0x44, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74,
      0x20, 0x46, 0x69, 0x6c, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    sw.writeBytes(signature);
  }

  /**
   * 파일 버전을 쓴다.
   *
   * @param version 파일 버전
   * @param sw      스트림 라이터
   */
  private static fileVersion(version: FileVersion, sw: StreamWriter): void {
    sw.writeUInt4(version.getVersion());
  }

  /**
   * 파일 속성을 쓴다.
   *
   * @param fh 파일 헤더
   * @param sw 스트림 라이터
   */
  private static properties(fh: FileHeader, sw: StreamWriter): void {
    let properties = 0;
    properties = BitFlag.set(properties, 0, fh.isCompressed());
    properties = BitFlag.set(properties, 1, fh.hasPassword());
    properties = BitFlag.set(properties, 2, fh.isDistribution());
    properties = BitFlag.set(properties, 3, fh.isSaveScript());
    properties = BitFlag.set(properties, 4, fh.isDRMDocument());
    properties = BitFlag.set(properties, 5, fh.hasXMLTemplate());
    properties = BitFlag.set(properties, 6, fh.hasDocumentHistory());
    properties = BitFlag.set(properties, 7, fh.hasSignature());
    properties = BitFlag.set(properties, 8, fh.isEncryptPublicCertification());
    properties = BitFlag.set(properties, 9, fh.isSavePrepareSignature());
    properties = BitFlag.set(properties, 10, fh.isPublicCertificationDRMDocument());
    properties = BitFlag.set(properties, 11, fh.isCCLDocument());
    sw.writeUInt4(properties);
  }

  /**
   * 나머지 부분(216 bytes)을 0으로 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static zero216(sw: StreamWriter): void {
    sw.writeZero(216);
  }
}
