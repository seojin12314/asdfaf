/*
 * mbti.js — 명식(사주) → MBTI 성향 추정 + 검사 MBTI와 교차 비교
 *
 * 전제: 사주와 MBTI 사이에 검증된 대응 관계는 없다. 아래 RULES는 오행·십신 비율을
 * 네 축에 매핑한 "공개 휴리스틱"이며, 화면에서도 근거와 함께 그대로 노출한다.
 * 목적은 예측이 아니라 '자기 인식(검사)'과 '타고난 기질(명식)'을 나란히 놓고 보게 하는 것.
 *
 * 축의 양(+) 방향 = left 글자. 비율(0~1)에 가중치를 곱해 합산 → tanh로 0~100% 변환.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SajuMBTI = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const ELEM_KO = { 木: '목', 火: '화', 土: '토', 金: '금', 水: '수' };
  const AXES = [
    { id: 'EI', left: 'E', right: 'I', leftKo: '외향', rightKo: '내향' },
    { id: 'SN', left: 'S', right: 'N', leftKo: '감각', rightKo: '직관' },
    { id: 'TF', left: 'T', right: 'F', leftKo: '사고', rightKo: '감정' },
    { id: 'JP', left: 'J', right: 'P', leftKo: '판단', rightKo: '인식' },
  ];
  // 양수 = left 글자 쪽. groups: 십신 그룹 비율, elems: 오행 비율, yang: 일간 음양, dayElem: 일간 오행
  const RULES = {
    EI: { groups: { 식상: 1.0, 비겁: 0.5, 인성: -1.0, 관성: -0.3 }, elems: { 火: 0.6, 木: 0.2, 水: -0.5, 金: -0.3 }, yang: 0.15 },
    SN: { groups: { 재성: 0.8, 관성: 0.5, 식상: -0.8, 인성: -0.4 }, elems: { 土: 0.7, 金: 0.4, 水: -0.6, 木: -0.5, 火: -0.2 } },
    TF: { groups: { 관성: 0.9, 재성: 0.6, 식상: -0.8, 인성: -0.3 }, elems: { 金: 0.7, 水: 0.4, 火: -0.5, 木: -0.4 }, dayElem: { 金: 0.15, 水: 0.15, 木: -0.15, 火: -0.15 } },
    JP: { groups: { 관성: 1.0, 인성: 0.4, 재성: 0.2, 식상: -0.9, 비겁: -0.4 }, elems: { 土: 0.6, 金: 0.4, 火: -0.4, 木: -0.3 } },
  };
  const RULE_NOTES = {
    EI: '식상(표현)·비겁(동료)·火는 밖으로, 인성(수용)·水·金은 안으로',
    SN: '재성(현실)·관성(규칙)·土·金은 감각으로, 식상(창의)·인성(사고)·水·木은 직관으로',
    TF: '관성(원칙)·재성(계산)·金·水는 사고로, 식상(공감)·火·木은 감정으로',
    JP: '관성(구조)·인성·土는 판단으로, 식상(즉흥)·비겁(자율)·火·木은 인식으로',
  };

  function estimate(result) {
    const gt = result.tenGods.length || 1, et = result.totalChars || 1;
    const g = {}; Object.keys(result.groups).forEach(k => { g[k] = result.groups[k] / gt; });
    const e = {}; Object.keys(result.elements).forEach(k => { e[k] = result.elements[k] / et; });
    const yang = result.dayMaster.polarity === '양' ? 1 : -1;
    const axes = AXES.map(a => {
      const R = RULES[a.id]; let raw = 0; const factors = [];
      Object.keys(R.groups).forEach(k => { const v = R.groups[k] * g[k]; if (v) { raw += v; factors.push({ label: `${k} ${result.groups[k]}/${gt}`, v }); } });
      Object.keys(R.elems).forEach(k => { const v = R.elems[k] * e[k]; if (v) { raw += v; factors.push({ label: `${k}(${ELEM_KO[k]}) ${result.elements[k]}/${et}`, v }); } });
      if (R.yang) { const v = R.yang * yang; raw += v; factors.push({ label: `일간 ${yang > 0 ? '양' : '음'}간`, v }); }
      if (R.dayElem && R.dayElem[result.dayMaster.element] != null) { const v = R.dayElem[result.dayMaster.element]; raw += v; factors.push({ label: `일간 ${result.dayMaster.element}(${ELEM_KO[result.dayMaster.element]})`, v }); }
      const pct = Math.round(50 + 50 * Math.tanh(raw * 1.8)); // left 글자 쪽 퍼센트
      const letter = pct >= 50 ? a.left : a.right;
      factors.sort((x, y) => Math.abs(y.v) - Math.abs(x.v));
      return Object.assign({}, a, { raw: Math.round(raw * 1000) / 1000, pct, letter, letterPct: letter === a.left ? pct : 100 - pct, strength: Math.abs(pct - 50) * 2, factors: factors.slice(0, 3), note: RULE_NOTES[a.id] });
    });
    return { letters: axes.map(a => a.letter).join(''), axes };
  }

  function parse(str) {
    const s = String(str || '').toUpperCase().replace(/[^EISNTFJP]/g, '');
    if (s.length !== 4) return null;
    const ok = AXES.every((a, i) => s[i] === a.left || s[i] === a.right);
    return ok ? s : null;
  }

  // 키: 검사 글자 + 명식 글자
  const TEXTS = {
    EI: {
      EI: '밖에서는 외향으로 움직이지만 명식의 기본값은 안으로 모으는 쪽입니다. 사람을 만난 뒤 혼자 회복하는 시간이 없으면 쉽게 방전되는 조합. 검사는 지금 역할이 만든 쓰는 방식, 명식은 충전 방식으로 읽으세요.',
      IE: '스스로는 내향이라 느끼지만 명식에는 표현하고 내보내는 기운이 큽니다. 표현을 억누르면 답답함이 몸으로 옵니다. 무대 자체보다 내 것을 꺼내는 통로가 필요한 유형.',
      EE: '자기 인식과 기질이 같은 방향. 에너지를 밖에서 얻고 밖에서 씁니다. 방향은 문제가 아니고 과열이 문제입니다.',
      II: '자기 인식과 기질이 같은 방향. 혼자 정리하는 시간이 곧 생산성입니다. 그 시간을 지키는 것이 전략.',
    },
    SN: {
      SN: '현실적으로 판단한다고 생각하지만 명식은 그림과 가능성을 먼저 보는 쪽입니다. 지금 환경이 디테일을 요구해서 감각형처럼 살고 있을 가능성. 큰 그림 일이 들어오면 의외로 빠릅니다.',
      NS: '아이디어형이라 느끼지만 명식은 손에 잡히는 것과 눈앞의 결과에 강합니다. 상상만 있고 착지가 안 될 때 자책하지 말고, 실행 단계부터 설계하면 강점이 나옵니다.',
      SS: '자기 인식과 기질이 같은 방향. 구체적인 것에서 힘이 납니다. 추상적인 목표는 숫자와 날짜로 바꿔 두세요.',
      NN: '자기 인식과 기질이 같은 방향. 패턴과 가능성을 먼저 봅니다. 디테일은 사람이나 도구에 맡기는 구조가 맞습니다.',
    },
    TF: {
      TF: '논리로 결정한다고 믿지만 명식은 사람과 온도를 먼저 읽습니다. 냉정한 결정을 내린 뒤 오래 마음에 남는 패턴. 감정을 약점이 아니라 데이터로 쓰세요.',
      FT: '공감형이라 느끼지만 명식에는 기준과 계산이 큽니다. 관계에서 맞춰 주다가 갑자기 선을 긋는 식으로 나옵니다. 처음부터 기준을 말하는 것이 서로 편합니다.',
      TT: '자기 인식과 기질이 같은 방향. 기준이 분명하고 결정이 빠릅니다. 설득보다 설명이 필요한 사람이 곁에 있는지 확인하세요.',
      FF: '자기 인식과 기질이 같은 방향. 관계의 온도를 먼저 봅니다. 거절을 미루는 비용이 가장 큰 유형.',
    },
    JP: {
      JP: '계획형으로 살고 있지만 명식은 흐름과 즉흥에 가깝습니다. 계획을 지키느라 쓰는 에너지가 큽니다. 큰 틀만 고정하고 안은 비워 두는 방식이 맞습니다.',
      PJ: '자유롭게 산다고 느끼지만 명식에는 틀과 책임의 기운이 큽니다. 정해진 구조가 없으면 오히려 불안해지는 유형. 루틴 하나가 생각보다 많은 것을 해결합니다.',
      JJ: '자기 인식과 기질이 같은 방향. 구조 안에서 힘이 납니다. 변수에 대비한 여유 칸을 계획에 미리 넣어 두세요.',
      PP: '자기 인식과 기질이 같은 방향. 열린 상태에서 가장 잘 움직입니다. 마감만 외부에 걸어 두면 됩니다.',
    },
  };
  const SUMMARY = {
    4: '자기 인식과 타고난 기질이 같은 방향입니다. 지금 환경이 당신을 잘 쓰고 있다는 뜻입니다.',
    3: '한 축만 다릅니다. 그 한 축이 평소 이유 없이 피곤한 지점일 가능성이 큽니다.',
    2: '절반이 다릅니다. 환경이 만든 모습과 기질이 섞여 있습니다. 어느 쪽이 쉬울 때의 나인지 돌아볼 것.',
    1: '검사 결과와 기질이 대부분 반대입니다. 지금 역할에 맞추느라 다른 사람처럼 살고 있거나, 검사 당시 상태가 반영됐을 수 있습니다.',
    0: '검사 결과와 기질이 정반대입니다. 둘 중 무엇이 맞느냐가 아니라, 어느 상황에서 어느 쪽이 나오는지가 질문입니다.',
  };

  function compare(test, est) {
    const t = parse(test); if (!t) return null;
    const axes = est.axes.map((a, i) => ({ id: a.id, test: t[i], chart: a.letter, match: t[i] === a.letter, chartPct: a.letterPct, text: TEXTS[a.id][t[i] + a.letter] }));
    const matches = axes.filter(x => x.match).length;
    return { test: t, chart: est.letters, axes, matches, summary: SUMMARY[matches] };
  }

  return { AXES, RULES, RULE_NOTES, TEXTS, SUMMARY, estimate, parse, compare };
});
