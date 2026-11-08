/**
 * The list of record tags, ported from hwplib's `object.etc.HWPTag`.
 */
export class HWPTag {
  /**
   * tag start value
   */
  private static readonly BEGIN = 0x10;

  // for "DocInfo" stream
  /** document properties tag */
  public static readonly DOCUMENT_PROPERTIES = HWPTag.BEGIN;
  /** id mappings header tag */
  public static readonly ID_MAPPINGS = HWPTag.BEGIN + 1;
  /** BinData tag */
  public static readonly BIN_DATA = HWPTag.BEGIN + 2;
  /** Typeface Name tag */
  public static readonly FACE_NAME = HWPTag.BEGIN + 3;
  /** border/background tag */
  public static readonly BORDER_FILL = HWPTag.BEGIN + 4;
  /** char shape tag */
  public static readonly CHAR_SHAPE = HWPTag.BEGIN + 5;
  /** tab definition tag */
  public static readonly TAB_DEF = HWPTag.BEGIN + 6;
  /** numbering tag */
  public static readonly NUMBERING = HWPTag.BEGIN + 7;
  /** bullet tag */
  public static readonly BULLET = HWPTag.BEGIN + 8;
  /** paragraph shape tag */
  public static readonly PARA_SHAPE = HWPTag.BEGIN + 9;
  /** style tag */
  public static readonly STYLE = HWPTag.BEGIN + 10;
  /** arbitrary document data tag */
  public static readonly DOC_DATA = HWPTag.BEGIN + 11;
  /** distribute document data tag */
  public static readonly DISTRIBUTE_DOC_DATA = HWPTag.BEGIN + 12;
  /** compatible document tag */
  public static readonly COMPATIBLE_DOCUMENT = HWPTag.BEGIN + 14;
  /** layout compatibility tag */
  public static readonly LAYOUT_COMPATIBILITY = HWPTag.BEGIN + 15;
  /** track change information tag */
  public static readonly TRACKCHANGE = HWPTag.BEGIN + 16;
  /** memo shape tag */
  public static readonly MEMO_SHAPE = HWPTag.BEGIN + 76;
  /** forbidden char tag */
  public static readonly FORBIDDEN_CHAR = HWPTag.BEGIN + 78;
  /** track change content and shape tag */
  public static readonly TRACK_CHANGE = HWPTag.BEGIN + 80;
  /** track change author tag */
  public static readonly TRACK_CHANGE_AUTHOR = HWPTag.BEGIN + 81;

  // for "BodyText" storages
  /** paragraph header tag */
  public static readonly PARA_HEADER = HWPTag.BEGIN + 50;
  /** paragraph text tag */
  public static readonly PARA_TEXT = HWPTag.BEGIN + 51;
  /** paragraph char shape tag */
  public static readonly PARA_CHAR_SHAPE = HWPTag.BEGIN + 52;
  /** paragraph layout tag */
  public static readonly PARA_LINE_SEG = HWPTag.BEGIN + 53;
  /** paragraph range tag */
  public static readonly PARA_RANGE_TAG = HWPTag.BEGIN + 54;
  /** control header tag */
  public static readonly CTRL_HEADER = HWPTag.BEGIN + 55;
  /** paragraph list header tag */
  public static readonly LIST_HEADER = HWPTag.BEGIN + 56;
  /** page setup tag */
  public static readonly PAGE_DEF = HWPTag.BEGIN + 57;
  /** footnote/endnote shape tag */
  public static readonly FOOTNOTE_SHAPE = HWPTag.BEGIN + 58;
  /** page border/background tag */
  public static readonly PAGE_BORDER_FILL = HWPTag.BEGIN + 59;
  /** shape component tag */
  public static readonly SHAPE_COMPONENT = HWPTag.BEGIN + 60;
  /** table object tag */
  public static readonly TABLE = HWPTag.BEGIN + 61;
  /** line object tag */
  public static readonly SHAPE_COMPONENT_LINE = HWPTag.BEGIN + 62;
  /** rectangle object tag */
  public static readonly SHAPE_COMPONENT_RECTANGLE = HWPTag.BEGIN + 63;
  /** ellipse object tag */
  public static readonly SHAPE_COMPONENT_ELLIPSE = HWPTag.BEGIN + 64;
  /** arc object tag */
  public static readonly SHAPE_COMPONENT_ARC = HWPTag.BEGIN + 65;
  /** polygon object tag */
  public static readonly SHAPE_COMPONENT_POLYGON = HWPTag.BEGIN + 66;
  /** curve object tag */
  public static readonly SHAPE_COMPONENT_CURVE = HWPTag.BEGIN + 67;
  /** OLE object tag */
  public static readonly SHAPE_COMPONENT_OLE = HWPTag.BEGIN + 68;
  /** picture object tag */
  public static readonly SHAPE_COMPONENT_PICTURE = HWPTag.BEGIN + 69;
  /** container object tag */
  public static readonly SHAPE_COMPONENT_CONTAINER = HWPTag.BEGIN + 70;
  /** control arbitrary data tag */
  public static readonly CTRL_DATA = HWPTag.BEGIN + 71;
  /** equation object tag */
  public static readonly EQEDIT = HWPTag.BEGIN + 72;
  /** text-art tag */
  public static readonly SHAPE_COMPONENT_TEXTART = HWPTag.BEGIN + 74;
  /** form object tag */
  public static readonly FORM_OBJECT = HWPTag.BEGIN + 75;
  /** memo list header tag */
  public static readonly MEMO_LIST = HWPTag.BEGIN + 77;
  /** chart data tag */
  public static readonly CHART_DATA = HWPTag.BEGIN + 79;
  /** video data tag */
  public static readonly VIDEO_DATA = HWPTag.BEGIN + 82;
  /** Unknown tag */
  public static readonly SHAPE_COMPONENT_UNKNOWN = HWPTag.BEGIN + 99;
}
