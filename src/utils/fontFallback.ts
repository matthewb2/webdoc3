export function fontFamilyWithFallback(name: string): string {
  const n = (name || '').trim();
  if (!n) return '';
  const lower = n.toLowerCase();
  // 함초롬바탕 / 함초롱바탕 / 바탕 계열
  if (lower.includes('함초롬바탕') || lower.includes('함초롱바탕') || lower.includes('hamchorombatang') || lower === '바탕' || lower === 'batang') {
    return '"함초롬바탕", "Batang", "바탕", serif';
  }
  // 함초롬돋움 / 함초롱돋움 / 돋움 계열
  if (lower.includes('함초롬돋움') || lower.includes('함초롱돋움') || lower.includes('hamchoromdotum') || lower === '돋움' || lower === 'dotum') {
    return '"함초롬돋움", "Malgun Gothic", "맑은 고딕", "Dotum", "돋움", sans-serif';
  }
  // 맑은 고딕
  if (lower.includes('맑은 고딕') || lower.includes('malgun gothic')) {
    return '"Malgun Gothic", "맑은 고딕", sans-serif';
  }
  // 굴림
  if (lower === '굴림' || lower === 'gulim') {
    return '"Gulim", "굴림", sans-serif';
  }
  // 궁서
  if (lower === '궁서' || lower === 'gungsuh') {
    return '"Gungsuh", "궁서", serif';
  }
  // 이미 fallback이 포함된 경우 그대로
  if (n.includes(',')) return n;
  // 일반 글꼴: 원본 + generic fallback
  return `"${n.replace(/"/g, '')}", sans-serif`;
}
