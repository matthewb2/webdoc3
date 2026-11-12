export function isParaMarksShown(): boolean {
  return !!document.getElementById('editor-container')?.classList.contains('show-para-marks');
}

/**
 * 문단부호(::after)의 하단선이 문단 끝 caret 하단선과 일치하도록
 * 각 문단 p에 CSS 변수 --pm-dy(px) 를 설정한다.
 */
export function alignParagraphMarks(root?: HTMLElement | null): void {
  const container = root || (document.getElementById('editor-container') as HTMLElement | null);
  if (!container) return;
  if (!container.classList.contains('show-para-marks')) return;

  const paras = Array.from(container.querySelectorAll('.page p')) as HTMLParagraphElement[];
  for (const p of paras) {
    try {
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false);

      let caretRect: DOMRect | null = null;
      const rects = range.getClientRects();
      if (rects && rects.length > 0) {
        caretRect = rects[rects.length - 1] as DOMRect;
      }
      if (!caretRect || (caretRect.width === 0 && caretRect.height === 0 && caretRect.top === 0 && caretRect.bottom === 0)) {
        const br = range.getBoundingClientRect();
        if (br) caretRect = br as DOMRect;
      }
      if (!caretRect || !Number.isFinite(caretRect.bottom)) continue;

      // 현재 흐름에서 문단부호가 렌더될 위치를 측정하기 위한 임시 probe
      const probe = document.createElement('span');
      probe.textContent = '\u21B5';
      probe.style.fontSize = '12px';
      probe.style.lineHeight = '1';
      probe.style.display = 'inline-block';
      probe.style.verticalAlign = 'baseline';
      probe.style.position = 'relative';
      probe.style.top = '0px';
      probe.style.marginLeft = '1px';
      probe.style.whiteSpace = 'nowrap';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      p.appendChild(probe);

      const probeRect = probe.getBoundingClientRect();
      probe.remove();
      if (!probeRect || !Number.isFinite(probeRect.bottom)) continue;

      let dy = caretRect.bottom - probeRect.bottom;
      // 비정상 값 방어 (레이아웃 일시 불안정 등)
      if (!Number.isFinite(dy)) continue;
      if (dy > 30) dy = 30;
      if (dy < -30) dy = -30;

      p.style.setProperty('--pm-dy', `${dy}px`);
    } catch {
      // ignore
    }
  }
}

let rafId: number | null = null;
export function scheduleAlignParagraphMarks(root?: HTMLElement | null): void {
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    rafId = null;
    alignParagraphMarks(root);
  });
}
