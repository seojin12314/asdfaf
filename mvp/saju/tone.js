/*
 * tone.js — 캐릭터 말투 층. 리포트(마지막 페이지)의 해요체 문장을 캐릭터 말투로 바꿔 보여 준다(표시 전용, 데이터는 해요체 그대로).
 *  - 윤슬(flame): 반말 "~야/~어/~해"      - 복순 할머니(granny): 반말 + "~이란다/~렴"
 *  - 백운 도사(sage): 하게체 "~이다/~네/~거라"   - 서지안(hunter): 합쇼체 "~입니다/~습니다/~십시오"
 *  - 정경진(master)·도윤(mbti): 해요체 그대로(변환 없음)
 *  문장 끝 어절만 본다. 해요체로 판정되지 않는 어절(명사+요 등)은 건드리지 않는다. 어간 복원은 사전 + 모음 규칙(ㅂ·르·으 불규칙 일부).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SajuTone = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const STYLE = { flame: 'banmal', granny: 'granny', sage: 'hage', hunter: 'hamnida' };
  const BASE = 0xac00;
  const isH = ch => !!ch && ch >= '가' && ch <= '힣';
  const dec = ch => { const c = ch.charCodeAt(0) - BASE; return [Math.floor(c / 588), Math.floor((c % 588) / 28), c % 28]; };
  const com = (c, j, g) => String.fromCharCode(BASE + c * 588 + j * 28 + g);
  const jong = ch => (isH(ch) ? dec(ch)[2] : 0);
  const J = { ㅏ: 0, ㅐ: 1, ㅓ: 4, ㅔ: 5, ㅕ: 6, ㅗ: 8, ㅘ: 9, ㅙ: 10, ㅚ: 11, ㅜ: 13, ㅝ: 14, ㅟ: 16, ㅡ: 18, ㅣ: 20 };
  const RIEUL = 8, BIEUP = 17;

  // 해요체 "어간+어/아" 형 → 어간. (마지막 글자 사전 → 두 글자 사전 → 모음 규칙)
  const LAST = { 해: '하', 돼: '되', 와: '오', 봐: '보', 줘: '주', 둬: '두', 써: '쓰', 커: '크', 꺼: '끄', 떠: '뜨', 터: '트', 켜: '켜', 펴: '펴', 쳐: '치', 져: '지', 셔: '시', 여: '이', 놔: '놓' };
  const TWO = { 모아: '모으', 바빠: '바쁘', 아파: '아프', 나빠: '나쁘', 고파: '고프', 잠가: '잠그', 기뻐: '기쁘', 예뻐: '예쁘', 슬퍼: '슬프', 따라: '따르', 들러: '들르', 치러: '치르', 도와: '돕', 고와: '곱', 나아: '낫', 지어: '짓' };
  const IRR_B = /(쉬워|어려워|가까워|무거워|가벼워|더워|추워|고마워|아름다워|새로워|외로워|괴로워|부드러워|두려워|즐거워|반가워|무서워|미워|매워|싱거워|뜨거워|차가워|그리워|부끄러워|놀라워|해로워|이로워|날카로워|까다로워|번거로워|어지러워|간지러워|스러워|로워|다워)$/;
  function stemOf(form) {
    if (!form) return form;
    const m = form.match(IRR_B); if (m) { const cut = form.slice(0, -1); const p = cut.slice(-1); const [c, j] = dec(p); return cut.slice(0, -1) + com(c, j, BIEUP); } // 쉬워→쉽
    const two = form.slice(-2); if (TWO[two]) return form.slice(0, -2) + TWO[two];
    const last = form.slice(-1), rest = form.slice(0, -1);
    if (!isH(last)) return form;
    if ((last === '어' || last === '아') && rest) return rest; // 있어→있, 좋아→좋, 보아→보
    if (LAST[last] && !((last === '켜' || last === '펴') && rest)) return rest + LAST[last];
    const [c, j, g] = dec(last);
    if (g === 0) {
      if (j === J.ㅝ) return rest + com(c, J.ㅜ, 0); // 배워→배우, 나눠→나누
      if (j === J.ㅘ) return rest + com(c, J.ㅗ, 0);
      if (j === J.ㅕ) return rest + com(c, J.ㅣ, 0); // 보여→보이, 지켜→지키
      if ((last === '라' || last === '러') && rest) { const p = rest.slice(-1); if (isH(p)) { const [pc, pj, pg] = dec(p); if (pg === RIEUL) return rest.slice(0, -1) + com(pc, pj, 0) + '르'; } } // 몰라→모르
    }
    return form; // 가·나·사·자·서·내·보내·건너·세
  }
  // 어간 → 반말 "어/아" 형
  function conj(stem) {
    const last = stem.slice(-1), rest = stem.slice(0, -1);
    if (!isH(last)) return stem;
    if (last === '하') return rest + '해';
    if (last === '말' && /(^|지 )말$/.test(stem)) return rest + '마'; // 하지 마
    const [c, j, g] = dec(last);
    const bright = ch => { if (!isH(ch)) return false; const v = dec(ch)[1]; return v === J.ㅏ || v === J.ㅗ || v === J.ㅑ; };
    if (g === 0) {
      if ([J.ㅏ, J.ㅓ, J.ㅐ, J.ㅔ, J.ㅕ].includes(j)) return stem;
      if (j === J.ㅗ) return rest + com(c, J.ㅘ, 0);
      if (j === J.ㅜ) return rest + com(c, J.ㅝ, 0);
      if (j === J.ㅚ) return rest + com(c, J.ㅙ, 0);
      if (j === J.ㅣ) return rest + com(c, J.ㅕ, 0);
      if (j === J.ㅟ) return stem + '어';
      if (j === J.ㅡ) {
        const p = rest.slice(-1); const br = bright(p);
        if (last === '르' && rest && !/(따르|들르|치르|다다르)$/.test(stem)) { const [pc, pj] = dec(p); return rest.slice(0, -1) + com(pc, pj, RIEUL) + (br ? '라' : '러'); } // 고르→골라
        return rest + com(c, br ? J.ㅏ : J.ㅓ, 0); // 쓰→써, 모으→모아, 따르→따라
      }
      return stem;
    }
    if (g === BIEUP && IRR_B.test(rest + com(c, j, 0) + '워')) return rest + com(c, j, 0) + '워'; // 쉽→쉬워
    return stem + (bright(last) ? '아' : '어');
  }
  const dropRieul = stem => { const l = stem.slice(-1); const [c, j, g] = dec(l); return g === RIEUL ? stem.slice(0, -1) + com(c, j, 0) : stem; };
  function hamnida(stem) { const l = stem.slice(-1); if (!isH(l)) return stem + '입니다'; const [c, j, g] = dec(l); if (g === 0 || g === RIEUL) return stem.slice(0, -1) + com(c, j, BIEUP) + '니다'; return stem + '습니다'; }
  function hage(stem) { return dropRieul(stem) + '네'; }
  function sipsio(stem) { const g = jong(stem.slice(-1)); if (g === 0) return stem + '십시오'; if (g === RIEUL) return dropRieul(stem) + '십시오'; return stem + '으십시오'; }
  function ryeom(stem) { const g = jong(stem.slice(-1)); return stem + (g === 0 || g === RIEUL ? '렴' : '으렴'); }
  // "X(으)세요" → 명령 어간
  const IMP_DICT = { 마: '말', 드: '먹', 만드: '만들', 주무: '자', 계: '있', 사: '사' };
  function impStem(x, formal) {
    if (x.endsWith('으') && x.length >= 2 && jong(x.slice(-2, -1)) && jong(x.slice(-2, -1)) !== RIEUL) x = x.slice(0, -1); // 넣으세요→넣
    const k = Object.keys(IMP_DICT).find(key => x === key || x.endsWith(key) && key.length > 1);
    if (k && !(formal && k === '드')) return x.slice(0, x.length - k.length) + IMP_DICT[k];
    return x;
  }

  // 어절 하나(문장 끝)를 말투로 바꾼다. 바꿀 수 없으면 그대로.
  function word(w, style, isQ) {
    const B = style === 'banmal' || style === 'granny', H = style === 'hage', F = style === 'hamnida';
    const G = style === 'granny';
    let m;
    if ((m = w.match(/^(.*)거예요$/))) return m[1] + (F ? '것입니다' : H ? '거다' : G ? '거란다' : '거야');
    if ((m = w.match(/^(.*)아니에요$/))) return m[1] + (F ? '아닙니다' : H ? '아니다' : G ? '아니란다' : '아니야');
    if ((m = w.match(/^(.*)이에요$/))) return m[1] + (F ? '입니다' : H ? '이다' : G ? '이란다' : '이야');
    if ((m = w.match(/^(.*)예요$/))) return m[1] + (F ? '입니다' : H ? '다' : G ? '란다' : '야');
    if ((m = w.match(/^(.*)네요$/))) return m[1] + (F ? '군요' : G ? '구나' : '네');
    if ((m = w.match(/^(.*)죠$/))) return m[1] + (F ? '지요' : '지');
    if ((m = w.match(/^(.*)그래서요$/))) return m[1] + (F ? '그렇기 때문입니다' : H ? '그렇기 때문이다' : '그래서');
    if ((m = w.match(/^(.*?)(이라서|라서|니까|으니까)요$/)) && m[1]) { if (B) return m[1] + m[2]; const base = m[2] === '으니까' ? m[1] : m[2] === '니까' ? m[1].replace(/으$/, '') : m[1]; const tail = F ? '기 때문입니다' : '기 때문이다'; return base + (m[2] === '이라서' ? '이' : '') + tail; }
    if ((m = w.match(/^(.*[가-힣])서요$/)) && /[어아해와봐줘둬워셔져쳐켜펴려혀겨며벼]$/.test(m[1])) { if (B) return m[1] + '서'; const st = stemOf(m[1]); return st + (F ? '기 때문입니다' : '기 때문이다'); }
    if ((m = w.match(/^(.*)(거든|잖아|는데|은데|라고|다고)요$/))) return F ? w : m[1] + m[2];
    if ((m = w.match(/^(.*)[ㄹ을]?게요$/)) && /[을ㄹ]게요$|[가-힣]게요$/.test(w)) { const x = w.replace(/게요$/, ''); if (F) { const st = x.endsWith('을') ? x.slice(0, -1) : dropRieul(x); return st + '겠습니다'; } if (H) { const st = x.endsWith('을') ? x.slice(0, -1) : dropRieul(x); return st + '마'; } return x + '게'; }
    if ((m = w.match(/^(.*)까요$/))) return F ? w : m[1] + '까';
    if (isQ && (m = w.match(/^(.*)(나|가|ㄴ가|은가|는가)요$/))) return F ? w : m[1] + m[2];
    if ((m = w.match(/^(.*)세요$/))) {
      const x = m[1];
      if (!x) { // 어절이 '세요' 하나뿐 = "힘이 세요"(세다)
        return x + (F ? '셉니다' : H ? '세네' : '세');
      }
      const st = impStem(x, F);
      return F ? sipsio(st) : H ? st + '거라' : G ? ryeom(st) : conj(st);
    }
    if ((m = w.match(/^(.*[가-힣])요$/))) {
      const form = m[1]; const last = form.slice(-1); const [, j, g] = dec(last);
      if (g !== 0 || ![J.ㅏ, J.ㅓ, J.ㅐ, J.ㅕ, J.ㅘ, J.ㅝ, J.ㅙ, J.ㅞ].includes(j)) return w; // 명사+요 등은 손대지 않는다
      if (B) return form;
      const st = stemOf(form); return F ? hamnida(st) : hage(st);
    }
    return w;
  }
  // 문장 끝 어절만: 뒤에 문장부호·따옴표·공백·끝이 오는 한글 어절
  const RE = /([가-힣]+)(?=[.!?…"”’')\]]*(?:\s|$))/g;
  function text(str, pid) {
    const style = STYLE[pid]; if (!style || !str) return str;
    const s = String(str);
    return s.replace(RE, (w, _w, idx) => { const after = s.slice(idx + w.length, idx + w.length + 3); const isQ = /^[^\s]*\?/.test(after) || (after.trim() === '' && /\?\s*$/.test(s)); return word(w, style, isQ); });
  }
  /** 이미 그려진 DOM 안의 텍스트 노드를 바꾼다. skip: 건드리지 않을 조상 선택자. */
  function dom(rootEl, pid, skip) {
    if (!rootEl || !STYLE[pid] || typeof document === 'undefined') return;
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT); const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { if (!/[가-힣]/.test(n.nodeValue)) return; const p = n.parentElement; if (!p || (skip && p.closest(skip))) return; const v = text(n.nodeValue, pid); if (v !== n.nodeValue) n.nodeValue = v; });
  }
  return { STYLE, text, dom, word, stemOf, conj };
});
