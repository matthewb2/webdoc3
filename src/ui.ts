/**
 * 앱 UI를 동적으로 생성한다.
 * index.html의 하드코딩 요소를 대체하며, 기존 리스너/로직이 사용하는 id/class 구조를 유지한다.
 */
export function createAppUI(): void {
  if (document.querySelector('.toolbar')) return; // 중복 생성 방지

  const frag = document.createElement('div');
  frag.innerHTML = `
    <div class="toolbar" style="visibility:hidden">
        <div class="ribbon-tabs">
            <button type="button" class="ribbon-tab active" data-tab-target="file">파일</button>
            <button type="button" class="ribbon-tab" data-tab-target="edit">편집</button>
            <button type="button" class="ribbon-tab" data-tab-target="view">보기</button>
            <button type="button" class="ribbon-tab" data-tab-target="input">입력</button>
            <button type="button" class="ribbon-tab" data-tab-target="format">서식</button>
            <button type="button" class="ribbon-tab" data-tab-target="page">쪽</button>
            <span class="ribbon-tabs-spacer"></span>
            <span id="hwp-status" class="status"></span>
        </div>
        <div class="ribbon-body">
            <div class="ribbon-panel active" data-tab="file">
                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <button id="btn-new-file" class="toolbar-btn" type="button" title="새 문서 만들기"><i class="bi bi-file-earmark-plus"></i> 새 문서</button>
                            <button id="btn-open-file" class="toolbar-btn" type="button" title="파일 열기"><i class="bi bi-folder2-open"></i> 파일 열기</button>
                            <button id="btn-save" class="toolbar-btn" type="button" title="현재 문서에 덮어쓰기 저장"><i class="bi bi-save"></i> 저장</button>
                            <button id="btn-save-as" class="toolbar-btn" type="button" title="다른 이름으로 저장"><i class="bi bi-save2"></i> 다른 이름으로 저장</button>
                        </div>
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="recent-files-select"><i class="bi bi-clock-history"></i> 최근 파일</label>
                            <select id="recent-files-select" class="toolbar-select recent-files-select" title="최근 사용한 파일">
                                <option value="">최근 사용한 파일</option>
                            </select>
                        </div>
                    </div>
                    <div class="ribbon-group-title">파일</div>
                </div>
            </div>

            <div class="ribbon-panel" data-tab="edit">
                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="find-text-input"><i class="bi bi-search"></i> 찾기</label>
                            <input id="find-text-input" class="toolbar-select" type="text" placeholder="찾을 내용" style="width:140px" title="찾을 내용">
                            <button id="btn-find-next" class="toolbar-btn" type="button" title="다음 찾기"><i class="bi bi-arrow-down-right-circle"></i> 다음 찾기</button>
                        </div>
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="replace-text-input"><i class="bi bi-arrow-repeat"></i> 바꾸기</label>
                            <input id="replace-text-input" class="toolbar-select" type="text" placeholder="바꿀 내용" style="width:140px" title="바꿀 내용">
                            <button id="btn-replace" class="toolbar-btn" type="button" title="바꾸기"><i class="bi bi-arrow-repeat"></i> 바꾸기</button>
                            <button id="btn-replace-all" class="toolbar-btn" type="button" title="모두 바꾸기"><i class="bi bi-check2-all"></i> 모두 바꾸기</button>
                        </div>
                    </div>
                    <div class="ribbon-group-title">찾기 및 바꾸기</div>
                </div>
            </div>

            <div class="ribbon-panel" data-tab="view">
                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <button id="btn-preview" class="toolbar-btn" type="button" title="읽기 전용 미리보기"><i class="bi bi-file-earmark-break"></i> 미리보기</button>
                        </div>
                    </div>
                    <div class="ribbon-group-title">문서 보기</div>
                </div>
                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="show-para-marks-checkbox" title="문단 끝에 문단부호(¶) 표시">
                                <input id="show-para-marks-checkbox" type="checkbox"> <i class="bi bi-pilcrow"></i> 문단부호
                            </label>
                        </div>
                    </div>
                    <div class="ribbon-group-title">표시</div>
                </div>
            </div>

            <div class="ribbon-panel" data-tab="input">
                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="table-rows-input"><i class="bi bi-distribute-vertical"></i> 행</label>
                            <select id="table-rows-input" class="toolbar-select" style="width:52px" title="행 수">
                              <option value="1">1</option>
                              <option value="2" selected>2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="8">8</option>
                              <option value="10">10</option>
                            </select>
                            <label class="toolbar-label" for="table-cols-input"><i class="bi bi-distribute-horizontal"></i> 열</label>
                            <select id="table-cols-input" class="toolbar-select" style="width:52px" title="열 수">
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3" selected>3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="8">8</option>
                              <option value="10">10</option>
                            </select>
                        </div>
                        <div class="ribbon-row">
                            <button id="btn-insert-table" class="toolbar-btn" type="button" title="표 삽입"><i class="bi bi-table"></i> 표 삽입</button>
                        </div>
                    </div>
                    <div class="ribbon-group-title">표</div>
                </div>

                <div id="ribbon-group-table-props" class="ribbon-group" style="display:none">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <button id="btn-table-border-default" class="toolbar-btn" type="button" title="모든 테두리 표시">기본</button>
                            <button id="btn-table-border-none" class="toolbar-btn" type="button" title="테두리 없음">테두리 없음</button>
                            <button id="btn-table-border-no-v" class="toolbar-btn" type="button" title="세로줄 없음">세로줄 없음</button>
                        </div>
                    </div>
                    <div class="ribbon-group-title">표 속성</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <button id="btn-insert-shape-rect" class="toolbar-btn" type="button" title="사각형 삽입">□ 사각형</button>
                            <button id="btn-insert-shape-ellipse" class="toolbar-btn" type="button" title="타원 삽입">○ 타원</button>
                        </div>
                        <div class="ribbon-row">
                            <button id="btn-insert-shape-line" class="toolbar-btn" type="button" title="직선 삽입">／ 직선</button>
                            <button id="btn-insert-shape-arrow" class="toolbar-btn" type="button" title="화살표 삽입">→ 화살표</button>
                        </div>
                    </div>
                    <div class="ribbon-group-title">도형 개체</div>
                </div>

                <div class="ribbon-group" id="ribbon-group-shape-props">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="shape-placement-select">본문과의 배치</label>
                            <select id="shape-placement-select" class="toolbar-select" title="선택한 도형의 본문 배치">
                              <option value="default">기본</option>
                              <option value="front">글 앞에 배치</option>
                              <option value="back">글 뒤에 배치</option>
                            </select>
                        </div>
                    </div>
                    <div class="ribbon-group-title">개체 속성</div>
                </div>
            </div>
            <div class="ribbon-panel" data-tab="format">
                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <button id="btn-style-body" class="toolbar-btn" type="button" title="본문 스타일 적용"><i class="bi bi-text-paragraph"></i> 본문</button>
                            <button id="btn-style-title" class="toolbar-btn" type="button" title="제목 스타일 적용"><i class="bi bi-type-h1"></i> 제목</button>
                        </div>
                    </div>
                    <div class="ribbon-group-title">스타일</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="font-family-select"><i class="bi bi-fonts"></i> 글꼴</label>
                            <select id="font-family-select" class="toolbar-select" disabled>
                              <option>Arial</option>
                              <option>Verdana</option>
                              <option>Tahoma</option>
                              <option>Times New Roman</option>
                              <option>Georgia</option>
                              <option>Courier New</option>
                              <option>맑은 고딕</option>
                              <option>굴림</option>
                              <option>돋움</option>
                              <option>바탕</option>
                              <option>궁서</option>
                              <option>나눔고딕</option>
                              <option>Noto Sans KR</option>
                            </select>
                            <label class="toolbar-label" for="font-size-select"><i class="bi bi-aspect-ratio"></i> 크기(pt)</label>
                            <select id="font-size-select" class="toolbar-select" disabled>
                              <option value="8">8</option>
                              <option value="9">9</option>
                              <option value="10">10</option>
                              <option value="10.5">10.5</option>
                              <option value="11">11</option>
                              <option value="12">12</option>
                              <option value="14">14</option>
                              <option value="16">16</option>
                              <option value="18">18</option>
                              <option value="20">20</option>
                              <option value="22">22</option>
                              <option value="24">24</option>
                              <option value="26">26</option>
                              <option value="28">28</option>
                              <option value="36">36</option>
                              <option value="48">48</option>
                              <option value="72">72</option>
                            </select>
                        </div>
                        <div class="ribbon-row">
                            <button id="btn-style-normal" class="toolbar-btn" type="button" title="보통 (서식 지우기)"><i class="bi bi-eraser"></i> 보통</button>
                            <button id="btn-style-bold" class="toolbar-btn toolbar-btn-style" type="button" title="굵게"><i class="bi bi-type-bold"></i></button>
                            <button id="btn-style-italic" class="toolbar-btn toolbar-btn-style" type="button" title="기울임"><i class="bi bi-type-italic"></i></button>
                            <button id="btn-style-underline" class="toolbar-btn toolbar-btn-style" type="button" title="밑줄"><i class="bi bi-type-underline"></i></button>
                        </div>
                    </div>
                    <div class="ribbon-group-title">글꼴</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="column-count-select"><i class="bi bi-layout-three-columns"></i> 다단</label>
                            <select id="column-count-select" class="toolbar-select">
                              <option value="1">1단</option>
                              <option value="2">2단</option>
                              <option value="3">3단</option>
                            </select>
                            <label class="toolbar-label" for="align-select"><i class="bi bi-text-left"></i> 정렬</label>
                            <select id="align-select" class="toolbar-select">
                              <option value="left">왼쪽</option>
                              <option value="center">가운데</option>
                              <option value="right">오른쪽</option>
                              <option value="justify">양쪽</option>
                            </select>
                        </div>
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="line-spacing-select"><i class="bi bi-text-indent-left"></i> 줄간격</label>
                            <select id="line-spacing-select" class="toolbar-select">
                              <option value="100">100%</option>
                              <option value="120">120%</option>
                              <option value="150">150%</option>
                              <option value="160">160%</option>
                              <option value="200">200%</option>
                            </select>
                        </div>
                    </div>
                    <div class="ribbon-group-title">단락</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="text-color-input"><i class="bi bi-palette"></i> 글자색</label>
                            <input id="text-color-input" class="toolbar-color" type="color" value="#000000" title="글자색 (두 번 클릭하면 기본값)">
                        </div>
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="bg-color-input"><i class="bi bi-paint-bucket"></i> 배경색</label>
                            <input id="bg-color-input" class="toolbar-color" type="color" value="#ffffff" title="배경색 (두 번 클릭하면 없음)">
                        </div>
                    </div>
                    <div class="ribbon-group-title">색</div>
                </div>
            </div>

            <div class="ribbon-panel" data-tab="page">
                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <span class="toolbar-label"><i class="bi bi-file-earmark"></i> 용지</span>
                            <span class="toolbar-label" title="현재 고정 설정">A4 (210 × 297mm)</span>
                        </div>
                    </div>
                    <div class="ribbon-group-title">용지</div>
                </div>
                <div class="ribbon-group">
                    <div class="ribbon-group-items">
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="margin-top-input">위</label>
                            <input id="margin-top-input" class="toolbar-select" type="number" min="0" max="80" step="1" style="width:56px" title="위쪽 여백(mm)">
                            <label class="toolbar-label" for="margin-bottom-input">아래</label>
                            <input id="margin-bottom-input" class="toolbar-select" type="number" min="0" max="80" step="1" style="width:56px" title="아래쪽 여백(mm)">
                        </div>
                        <div class="ribbon-row">
                            <label class="toolbar-label" for="margin-left-input">왼쪽</label>
                            <input id="margin-left-input" class="toolbar-select" type="number" min="0" max="80" step="1" style="width:56px" title="왼쪽 여백(mm)">
                            <label class="toolbar-label" for="margin-right-input">오른쪽</label>
                            <input id="margin-right-input" class="toolbar-select" type="number" min="0" max="80" step="1" style="width:56px" title="오른쪽 여백(mm)">
                            <button id="btn-apply-margins" class="toolbar-btn" type="button" title="페이지 여백 적용"><i class="bi bi-check2"></i> 적용</button>
                        </div>
                    </div>
                    <div class="ribbon-group-title">여백 (mm)</div>
                </div>
            </div>
        </div>
        <input id="file-input" type="file" accept=".hwp,.hwpx,.docx,.odt" hidden />
    </div>

    <!-- 가이드선 -->
    <div id="ruler-guide" class="ruler-guide-line"></div>

    <!-- 뷰포트 -->
    <div class="editor-viewport">
        <div class="ruler-container">
            <div class="ruler-center">
                <div class="ruler-track" id="ruler-track">
                    <div class="ruler-ticks" id="ruler-ticks"></div>
                    <div id="marker-first-line" class="ruler-marker ruler-marker-first-line" title="첫 줄 들여쓰기" style="left: 85px;"></div>
                    <div id="marker-left-indent" class="ruler-marker ruler-marker-left-indent" title="왼쪽 들여쓰기" style="left: 85px;"></div>
                </div>
            </div>
        </div>
        <div id="editor-container" spellcheck="false"></div>
    </div>

    <div class="preview-toolbar" style="display:none">
        <span id="preview-mode-label" class="statusbar-info" title="페이지를 클릭하면 쪽맞춤으로 전환"><i class="bi bi-eye"></i> 미리보기 (읽기 전용)</span>
        <span class="statusbar-spacer"></span>
        <button id="btn-preview-fit" class="toolbar-btn" type="button" title="화면에 페이지 폭 맞추기"><i class="bi bi-arrows-fullscreen"></i> 쪽맞춤</button>
        <button id="btn-preview-two-pages" class="toolbar-btn" type="button" title="두 페이지씩 나란히 보기"><i class="bi bi-book"></i> 맞쪽보기</button>
        <button id="btn-preview-edit" class="toolbar-btn" type="button"><i class="bi bi-pencil"></i> 편집</button>
        <button id="btn-preview-close" class="toolbar-btn" type="button"><i class="bi bi-x-lg"></i> 닫기</button>
    </div>
    <div class="preview-viewport" style="display:none">
        <div id="preview-container"></div>
    </div>
    <div class="preview-statusbar" style="display:none">
        <span id="preview-cursor-page" class="statusbar-info">미리보기 모드</span>
        <span class="statusbar-spacer"></span>
        <button id="btn-preview-zoom-out" class="statusbar-btn" type="button" title="축소"><i class="bi bi-dash"></i></button>
        <button id="preview-zoom-label" class="statusbar-zoom" type="button">100%</button>
        <button id="btn-preview-zoom-in" class="statusbar-btn" type="button" title="확대"><i class="bi bi-plus"></i></button>
    </div>

    <div id="cell-menu" class="context-menu" style="display:none">
        <button id="cell-menu-merge" type="button"><i class="bi bi-arrows-collapse"></i> 셀 합치기 (M)</button>
    </div>

    <div class="statusbar" style="visibility:hidden">
        <span id="cursor-page" class="statusbar-info" title="커서 위치 페이지">- / -</span>
        <span class="statusbar-spacer"></span>
        <button id="btn-zoom-out" class="statusbar-btn" type="button" title="축소"><i class="bi bi-dash"></i></button>
        <button id="zoom-label" class="statusbar-zoom" type="button">100%</button>
        <button id="btn-zoom-in" class="statusbar-btn" type="button" title="확대"><i class="bi bi-plus"></i></button>
    </div>
  `;

  // fragment children를 body 앞쪽(스크립트 앞)에 삽입
  while (frag.firstChild) {
    document.body.appendChild(frag.firstChild);
  }
}

export function showAppUI(): void {
  const toolbar = document.querySelector('.toolbar') as HTMLElement | null;
  const statusbar = document.querySelector('.statusbar') as HTMLElement | null;
  if (toolbar) toolbar.style.visibility = 'visible';
  if (statusbar) statusbar.style.visibility = 'visible';
}