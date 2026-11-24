import { isFontInstalled, resolveMissingFont, getInstalledFonts } from './fontRegistry';

export function fontFamilyWithFallback(name: string): string {
  const n = (name || '').trim();
  if (!n) return '';
  const lower = n.toLowerCase();

  // 함초롬바탕 / 함초롱바탕 / 바탕 계열
  if (lower.includes('함초롬바탕') || lower.includes('함초롱바탕') || lower.includes('hamchorombatang') || lower === '바탕' || lower === 'batang') {
    return buildStack(n, ['함초롬바탕', 'Batang', '바탕', 'NanumMyeongjo', 'Noto Serif KR'], 'serif');
  }
  // 함초롬돋움 / 함초롱돋움 / 돋움 계열
  if (lower.includes('함초롬돋움') || lower.includes('함초롱돋움') || lower.includes('hamchoromdotum') || lower === '돋움' || lower === 'dotum') {
    return buildStack(n, ['함초롬돋움', 'Malgun Gothic', '맑은 고딕', 'Dotum', '돋움', 'NanumGothic', 'Noto Sans KR'], 'sans-serif');
  }
  // 맑은 고딕
  if (lower.includes('맑은 고딕') || lower.includes('malgun gothic')) {
    return buildStack(n, ['Malgun Gothic', '맑은 고딕', 'NanumGothic', 'Noto Sans KR'], 'sans-serif');
  }
  // 굴림
  if (lower === '굴림' || lower === 'gulim') {
    return buildStack(n, ['Gulim', '굴림', 'Malgun Gothic', '맑은 고딕'], 'sans-serif');
  }
  // 궁서
  if (lower === '궁서' || lower === 'gungsuh') {
    return buildStack(n, ['Gungsuh', '궁서', 'Batang', '바탕'], 'serif');
  }
  // 이미 fallback이 포함된 경우 그대로
  if (n.includes(',')) return n;

  // 일반 글꼴: 시스템에 없으면 유사 글꼴로 대체
  const resolved = resolveMissingFont(n);
  const primary = resolved && resolved !== n ? resolved : n;
  if (getInstalledFonts().length > 0 && !isFontInstalled(primary)) {
    const alt = resolveMissingFont(primary);
    if (alt && alt !== primary) return `"${primary.replace(/"/g, '')}", "${alt.replace(/"/g, '')}", sans-serif`;
  }
  if (primary !== n) return `"${n.replace(/"/g, '')}", "${primary.replace(/"/g, '')}", sans-serif`;
  return `"${n.replace(/"/g, '')}", sans-serif`;
}

function buildStack(original: string, candidates: string[], generic: string): string {
  const installed = getInstalledFonts();
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (f: string) => {
    const k = f.toLowerCase().replace(/['"]/g, '').trim();
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(`"${f.replace(/"/g, '')}"`);
  };

  add(original);
  // if registry loaded, prefer installed candidates first
  if (installed.length > 0) {
    for (const c of candidates) if (isFontInstalled(c)) add(c);
  }
  // then add remaining candidates as fallbacks anyway
  for (const c of candidates) add(c);
  out.push(generic);
  return out.join(', ');
}
