import type { ListHeaderForMemo } from "../../../../object/bodytext/paragraph/memo/ListHeaderForMemo.js";
import type { Memo } from "../../../../object/bodytext/paragraph/memo/Memo.js";
import { HWPTag } from "../../../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../../../util/compoundFile/writer/StreamWriter.js";
import { ForParagraphList } from "../ForParagraphList.js";
import { ForMemoList } from "./ForMemoList.js";

/**
 * 메모를 쓰기 위한 객체
 *
 * @author neolord
 */
export class ForMemo {
  public static write(m: Memo, sw: StreamWriter): void {
    ForMemoList.write(m.getMemoList(), sw);
    ForMemo.listHeader(m.getListHeader(), sw);
    ForParagraphList.write(m.getParagraphList(), sw);
  }

  /**
   * 메모의 리스트 헤더 레코드를 쓴다.
   *
   * @param li 메모의 리스트 헤더 레코드
   * @param sw 스트림 라이터
   */
  private static listHeader(li: ListHeaderForMemo, sw: StreamWriter): void {
    ForMemo.recordHeader(sw);

    sw.writeSInt4(li.getParaCount());
    sw.writeUInt4(li.getProperty().getValue());
    sw.writeUInt4(li.getTextWidth());
    sw.writeUInt4(li.getTextHeight());
  }

  /**
   * 메모의 리스트 헤더 레코드의 레코드 헤더를 쓴다.
   *
   * @param sw 스트림 라이터
   */
  private static recordHeader(sw: StreamWriter): void {
    sw.writeRecordHeader(HWPTag.LIST_HEADER, 16);
  }
}
