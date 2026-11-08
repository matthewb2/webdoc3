import type { DocInfo } from "../../object/docinfo/DocInfo.js";
import type { FaceName } from "../../object/docinfo/FaceName.js";
import { HWPTag } from "../../object/etc/HWPTag.js";
import type { StreamWriter } from "../../util/compoundFile/writer/StreamWriter.js";
import { ForUnknown } from "../ForUnknown.js";
import { ForBinData } from "./ForBinData.js";
import { ForBorderFill } from "./ForBorderFill.js";
import { ForBullet } from "./ForBullet.js";
import { ForCharShape } from "./ForCharShape.js";
import { ForCompatibleDocument } from "./ForCompatibleDocument.js";
import { ForDocumentProperties } from "./ForDocumentProperties.js";
import { ForFaceName } from "./ForFaceName.js";
import { ForIDMappings } from "./ForIDMappings.js";
import { ForLayoutCompatibility } from "./ForLayoutCompatibility.js";
import { ForMemoShape } from "./ForMemoShape.js";
import { ForNumbering } from "./ForNumbering.js";
import { ForParaShape } from "./ForParaShape.js";
import { ForStyle } from "./ForStyle.js";
import { ForTabDef } from "./ForTabDef.js";

/**
 * 문서 정보(DocInfo) 스트림을 쓰기 위한 객체
 *
 * @author 박성균
 */
export class ForDocInfo {
  /**
   * 문서 정보 객체
   */
  private docInfo!: DocInfo;
  /**
   * 스트림 라이터
   */
  private sw!: StreamWriter;

  /**
   * 생성자
   */
  public constructor() {}

  /**
   * 문서 정보(DocInfo) 스트림을 쓴다.
   *
   * @param docInfo 문서 정보 객체
   * @param sw      스트림 라이터
   */
  public write(docInfo: DocInfo, sw: StreamWriter): void {
    this.docInfo = docInfo;
    this.sw = sw;

    this.documentProperties();
    this.idMappings();

    this.sw.upRecordLevel();

    this.binData();
    this.faceName();
    this.borderFill();
    this.charShape();
    this.tabDef();
    this.numbering();
    this.bullet();
    this.paraShape();
    this.style();
    this.memoShape();
    this.trackChangeAuthor();
    this.trackChange2();

    this.sw.downRecordLevel();

    this.docData();
    this.forbiddenChar();
    this.compatibleDocument();

    this.sw.upRecordLevel();

    this.layoutCompatibility();

    this.sw.downRecordLevel();

    this.distributeDocData();

    this.sw.upRecordLevel();

    this.trackChange();

    this.sw.downRecordLevel();
  }

  /**
   * 문서 속성 레코드를 쓴다.
   */
  private documentProperties(): void {
    const dp = this.docInfo.getDocumentProperties();
    if (dp === null) {
      return;
    }
    ForDocumentProperties.write(dp, this.sw);
  }

  /**
   * 아이디 매핑 헤더 레코드를 쓴다.
   */
  private idMappings(): void {
    const im = this.docInfo.getIDMappings();
    if (im === null) {
      return;
    }
    ForIDMappings.write(im, this.sw);
  }

  /**
   * 바이너리 데이터 레코드를 쓴다.
   */
  private binData(): void {
    for (const bd of this.docInfo.getBinDataList()) {
      ForBinData.write(bd, this.sw);
    }
  }

  /**
   * 글꼴 레코드들을 쓴다.
   */
  private faceName(): void {
    this.faceNameList(this.docInfo.getHangulFaceNameList());
    this.faceNameList(this.docInfo.getEnglishFaceNameList());
    this.faceNameList(this.docInfo.getHanjaFaceNameList());
    this.faceNameList(this.docInfo.getJapaneseFaceNameList());
    this.faceNameList(this.docInfo.getEtcFaceNameList());
    this.faceNameList(this.docInfo.getSymbolFaceNameList());
    this.faceNameList(this.docInfo.getUserFaceNameList());
  }

  /**
   * 글꼴 리스트를 쓴다.
   *
   * @param faceNameList 글꼴 리스트
   */
  private faceNameList(faceNameList: FaceName[]): void {
    for (const fa of faceNameList) {
      ForFaceName.write(fa, this.sw);
    }
  }

  /**
   * 테두리/배경 레코드들을 쓴다.
   */
  private borderFill(): void {
    for (const bf of this.docInfo.getBorderFillList()) {
      ForBorderFill.write(bf, this.sw);
    }
  }

  /**
   * 글자 모양 레코드들을 쓴다.
   */
  private charShape(): void {
    for (const cs of this.docInfo.getCharShapeList()) {
      ForCharShape.write(cs, this.sw);
    }
  }

  /**
   * 탭 정의 레코드들을 쓴다.
   */
  private tabDef(): void {
    for (const td of this.docInfo.getTabDefList()) {
      ForTabDef.write(td, this.sw);
    }
  }

  /**
   * 문단 번호 레코드들을 쓴다.
   */
  private numbering(): void {
    for (const n of this.docInfo.getNumberingList()) {
      ForNumbering.write(n, this.sw);
    }
  }

  /**
   * 글머리표 레코드들을 쓴다.
   */
  private bullet(): void {
    for (const b of this.docInfo.getBulletList()) {
      ForBullet.write(b, this.sw);
    }
  }

  /**
   * 문단 모양 레코드들을 쓴다.
   */
  private paraShape(): void {
    for (const ps of this.docInfo.getParaShapeList()) {
      ForParaShape.write(ps, this.sw);
    }
  }

  /**
   * 스타일 레코드들을 쓴다.
   */
  private style(): void {
    for (const s of this.docInfo.getStyleList()) {
      ForStyle.write(s, this.sw);
    }
  }

  /**
   * 문서 임의의 데이터 레코드를 쓴다.
   */
  private docData(): void {
    if (this.docInfo.getDocData() !== null) {
      ForUnknown.write(this.docInfo.getDocData()!, HWPTag.DOC_DATA, this.sw);
    }
  }

  /**
   * 금칙처리 문자 레코드를 쓴다.
   */
  private forbiddenChar(): void {
    if (this.docInfo.getForbiddenChar() !== null) {
      ForUnknown.write(this.docInfo.getForbiddenChar()!, HWPTag.FORBIDDEN_CHAR, this.sw);
    }
  }

  /**
   * 배포용 문서 데이터 레코드를 쓴다.
   */
  private distributeDocData(): void {
    if (this.docInfo.getDistributeDocData() !== null) {
      ForUnknown.write(this.docInfo.getDistributeDocData()!, HWPTag.DISTRIBUTE_DOC_DATA, this.sw);
    }
  }

  /**
   * 호환 문서 레코드를 쓴다.
   */
  private compatibleDocument(): void {
    if (this.docInfo.getCompatibleDocument() !== null) {
      ForCompatibleDocument.write(this.docInfo.getCompatibleDocument()!, this.sw);
    }
  }

  /**
   * 레이아웃 호환성 레코드를 쓴다.
   */
  private layoutCompatibility(): void {
    if (this.docInfo.getLayoutCompatibility() !== null) {
      ForLayoutCompatibility.write(this.docInfo.getLayoutCompatibility()!, this.sw);
    }
  }

  /**
   * 변경 추적 정보 레코드를 쓴다.
   */
  private trackChange(): void {
    if (this.docInfo.getTrackChange() !== null) {
      ForUnknown.write(this.docInfo.getTrackChange()!, HWPTag.TRACKCHANGE, this.sw);
    }
  }

  /**
   * 메모 모양 레코드를 쓴다.
   */
  private memoShape(): void {
    for (const memoShape of this.docInfo.getMemoShapeList()) {
      ForMemoShape.write(memoShape, this.sw);
    }
  }

  /**
   * 변경 추적 내용 및 모양 레코드를 쓴다.
   */
  private trackChange2(): void {
    for (const trackChange2 of this.docInfo.getTrackChange2List()) {
      ForUnknown.write(trackChange2, HWPTag.TRACK_CHANGE, this.sw);
    }
  }

  /**
   * 변경 추적 작성자 레코드를 쓴다.
   */
  private trackChangeAuthor(): void {
    for (const trackChangeAuthor of this.docInfo.getTrackChangeAuthorList()) {
      ForUnknown.write(trackChangeAuthor, HWPTag.TRACK_CHANGE_AUTHOR, this.sw);
    }
  }
}
