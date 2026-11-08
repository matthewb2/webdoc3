import type { MemoList } from "../../../object/bodytext/paragraph/memo/MemoList.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";

/**
 * 메모 리스트 레코드를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForMemoList {
  /**
   * 메모 리스트 레코드를 읽는다.
   *
   * @param ml 메모 리스트 레코드 객체
   * @param sr 스트림 리더
   */
  public static read(ml: MemoList, sr: StreamReader): void {
    ml.setMemoIndex(sr.readUInt4());
  }
}
