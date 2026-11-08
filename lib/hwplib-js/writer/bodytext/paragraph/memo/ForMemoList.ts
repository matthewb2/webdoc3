import type { MemoList } from "../../../../object/bodytext/paragraph/memo/MemoList.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";

/**
 * 메모 리스트 레코드를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForMemoList {
  /**
   * 메모 리스트 레코드를 쓴다.
   *
   * @param ml 메모 리스트 레코드
   * @param sw 스트림 라이터
   */
  public static write(ml: MemoList | null, sw: StreamWriter): void {
    if (ml === null) {
      return;
    }

    ForMemoList.recordHeader(ml, sw);
    sw.writeUInt4(ml.getMemoIndex());
  }

  /**
   * 메모 리스트 레코드의 레코드 헤더를 쓴다.
   *
   * @param ml 메모 리스트 레코드
   * @param sw 스트림 라이터
   */
  private static recordHeader(ml: MemoList, sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.MEMO_LIST, 4);
  }
}
