export function debugAndInspectHWPFile(hwpFile: any, _generatedBinary: Uint8Array): void {
  console.log('================ 🔍 HWP 덤프 인스펙션 시작 ================');

  const docInfo = hwpFile.docInfo;
  console.log('[DocInfo 검사]');

  const getCount = (listObj: any): number => {
    if (!listObj) return 0;
    if (typeof listObj.length === 'number') return listObj.length;
    if (typeof listObj.count === 'function') return listObj.count();
    if (typeof listObj.getCount === 'function') return listObj.getCount();
    if (typeof listObj.size === 'function') return listObj.size();
    // 내부 배열 프로퍼티 확인
    if (Array.isArray(listObj.list)) return listObj.list.length;
    return 0;
  };

  console.log(`- FaceName(글꼴) 개수: ${getCount(docInfo.faceNameList)}`);
  console.log(`- CharShape(글자모양) 개수: ${getCount(docInfo.charShapeList)}`);
  console.log(`- ParaShape(단락모양) 개수: ${getCount(docInfo.paraShapeList)}`);
  console.log(`- Style(스타일) 개수: ${getCount(docInfo.styleList)}`);

  const sections = hwpFile.bodyText?.sectionList;
  console.log('[BodyText 본문 검사]');
  console.log(`- 섹션(Section) 개수: ${sections?.length ?? 0}`);

  if (sections && sections.length > 0) {
    sections.forEach((sec: any, sIdx: number) => {
      const paras = sec.paragraphList || sec.paragraphs;
      console.log(`  > 섹션 #${sIdx} 내부 문단 개수: ${paras?.length ?? 0}`);
      
      paras?.forEach((para: any, pIdx: number) => {
        let textContent = '';
        try {
          textContent = para.text?.toPlainString?.() || para.text?.getText?.() || para.text || '텍스트 추출 성공';
        } catch {
          textContent = '텍스트 추출 실패';
        }
        console.log(`    - 문단 #${pIdx}: 내용 상태 = ${typeof textContent}`);
      });
    });
  }

  console.log('================ 🔍 HWP 덤프 인스펙션 종료 ================');
}

export function debugInspectDocInfoInternals(hwpFile: any): void {
  console.log('================ 🔬 DocInfo 내부 구조 심층 탐색 시작 ================' );

  const docInfo = hwpFile?.docInfo;
  if (!docInfo) {
    console.error('❌ docInfo 객체가 존재하지 않습니다.');
    return;
  }

  // docInfo가 가진 모든 키와 각 리스트 객체의 속성 구조를 탐색
  const keys = Object.keys(docInfo);
  console.log(`- docInfo 보유 키 목록:`, keys);

  keys.forEach((key) => {
    const listObj = docInfo[key];
    if (listObj && typeof listObj === 'object') {
      const subKeys = Object.keys(listObj);
      console.log(`  > [${key}] 타입: typeof object, 내부 프로퍼티들:`, subKeys);
      
      // 만약 내부에 배열이나 카운트 관련 메서드가 있는지 확인
      subKeys.forEach((subKey) => {
        const val = (listObj as any)[subKey];
        if (Array.isArray(val)) {
          console.log(`    * 배열 발견! [${key}.${subKey}] 길이:`, val.length);
        } else if (typeof val === 'function') {
          // 메서드인 경우 이름 출력
          // console.log(`    * 메서드 발견: ${subKey}`);
        }
      });
    }
  });

  console.log('================ 🔬 DocInfo 내부 구조 심층 탐색 종료 ================' );
}
