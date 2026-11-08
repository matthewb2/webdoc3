import type { ParaHeader } from "../../../object/bodytext/paragraph/header/ParaHeader.js";
import type { StreamReader } from "../../../util/compoundFile/reader/StreamReader.js";

/**
 * 문단 헤더 레코드를 읽는 객체
 *
 * @author neolord
 */
export class ForParaHeader {
  /**
   * 문단 헤더 레코드를 읽는다.
   *
   * @param ph 문단 헤더 레코드
   * @param sr 스트림 리더
   */
  public static read(ph: ParaHeader, sr: StreamReader): void {
    ForParaHeader.lastInList_TextCount(ph, sr);
    ph.getControlMask().setValue(sr.readUInt4());
    ph.setParaShapeId(sr.correctParaShapeId(sr.readUInt2()));
    ph.setStyleId(sr.readUInt1());
    ph.getDivideSort().setValue(sr.readUInt1());
    ph.setCharShapeCount(sr.readUInt2());
    ph.setRangeTagCount(sr.readUInt2());
    ph.setLineAlignCount(sr.readUInt2());
    ph.setInstanceID(sr.readUInt4());

    if (sr.isEndOfRecord() === false && sr.getFileVersion()!.isOver(5, 0, 3, 2)) {
      ph.setIsMergedByTrack(sr.readUInt2());
    }
    if (sr.isEndOfRecord()) return;

    sr.skipToEndRecord();
  }

  /**
   * 문단 리스트에서 마지막 문단인지 여부와 문단의 글자 개수를 읽는다.
   *
   * @param ph 문단 헤더 레코드 객체
   * @param sr 스트림 리더
   */
  private static lastInList_TextCount(ph: ParaHeader, sr: StreamReader): void {
    const value = sr.readUInt4();
    // Java uses `long` here; JS bitwise `&` yields a signed int32, so coerce back to
    // unsigned with `>>> 0` to faithfully reproduce `(value & 0x80000000L) == 0x80000000L`.
    if (((value & 0x80000000) >>> 0) === 0x80000000) {
      ph.setLastInList(true);
      ph.setCharacterCount(value & 0x7fffffff);
    } else {
      ph.setLastInList(false);
      ph.setCharacterCount(value);
    }
  }
}
