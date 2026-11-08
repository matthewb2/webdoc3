import type { ListHeaderForMemo } from "../../../object/bodytext/paragraph/memo/ListHeaderForMemo.js";
import type { Memo } from "../../../object/bodytext/paragraph/memo/Memo.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";
import { ForParagraphList } from "../ForParagraphList.js";
import { ForMemoList } from "./ForMemoList.js";

/**
 * 메모를 읽기 위한 객체
 *
 * @author neolord
 */
export class ForMemo {
  /**
   * 메모를 읽는다.
   *
   * @param m  메모 객체
   * @param sr 스트림 리더
   */
  public static read(m: Memo, sr: StreamReader): void {
    ForMemoList.read(m.getMemoList(), sr);
    ForMemo.listHeader(m.getListHeader(), sr);
    ForParagraphList.read(m.getParagraphList(), sr);
  }

  /**
   * 바탕쪽의 문단 리스트 헤더 레코드를 읽는다.
   *
   * @param listHeaderForMemo 바탕쪽의 문단 리스트 헤더 레코드
   * @param sr                스트림 리더
   */
  private static listHeader(listHeaderForMemo: ListHeaderForMemo, sr: StreamReader): void {
    sr.readRecordHeader();

    listHeaderForMemo.setParaCount(sr.readSInt4());
    listHeaderForMemo.getProperty().setValue(sr.readUInt4());
    listHeaderForMemo.setTextWidth(sr.readUInt4());
    listHeaderForMemo.setTextHeight(sr.readUInt4());
    sr.skipToEndRecord();
  }
}
