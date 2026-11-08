import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import type { DocumentProperties } from "../../object/docinfo/DocumentProperties.js";
import { FaceName } from "../../object/docinfo/FaceName.js";
import type { IDMappings } from "../../object/docinfo/IDMappings.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import { ForUnknown } from "../ForUnknown.js";
import type { StreamReader } from "../../util/compoundFile/reader/StreamReader.js";
import { ForBinData } from "./ForBinData.js";
import { ForBorderFill } from "./ForBorderFill.js";
import { ForBullet } from "./ForBullet.js";
import { ForCharShape } from "./ForCharShape.js";
import { ForCompatibleDocument } from "./ForCompatibleDocument.js";
import { ForDocumentPropeties } from "./ForDocumentPropeties.js";
import { ForFaceName } from "./ForFaceName.js";
import { ForIDMappings } from "./ForIDMappings.js";
import { ForLayoutCompatibility } from "./ForLayoutCompatibility.js";
import { ForMemoShape } from "./ForMemoShape.js";
import { ForNumbering } from "./ForNumbering.js";
import { ForParaShape } from "./ForParaShape.js";
import { ForStyle } from "./ForStyle.js";
import { ForTabDef } from "./ForTabDef.js";

/**
 * 문서 정보(DocInfo) 스트림을 읽기 위한 객체
 *
 * @author neolord
 */
export class ForDocInfo {
  /**
   * 문서 정보 스트림을 나타내는 객체
   */
  private docInfo!: DocInfo;
  /**
   * 스트림 리더
   */
  private sr!: StreamReader;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 문서 정보(DocInfo) 스트림를 읽는다.
   *
   * @param di 문서 정보 스트림을 나타내는 객체
   * @param sr 스트림 리더
   */
  public read(di: DocInfo, sr: StreamReader): void {
    this.sr = sr;
    this.docInfo = di;

    while (this.sr.isEndOfStream() === false) {
      this.sr.readRecordHeader();
      this.recordBody();
    }
  }

  /**
   * 이미 읽은 레코드 헤더에 따른 레코드 내용을 읽는다.
   */
  private recordBody(): void {
    switch (this.sr.getCurrentRecordHeader().getTagID()) {
      case HWPTag.DOCUMENT_PROPERTIES:
        this.documentProperties(this.docInfo.getDocumentProperties());
        break;
      case HWPTag.ID_MAPPINGS:
        this.idMappings(this.docInfo.getIDMappings());
        break;
      case HWPTag.BIN_DATA:
        this.binData();
        break;
      case HWPTag.FACE_NAME:
        this.faceName();
        break;
      case HWPTag.BORDER_FILL:
        this.borderFill();
        break;
      case HWPTag.CHAR_SHAPE:
        this.charShape();
        break;
      case HWPTag.TAB_DEF:
        this.tabDef();
        break;
      case HWPTag.NUMBERING:
        this.numbering();
        break;
      case HWPTag.BULLET:
        this.bullet();
        break;
      case HWPTag.PARA_SHAPE:
        this.paraShape();
        break;
      case HWPTag.STYLE:
        this.style();
        break;
      case HWPTag.DOC_DATA:
        this.docData();
        break;
      case HWPTag.FORBIDDEN_CHAR:
        this.forbiddenChar();
        break;
      case HWPTag.DISTRIBUTE_DOC_DATA:
        this.distributeDocData();
        break;
      case HWPTag.COMPATIBLE_DOCUMENT:
        this.compatibleDocument();
        break;
      case HWPTag.LAYOUT_COMPATIBILITY:
        this.layoutCompatibility();
        break;
      case HWPTag.TRACKCHANGE:
        this.trackChange();
        break;
      case HWPTag.MEMO_SHAPE:
        this.memoShape();
        break;
      case HWPTag.TRACK_CHANGE:
        this.trackChange2();
        break;
      case HWPTag.TRACK_CHANGE_AUTHOR:
        this.trackChangeAuthor();
        break;
    }
  }

  /**
   * 문서 속성 레코드를 읽는다.
   *
   * @param dp 읽은 내용을 저장할 객체
   */
  private documentProperties(dp: DocumentProperties): void {
    ForDocumentPropeties.read(dp, this.sr);
  }

  /**
   * 아이디 매핑 헤더 레코드를 읽는다.
   *
   * @param im 읽은 내용을 저장할 객체
   */
  private idMappings(im: IDMappings): void {
    ForIDMappings.read(im, this.sr);
  }

  /**
   * 바이너리 데이터 레코드를 읽는다.
   */
  private binData(): void {
    const bd = this.docInfo.addNewBinData();
    ForBinData.read(bd, this.sr);
  }

  /**
   * 글꼴 레코드를 읽는다.
   */
  private faceName(): void {
    const fn = new FaceName();
    ForFaceName.read(fn, this.sr);
    this.addFaceNameByIDMappings(fn);
  }

  /**
   * 글꼴 레코드 객체를 아이디 매핑 레코드의 글꼴 개수에 따라 추가한다.
   *
   * @param fn 글꼴 레코드 객체
   */
  private addFaceNameByIDMappings(fn: FaceName): void {
    const idm = this.docInfo.getIDMappings();
    if (this.docInfo.getHangulFaceNameList().length < idm.getHangulFaceNameCount()) {
      this.docInfo.getHangulFaceNameList().push(fn);
    } else if (this.docInfo.getEnglishFaceNameList().length < idm.getEnglishFaceNameCount()) {
      this.docInfo.getEnglishFaceNameList().push(fn);
    } else if (this.docInfo.getHanjaFaceNameList().length < idm.getHanjaFaceNameCount()) {
      this.docInfo.getHanjaFaceNameList().push(fn);
    } else if (this.docInfo.getJapaneseFaceNameList().length < idm.getJapaneseFaceNameCount()) {
      this.docInfo.getJapaneseFaceNameList().push(fn);
    } else if (this.docInfo.getEtcFaceNameList().length < idm.getEtcFaceNameCount()) {
      this.docInfo.getEtcFaceNameList().push(fn);
    } else if (this.docInfo.getSymbolFaceNameList().length < idm.getSymbolFaceNameCount()) {
      this.docInfo.getSymbolFaceNameList().push(fn);
    } else if (this.docInfo.getUserFaceNameList().length < idm.getUserFaceNameCount()) {
      this.docInfo.getUserFaceNameList().push(fn);
    } else {
      throw new Error("Count of FaceName is greater than ID Mappings");
    }
  }

  /**
   * 테두리/배경 레코드를 읽는다.
   */
  private borderFill(): void {
    const bf = this.docInfo.addNewBorderFill();
    ForBorderFill.read(bf, this.sr);
  }

  /**
   * 글자 모양 레코드를 읽는다.
   */
  private charShape(): void {
    const cs = this.docInfo.addNewCharShape();
    ForCharShape.read(cs, this.sr);
  }

  /**
   * 탭 정의 레코드를 읽는다.
   */
  private tabDef(): void {
    const td = this.docInfo.addNewTabDef();
    ForTabDef.read(td, this.sr);
  }

  /**
   * 문단 번호 레코드를 읽는다.
   */
  private numbering(): void {
    const n = this.docInfo.addNewNumbering();
    ForNumbering.read(n, this.sr);
  }

  /**
   * 글머리표 레코드를 읽는다.
   */
  private bullet(): void {
    const b = this.docInfo.addNewBullet();
    ForBullet.read(b, this.sr);
  }

  /**
   * 문단 모양 레코드를 읽는다.
   */
  private paraShape(): void {
    const ps = this.docInfo.addNewParaShape();
    ForParaShape.read(ps, this.sr);
  }

  /**
   * 스타일 레코드를 읽는다.
   */
  private style(): void {
    const s = this.docInfo.addNewStyle();
    ForStyle.read(s, this.sr);
  }

  /**
   * 문서 임의의 데이터 레코드를 읽는다.
   */
  private docData(): void {
    this.docInfo.createDocData(this.sr.getCurrentRecordHeader());
    ForUnknown.read(this.docInfo.getDocData()!, this.sr);
  }

  /**
   * 배포용 문서 데이터 레코드를 읽는다.
   */
  private distributeDocData(): void {
    this.docInfo.createDistributeDocData(this.sr.getCurrentRecordHeader());
    ForUnknown.read(this.docInfo.getDistributeDocData()!, this.sr);
  }

  /**
   * 호환 문서 레코드를 읽는다.
   */
  private compatibleDocument(): void {
    this.docInfo.createCompatibleDocument();
    ForCompatibleDocument.read(this.docInfo.getCompatibleDocument()!, this.sr);
  }

  /**
   * 레이아웃 호환성 레코드를 읽는다.
   */
  private layoutCompatibility(): void {
    this.docInfo.createLayoutCompatibility();
    ForLayoutCompatibility.read(this.docInfo.getLayoutCompatibility()!, this.sr);
  }

  /**
   * 변경 추적 정보 레코드를 읽는다.
   */
  private trackChange(): void {
    this.docInfo.createTrackChange(this.sr.getCurrentRecordHeader());
    ForUnknown.read(this.docInfo.getTrackChange()!, this.sr);
  }

  /**
   * 메모 모양 레코드를 읽는다.
   */
  private memoShape(): void {
    const ms = this.docInfo.addNewMemoShape();
    ForMemoShape.read(ms, this.sr);
  }

  /**
   * 금칙처리 문자 레코드를 읽는다.
   */
  private forbiddenChar(): void {
    this.docInfo.createForbiddenChar(this.sr.getCurrentRecordHeader());
    ForUnknown.read(this.docInfo.getForbiddenChar()!, this.sr);
  }

  /**
   * 변경 추적 내용 및 모양 레코드를 읽는다.
   */
  private trackChange2(): void {
    const ur = this.docInfo.addNewTrackChange2(this.sr.getCurrentRecordHeader());
    ForUnknown.read(ur, this.sr);
  }

  /**
   * 변경 추적 작성자 레코드를 읽는다.
   */
  private trackChangeAuthor(): void {
    const ur = this.docInfo.addNewTrackChangeAuthor(this.sr.getCurrentRecordHeader());
    ForUnknown.read(ur, this.sr);
  }
}
