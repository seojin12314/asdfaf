/*
 * plain.js — "쉬운 말" 층. 명리 전문용어를 일반인 말로 바꿔 보여 준다.
 *  - 한 덩어리(대사 한 줄·리포트 한 장) 안에서 용어가 처음 나올 때만 "쉬운 말(원어)"로 병기하고, 그다음부터는 쉬운 말만.
 *  - 바꾼 뒤 조사(이/가·은/는·을/를·과/와·으로/로…)를 받침에 맞게 고친다.
 *  - 한 글자 용어(충·합·형)는 앞뒤가 한글이 아닐 때만 바꾼다(충분·합니다·유형 오염 방지).
 *  - 끄면(전문 용어 모드) 원문 그대로. 설정은 localStorage 'saju-plain'(기본 켜짐).
 */
(function (root) {
  'use strict';
  // 먼저 적용하는 문맥 규칙: "정화 일간" 같은 관용 표현
  const PRE = [
    [/([가-힣]{1,2}|[木火土金水]) 일간/g, '$1(타고난 글자)'],
    [/천간합/g, '윗글자끼리 묶임(천간합)'], [/일지충/g, '옆자리끼리 부딪힘(일지충)'],
    [/신강·신약/g, '힘이 센지 약한지(신강·신약)'],
  ];
  // [용어, 쉬운 말]. 긴 용어가 먼저 와야 한다(배우자성 > 재성, 신강신약 > 신강).
  const TERMS = [
    ['신강신약', '내 힘이 센지 약한지'], ['득령', '태어난 계절의 도움을 받음'], ['실령', '태어난 계절의 도움을 못 받음'], ['득지', '옆자리 글자의 받침을 받음'], ['실지', '옆자리 글자의 받침을 못 받음'], ['득세', '주변 글자의 도움'],
    ['배우자성', '짝 기운'], ['자녀성', '자녀 기운'], ['용신', '나한테 보탬이 되는 기운'], ['조후', '계절 균형'], ['억부', '힘 조절'],
    ['신강', '힘이 센 사주'], ['신약', '힘이 약한 사주'], ['중화', '힘이 중간인 사주'],
    ['비겁', '나와 같은 기운'], ['식상', '표현 기운'], ['재성', '돈 기운'], ['관성', '책임 기운'], ['인성', '배움 기운'],
    ['비견', '나와 같은 기운'], ['겁재', '나와 같지만 경쟁하는 기운'], ['식신', '표현 기운'], ['상관', '톡 쏘는 표현 기운'], ['정재', '차곡차곡 모으는 돈 기운'], ['편재', '크게 굴리는 돈 기운'], ['정관', '책임 기운'], ['편관', '압박 기운'], ['정인', '배움 기운'], ['편인', '독특한 배움 기운'],
    ['지장간', '아랫글자 속에 숨은 기운'], ['천간', '윗글자'], ['지지', '아랫글자'], ['일간', '나를 뜻하는 글자'], ['일지', '내 옆자리 글자'], ['월지', '태어난 달의 글자'], ['월간', '태어난 달의 윗글자'], ['시지', '태어난 시각의 글자'], ['년지', '태어난 해의 글자'],
    ['년주', '태어난 해 기둥'], ['월주', '태어난 달 기둥'], ['일주', '태어난 날 기둥'], ['시주', '태어난 시각 기둥'], ['원국', '타고난 사주판'],
    ['대운수', '큰 흐름이 바뀌는 나이'], ['대운', '10년 단위 큰 흐름'], ['세운', '그 해의 흐름'], ['월운', '그 달의 흐름'], ['절입', '절기가 시작되는 때'],
    ['십신', '기운의 종류'], ['오행', '다섯 가지 기운'], ['만세력', '사주 달력'], ['명리', '사주 공부'], ['진태양시', '실제 해 시각'], ['야자시', '밤 11시 이후 출생'],
    ['충', '부딪힘'], ['합', '묶임'], ['형', '마찰'],
  ];
  const SINGLE = new Set(['충', '합', '형']);
  // 일상어와 겹치는 용어는 문맥을 제한한다: 세운(세우다) · 상관(상관없다) · 일주(일주일) · 지지(지지하다)
  const CTX = {
    세운: '(?<![가-힣])세운(?=[이은을과와의에도만·,.?!)]|\\s*\\d|\\s*운|$)',
    상관: '상관(?!없|안|하|해|마|있|이\\s*없)',
    일주: '일주(?!일)',
    지지: '지지(?!하|해|받|율|층|자|선|도\\s*높)',
  };
  const SHORT = { 비견: '나', 겁재: '경쟁', 식신: '표현', 상관: '표현+', 정재: '돈', 편재: '큰돈', 정관: '책임', 편관: '압박', 정인: '배움', 편인: '직감' };
  // [받침 있을 때, 없을 때]
  const PARTICLES = [['이에요', '예요'], ['이었', '였'], ['이라', '라'], ['이다', '다'], ['이야', '야'], ['으로', '로'], ['이', '가'], ['은', '는'], ['을', '를'], ['과', '와']];
  const code = ch => ch.charCodeAt(0);
  const isHangul = ch => ch && code(ch) >= 0xac00 && code(ch) <= 0xd7a3;
  const hasBatchim = ch => isHangul(ch) && (code(ch) - 0xac00) % 28 !== 0;
  const endsRieul = ch => isHangul(ch) && (code(ch) - 0xac00) % 28 === 8;
  const lastHangul = s => { const m = s.match(/[가-힣](?=[^가-힣]*$)/); return m ? m[0] : null; };

  let on = true;
  try { on = localStorage.getItem('saju-plain') !== 'off'; } catch (e) { /* 저장소 없음 */ }

  /** tail(치환어 바로 뒤 문자열)의 맨 앞 조사를 lastCh의 받침에 맞게 고친다. */
  function fixParticle(tail, lastCh) {
    if (!lastCh || !tail) return tail;
    const b = hasBatchim(lastCh);
    for (const [withB, noB] of PARTICLES) {
      for (const [cand, isB] of [[withB, true], [noB, false]]) {
        if (!tail.startsWith(cand)) continue;
        const next = tail[cand.length]; if (isHangul(next) && !/^(이에요|예요)/.test(cand)) { if (cand.length === 1 && isHangul(next)) continue; }
        if (withB === '으로') return ((b && !endsRieul(lastCh)) ? '으로' : '로') + tail.slice(cand.length);
        return (b ? withB : noB) + tail.slice(cand.length);
      }
    }
    return tail;
  }

  /** 평문 한 덩어리 변환. seen: 같은 블록에서 이미 병기한 용어 집합. */
  function text(str, seen) {
    if (!on || !str) return str;
    seen = seen || new Set(); let s = String(str);
    // 괄호 안 원어는 자리표시자로 감춰 두었다가 마지막에 되돌린다(병기된 원어가 다시 치환되는 것 방지)
    const hold = []; const keep = v => { hold.push(v); return `${hold.length - 1}`; };
    // 문맥 규칙: 치환 뒤 조사는 앞말(정화)의 받침을 따른다
    for (const [re, rep] of PRE) {
      let m; re.lastIndex = 0;
      while ((m = re.exec(s))) {
        const base = m[1] || ''; const expl = rep.replace('$1', base);
        const open = expl.indexOf('('); const out = open >= 0 ? expl.slice(0, open + 1) + keep(expl.slice(open + 1, -1)) + ')' : expl;
        const rest = fixParticle(s.slice(m.index + m[0].length), lastHangul(base || expl));
        s = s.slice(0, m.index) + out + rest; re.lastIndex = m.index + out.length;
      }
    }
    for (const [term, plain] of TERMS) {
      const src = CTX[term] || (SINGLE.has(term) ? `(?<![가-힣])${term}(?![가-힣])` : term);
      const re = new RegExp(src, 'g'); let m;
      while ((m = re.exec(s))) {
        const first = !seen.has(term); seen.add(term);
        const rep = first ? `${plain}(${keep(term)})` : plain;
        const rest = fixParticle(s.slice(m.index + term.length), lastHangul(plain));
        s = s.slice(0, m.index) + rep + rest; re.lastIndex = m.index + rep.length;
      }
    }
    return s.replace(/(\d+)/g, (_, i) => hold[+i]);
  }
  /** HTML 조각 변환: 태그는 두고 텍스트 노드만. 한 호출이 한 블록(병기 1회). */
  function html(str, seen) {
    if (!on || !str) return str; seen = seen || new Set();
    return String(str).split(/(<[^>]+>)/g).map(part => (part.startsWith('<') ? part : text(part, seen))).join('');
  }
  function short(god) { return on && SHORT[god] ? SHORT[god] : god; }
  function set(v) { on = !!v; try { localStorage.setItem('saju-plain', on ? 'on' : 'off'); } catch (e) { /* ignore */ } }
  root.SajuPlain = { TERMS, PRE, text, html, short, set, get on() { return on; } };
})(typeof self !== 'undefined' ? self : this);
