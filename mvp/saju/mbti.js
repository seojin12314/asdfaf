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
  const GN = { 비겁: '나 자신의 힘', 식상: '내보내는 힘', 재성: '손에 쥐는 힘', 관성: '나를 누르는 힘', 인성: '쉬고 배우는 힘' };
  const EN = { 木: '나무 기운', 火: '불 기운', 土: '흙 기운', 金: '쇠 기운', 水: '물 기운' };
  const LAT_B = { L: 1, M: 1, N: 1, R: 1 };
  function jo(w, b, n) { const t = String(w).replace(/[)\]\s]+$/, ''); const ch = t[t.length - 1] || ''; const c = ch.charCodeAt(0); const hasB = (c >= 0xac00 && c <= 0xd7a3) ? (c - 0xac00) % 28 !== 0 : /[A-Za-z]/.test(ch) ? !!LAT_B[ch.toUpperCase()] : false; return w + (hasB ? b : n); }
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
    EI: '내보내는 힘·나 자신의 힘·불 기운은 밖으로, 쉬고 배우는 힘·물·쇠 기운은 안으로',
    SN: '손에 쥐는 힘·나를 누르는 힘·흙·쇠 기운은 감각으로, 내보내는 힘·쉬고 배우는 힘·물·나무 기운은 직관으로',
    TF: '나를 누르는 힘·손에 쥐는 힘·쇠·물 기운은 사고로, 내보내는 힘·불·나무 기운은 감정으로',
    JP: '나를 누르는 힘·쉬고 배우는 힘·흙 기운은 판단으로, 내보내는 힘·나 자신의 힘·불·나무 기운은 인식으로',
  };

  function estimate(result) {
    const gt = result.tenGods.length || 1, et = result.totalChars || 1;
    const g = {}; Object.keys(result.groups).forEach(k => { g[k] = result.groups[k] / gt; });
    const e = {}; Object.keys(result.elements).forEach(k => { e[k] = result.elements[k] / et; });
    const yang = result.dayMaster.polarity === '양' ? 1 : -1;
    const axes = AXES.map(a => {
      const R = RULES[a.id]; let raw = 0; const factors = [];
      Object.keys(R.groups).forEach(k => { const v = R.groups[k] * g[k]; if (v) { raw += v; factors.push({ label: `${GN[k]} ${result.groups[k]}개`, v }); } });
      Object.keys(R.elems).forEach(k => { const v = R.elems[k] * e[k]; if (v) { raw += v; factors.push({ label: `${EN[k]} ${result.elements[k]}개`, v }); } });
      if (R.yang) { const v = R.yang * yang; raw += v; factors.push({ label: `타고난 글자가 ${yang > 0 ? '양' : '음'}`, v }); }
      if (R.dayElem && R.dayElem[result.dayMaster.element] != null) { const v = R.dayElem[result.dayMaster.element]; raw += v; factors.push({ label: `타고난 글자가 ${EN[result.dayMaster.element]}`, v }); }
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
      EI: '밖에서는 외향으로 움직이지만 타고난 결은 안으로 모으는 쪽이에요. 사람을 만난 뒤 혼자 회복할 시간이 없으면 쉽게 방전돼요. 검사는 지금 쓰는 방식, 타고난 결은 충전 방식으로 읽으세요.',
      IE: '스스로는 내향이라 느끼지만 타고난 결에는 꺼내고 내보내는 힘이 커요. 표현을 누르면 답답함이 몸으로 와요. 무대보다 내 것을 꺼내는 통로가 필요한 사람이에요.',
      EE: '자기 인식과 타고난 결이 같은 방향이에요. 에너지를 밖에서 얻고 밖에서 써요. 방향이 아니라 과열이 문제예요.',
      II: '자기 인식과 타고난 결이 같은 방향이에요. 혼자 정리하는 시간이 곧 생산성이에요. 그 시간을 지키는 게 전략이에요.',
    },
    SN: {
      SN: '현실적으로 판단한다고 생각하지만 타고난 결은 가능성을 먼저 봐요. 지금 환경이 디테일을 요구해서 감각형처럼 살고 있을 수 있어요. 큰 그림 일이 오면 의외로 빨라요.',
      NS: '아이디어형이라 느끼지만 타고난 결은 손에 잡히는 결과에 강해요. 상상만 있고 착지가 안 될 때 자책하지 마세요. 실행 단계부터 설계하면 강점이 나와요.',
      SS: '자기 인식과 타고난 결이 같은 방향이에요. 구체적인 것에서 힘이 나요. 추상적인 목표는 숫자와 날짜로 바꿔 두세요.',
      NN: '자기 인식과 타고난 결이 같은 방향이에요. 패턴과 가능성을 먼저 봐요. 디테일은 사람이나 도구에 맡기는 구조가 맞아요.',
    },
    TF: {
      TF: '논리로 결정한다고 믿지만 타고난 결은 사람과 온도를 먼저 읽어요. 냉정하게 정한 뒤 오래 마음에 남는 편이에요. 감정을 약점이 아니라 자료로 쓰세요.',
      FT: '공감형이라 느끼지만 타고난 결에는 기준과 계산이 커요. 맞춰 주다가 갑자기 선을 긋는 식으로 나와요. 처음부터 기준을 말하는 게 서로 편해요.',
      TT: '자기 인식과 타고난 결이 같은 방향이에요. 기준이 분명하고 결정이 빨라요. 설득보다 설명이 필요한 사람이 곁에 있는지 보세요.',
      FF: '자기 인식과 타고난 결이 같은 방향이에요. 관계의 온도를 먼저 봐요. 거절을 미루는 비용이 가장 큰 사람이에요.',
    },
    JP: {
      JP: '계획형으로 살고 있지만 타고난 결은 흐름과 즉흥에 가까워요. 계획을 지키느라 쓰는 힘이 커요. 큰 틀만 고정하고 안은 비워 두는 방식이 맞아요.',
      PJ: '자유롭게 산다고 느끼지만 타고난 결에는 틀과 책임의 힘이 커요. 정해진 구조가 없으면 오히려 불안해져요. 루틴 하나가 생각보다 많은 것을 풀어요.',
      JJ: '자기 인식과 타고난 결이 같은 방향이에요. 구조 안에서 힘이 나요. 변수에 대비한 여유 칸을 계획에 미리 넣어 두세요.',
      PP: '자기 인식과 타고난 결이 같은 방향이에요. 열린 상태에서 가장 잘 움직여요. 마감만 밖에 걸어 두면 돼요.',
    },
  };
  const SUMMARY = {
    4: '자기 인식과 타고난 결이 같은 방향이에요. 지금 환경이 당신을 잘 쓰고 있다는 뜻이에요.',
    3: '한 축만 달라요. 그 한 축이 평소 이유 없이 피곤한 지점일 가능성이 커요.',
    2: '절반이 달라요. 환경이 만든 모습과 타고난 결이 섞여 있어요. 어느 쪽이 쉴 때의 나인지 돌아보세요.',
    1: '검사 결과와 타고난 결이 대부분 반대예요. 지금 역할에 맞추느라 다른 사람처럼 살고 있을 수 있어요. 검사 당시 상태가 반영됐을 수도 있어요.',
    0: '검사 결과와 타고난 결이 정반대예요. 둘 중 무엇이 맞느냐가 아니라, 어느 상황에서 어느 쪽이 나오는지가 질문이에요.',
  };

  const AXIS_DEEP = {
    E: '명식에서 외향으로 기우는 사람은 에너지를 밖에서 만듭니다. 식상과 비겁, 화의 기운이 그 통로입니다. 사람을 만나고 말하고 움직일 때 충전되고, 혼자 오래 있으면 생각이 아니라 불안이 자랍니다. 다만 명식의 외향은 사교성이 아니라 출력 욕구에 가깝습니다. 조용한 외향, 즉 혼자서라도 만들어 내보내는 사람도 여기 속합니다.',
    I: '명식에서 내향으로 기우는 사람은 에너지를 안에서 만듭니다. 인성과 수·금의 기운이 그 통로입니다. 받아들이고 정리하고 쉴 때 충전되고, 자극이 많으면 빨리 소모됩니다. 명식의 내향은 수줍음이 아니라 입력 우선입니다. 사람 앞에서 잘 말하더라도 끝나고 나면 반드시 혼자 회복해야 하는 사람입니다.',
    S: '감각 쪽으로 기우는 명식은 재성과 관성, 토·금이 많습니다. 손에 잡히는 것, 숫자, 절차, 눈앞의 결과를 신뢰합니다. 추상적인 비전보다 그래서 이번 달에 무엇을 하는지가 중요합니다. 강점은 실행과 디테일, 약점은 큰 그림을 남에게 맡겨 버리는 것입니다.',
    N: '직관 쪽으로 기우는 명식은 식상과 인성, 수·목이 많습니다. 패턴, 가능성, 아직 없는 것을 먼저 봅니다. 디테일은 지루하고, 반복은 고통입니다. 강점은 연결과 발상, 약점은 착지입니다. 아이디어를 실행 단계로 쪼개 주는 사람이나 도구가 곁에 있어야 합니다.',
    T: '사고 쪽으로 기우는 명식은 관성과 재성, 금·수가 많습니다. 기준·규칙·계산으로 결정하고, 감정은 결정 뒤에 처리합니다. 공정함을 중시하고 애매함을 싫어합니다. 강점은 일관성, 약점은 사람의 온도를 늦게 읽어 관계에서 비싼 대가를 치르는 것입니다.',
    F: '감정 쪽으로 기우는 명식은 식상과 인성, 화·목이 많습니다. 사람과 분위기, 관계의 온도를 먼저 읽고 결정합니다. 공감이 빠르고 거절이 느립니다. 강점은 연결과 신뢰, 약점은 기준 없이 맞춰 주다 소진되는 것입니다. 감정을 데이터로 쓰되 결정 기준은 따로 적어 두어야 합니다.',
    J: '판단 쪽으로 기우는 명식은 관성과 인성, 토·금이 많습니다. 계획·구조·마감 안에서 힘이 나고, 열린 상태를 불편해합니다. 강점은 완수, 약점은 변수 앞에서 경직되는 것입니다. 계획에 비워 둔 칸을 미리 넣어 두면 유연함이 생깁니다.',
    P: '인식 쪽으로 기우는 명식은 식상과 비겁, 화·목이 많습니다. 열린 상태, 즉흥, 선택지를 남겨 두는 것에서 힘이 나고, 구조는 숨 막힙니다. 강점은 적응과 발상, 약점은 마무리입니다. 마감만 외부에 걸어 두면 가장 창의적으로 끝냅니다.',
  };
  const EXPERIMENT = {
    EI: '2주 동안 사람을 만난 날과 혼자 보낸 날의 저녁 에너지를 1~5로 적어 보세요. 검사와 명식 중 어느 쪽이 당신의 충전 방식을 맞혔는지 숫자가 말해 줍니다.',
    SN: '다음 일을 시작할 때 첫 1시간에 무엇을 했는지 기록하세요. 세부 목록을 썼는지, 전체 그림을 그렸는지. 세 번 반복하면 패턴이 보입니다.',
    TF: '다음 큰 결정 하나에서, 결정 전에 기준을 적고 결정 후에 느낌을 적으세요. 어느 쪽이 먼저 왔는지, 어느 쪽이 결정을 바꿨는지 확인합니다.',
    JP: '한 주는 계획표대로, 다음 한 주는 마감만 두고 자유롭게 일해 보세요. 산출량이 아니라 주말의 피로도를 비교합니다.',
  };
  const AXIS_KO = { EI: '에너지의 방향', SN: '정보를 받는 방식', TF: '결정하는 방식', JP: '세상을 대하는 자세' };

  /** MBTI 사주 심층 리포트의 고유 장(head: 앞, tail: 뒤). 일간·오행·십신 장은 report.js에서 가져와 사이에 끼운다. */
  function buildSections(result, est, cmp, ctx) {
    const name = (ctx && ctx.name) || '당신';
    const para = (...ps) => ps.filter(Boolean).map(p => `<p>${p}</p>`).join('');
    const head = [], tail = []; const adv = ctx && ctx.adv;
    head.push({ id: 'm-summary', title: '한눈에 보는 요약', html: `<ul class="keylist"><li><b>명식 추정 성향</b> ${est.letters}</li>${cmp ? `<li><b>평소 검사 결과</b> ${cmp.test}</li><li><b>일치</b> 4축 중 ${cmp.matches}축</li>` : ''}${adv ? `<li><b>추구하는 MBTI</b> ${adv.goal} · <b>사주가 권하는 흐름</b> ${adv.rec}</li>` : ''}${est.axes.map(a => `<li><b>${a.left}/${a.right}</b> 명식 ${a.letter} ${a.letterPct}%${a.letterPct < 56 ? ' (경계)' : a.letterPct >= 75 ? ' (뚜렷)' : ''}${cmp ? ` · 검사 ${cmp.axes.find(x => x.id === a.id).test}` : ''}</li>`).join('')}</ul>` + para(cmp ? cmp.summary : '검사 MBTI가 없어 명식 추정만 설명합니다. 결과 화면에서 검사 결과를 넣으면 축별 비교가 붙습니다.', '<span class="muted">사주와 MBTI 사이에 검증된 대응은 없습니다. 아래 축별 설명은 오행·십신 비율을 네 축에 매핑한 공개 규칙에 근거하며, 자기 인식과 기질을 나란히 놓고 보는 도구입니다.</span>') });
    est.axes.forEach((a, i) => {
      const c = cmp ? cmp.axes[i] : null;
      head.push({ id: 'm-' + a.id, title: `${a.left}/${a.right} · ${AXIS_KO[a.id]}: 명식은 ${a.letter} ${a.letterPct}%`, html: para(
        `<b>명식이 ${a.letter}로 기운 이유.</b> ${a.factors.map(f => `${f.label}은(는) ${f.v > 0 ? a.left : a.right} 쪽으로`).join(', ')} 밀었습니다. ${a.note}. 강도 ${a.letterPct}%는 ${a.letterPct < 56 ? '거의 중간이라 환경에 따라 쉽게 뒤집히는 축입니다' : a.letterPct >= 75 ? '뚜렷한 편이라 환경이 바뀌어도 잘 유지되는 축입니다' : '보통 수준입니다'}.`,
        AXIS_DEEP[a.letter],
        c ? `<b>검사 ${c.test} → 명식 ${c.chart}.</b> ${c.text}` : '',
        c && !c.match ? `<b>확인 실험.</b> ${EXPERIMENT[a.id]}` : '',
        c && !c.match ? `반대쪽 글자(${c.test})의 명식 설명도 읽어 두십시오. ${AXIS_DEEP[c.test].split('.').slice(0, 2).join('.')}.` : '') });
    });
    if (adv) head.push({ id: 'm-goal', title: `추구 ${adv.goal} vs 명식 ${adv.chart}: 사주가 권하는 흐름은 ${adv.rec}`, html: para(`<b>${adv.summary}</b>`, '세 글자를 나란히 놓습니다. 검사는 지금 내가 아는 나, 명식은 타고난 결, 추구는 되고 싶은 나입니다. 추구가 명식과 같은 축은 돌아가면 되고, 다른 축은 바꾸기보다 빌려 쓰는 쪽이 오래갑니다.') + `<ul class="keylist">${adv.axes.map(x => `<li><b>${x.left}/${x.right}</b> 검사 ${x.test || '-'} · 명식 ${x.chart} ${x.chartPct}% · 추구 ${x.goal} → <b>${x.verdict}</b><br>${x.text}</li>`).join('')}</ul>` });
    const mism = cmp ? cmp.axes.filter(x => !x.match) : [];
    tail.push({ id: 'm-plan', title: '환경 vs 기질: 4주 실험 계획', html: para(mism.length ? `검사와 명식이 다른 축은 ${mism.map(x => `${x.id[0]}/${x.id[1]}(검사 ${x.test}, 명식 ${x.chart})`).join(', ')}입니다. 이 축들이 평소 이유 없이 피곤한 지점일 가능성이 큽니다. 4주 동안 한 축씩 실험합니다.` : '검사와 명식이 네 축 모두 같은 방향입니다. 실험 대신 유지 계획을 둡니다. 지금 환경이 기질을 잘 쓰고 있으니, 환경이 바뀔 때 어느 축이 먼저 흔들리는지만 지켜보십시오.') + (mism.length ? `<ol class="ifthen">${mism.slice(0, 4).map((x, k) => `<li><b>${k + 1}주차 ${x.id[0]}/${x.id[1]}</b> ${EXPERIMENT[x.id]}</li>`).join('')}</ol>` : `<ol class="ifthen">${est.axes.map((a, k) => `<li><b>${k + 1}주차 ${a.left}/${a.right}</b> ${a.letter} 쪽 강점을 쓴 날과 못 쓴 날의 피로도를 비교합니다.</li>`).join('')}</ol>`) + para('실험의 목적은 검사와 명식 중 무엇이 옳은지 가리는 것이 아닙니다. 어느 상황에서 어느 쪽 내가 나오는지를 아는 것입니다. 그것을 알면 환경을 고를 때 기준이 생깁니다.') });
    tail.push({ id: 'm-closing', title: '맺음말', html: para(`${name}의 명식 성향 ${est.letters}${cmp ? `과 검사 ${cmp.test}` : ''}을 함께 보았습니다. 두 체계는 출발점이 다릅니다. 하나는 지금의 자기 보고, 하나는 태어난 시각의 구조입니다. 둘이 같으면 환경이 기질을 잘 쓰고 있다는 뜻이고, 다르면 그 간격이 곧 당신이 에너지를 쓰는 자리입니다.`, '<span class="muted">명식 → 성향 추정 규칙은 mbti.js에 공개되어 있으며, 운영에서는 이용자 입력 분포로 가중치를 보정할 수 있습니다. 그 경우에도 대응 관계의 증명이 아니라 분포 조정이라는 점을 유지합니다.</span>') });
    return { head, tail };
  }

  // 어느 글자 쪽으로 움직이려면 명식의 어떤 기운을 쓰는지(추구 MBTI 조언용)
  const MOVE = {
    E: { use: '내보내는 힘·나 자신의 힘·불 기운', how: '말하고 만들어 밖으로 내보내는 루틴을 하루 하나 두세요. 사람을 만나는 양이 아니라 꺼내는 양이 바깥을 만들어요.', luck: '내보내는 힘이나 불 기운이 드는 달에 눈에 띄게 쉬워져요' },
    I: { use: '쉬고 배우는 힘·물·쇠 기운', how: '입력과 정리의 시간을 달력에 먼저 적으세요. 혼자 회복하는 시간을 벌이 아니라 충전으로 보세요.', luck: '쉬고 배우는 힘이나 물·쇠 기운이 드는 달에 자연스럽게 깊어져요' },
    S: { use: '손에 쥐는 힘·나를 누르는 힘·흙·쇠 기운', how: '목표를 숫자와 날짜로 바꾸고 이번 달 손에 잡히는 결과 하나를 정하세요.', luck: '손에 쥐는 힘이 드는 달에 실행력이 붙어요' },
    N: { use: '내보내는 힘·쉬고 배우는 힘·물·나무 기운', how: '주 1회 큰 그림만 보는 시간을 두고 왜와 다음을 먼저 물으세요.', luck: '내보내는 힘이 드는 달에 연결과 발상이 열려요' },
    T: { use: '나를 누르는 힘·손에 쥐는 힘·쇠·물 기운', how: '결정 전에 기준 세 개를 먼저 적고 감정은 결정 뒤에 따로 다루세요.', luck: '나를 누르는 힘이 드는 달에 기준이 서고 결정이 빨라져요' },
    F: { use: '내보내는 힘·쉬고 배우는 힘·불·나무 기운', how: '결정 전에 관련된 사람의 온도를 한 번 물으세요. 감정을 약점이 아니라 자료로 쓰세요.', luck: '내보내는 힘이나 불·나무 기운이 드는 달에 관계 감각이 살아나요' },
    J: { use: '나를 누르는 힘·쉬고 배우는 힘·흙 기운', how: '루틴 하나와 마감 하나만 고정하세요. 전부 계획하지 말고 뼈대만 세우세요.', luck: '나를 누르는 힘이 드는 달에 구조가 자연스럽게 잡혀요' },
    P: { use: '내보내는 힘·나 자신의 힘·불·나무 기운', how: '계획에 비워 둔 칸을 넣고 마감만 밖에 걸어 두세요. 선택지를 하나 더 남기는 연습을 하세요.', luck: '내보내는 힘이나 나 자신의 힘이 드는 달에 유연함이 커져요' },
  };
  /** 검사 MBTI(test)·명식 MBTI(est)·추구 MBTI(goal)를 축별로 맞대고, 명식 기준으로 "어느 흐름이 더 낫다"를 판정한다. */
  function advise(est, test, goal) {
    const t = parse(test), g = parse(goal); if (!g) return null;
    const axes = est.axes.map((a, i) => {
      const chart = a.letter, tt = t ? t[i] : null, gg = g[i], strong = a.letterPct >= 75, border = a.letterPct < 56;
      const name = l => `${l}(${l === a.left ? a.leftKo : a.rightKo})`;
      let kind, verdict, text;
      if (gg === chart && (!tt || tt === chart)) { kind = 'keep'; verdict = '유지'; text = `되고 싶은 ${jo(name(gg), '은', '는')} 타고난 결과 같아요.${tt ? ' 검사도 같은 방향이에요.' : ''} 바꿀 건 없고 과열만 조심하면 돼요. ${jo(MOVE[gg].use, '이', '가')} 이 방향의 밑천이에요.`; }
      else if (gg === chart && tt !== chart) { kind = 'return'; verdict = '회복'; text = `지금은 ${jo(name(tt), '으로', '로')} 살지만 되고 싶은 ${jo(name(gg), '이', '가')} 오히려 타고난 결이에요. 환경이 만든 모습을 벗으면 되는 축이라 가장 쉽게 돌아와요. ${MOVE[gg].how} ${MOVE[gg].luck}.`; }
      else if (gg !== chart && tt === chart) {
        kind = 'against'; verdict = strong ? '역행 주의' : border ? '가능' : '비용 있음';
        text = strong ? `타고난 결은 ${name(chart)} 쪽으로 뚜렷해요. 되고 싶은 ${jo(name(gg), '으로', '로')} 바꾸기보다 ${name(chart)} 강점을 두고 ${name(gg)} 기능만 빌리는 쪽이 사주에서는 더 나아요. 빌릴 때는 ${jo(MOVE[gg].use, '을', '를')} 쓰고, ${MOVE[gg].luck}.`
          : border ? `타고난 결은 ${jo(name(chart), '과', '와')} ${name(gg)} 사이 경계라 움직이기 쉬운 축이에요. ${MOVE[gg].how} ${MOVE[gg].luck}.`
            : `타고난 결은 ${name(chart)} 쪽이에요. ${jo(name(gg), '으로', '로')} 갈 수는 있지만 힘이 들어요. ${MOVE[gg].how} 사주에서는 ${name(chart)} 흐름을 기본으로 두고 필요할 때만 ${jo(name(gg), '을', '를')} 꺼내는 편이 오래가요.`;
      }
      else { kind = 'drift'; verdict = strong ? '소모 지점' : '점검'; text = `검사도 추구도 ${name(gg)}인데 타고난 결은 ${jo(name(chart), '이에요', '예요')}. 이미 그렇게 살고 있지만 타고난 결과 반대라 이유 없이 피곤한 자리가 여기일 수 있어요. 사주에서는 ${name(chart)} 흐름을 회복하는 시간을 따로 두는 편이 나아요. ${MOVE[chart].how}`; }
      const rec = gg === chart ? gg : (border ? gg : chart);
      return { id: a.id, left: a.left, right: a.right, chart, chartPct: a.letterPct, test: tt, goal: gg, kind, verdict, text, rec };
    });
    const rec = axes.map(x => x.rec).join('');
    const same = axes.filter(x => x.goal === x.chart).length;
    const hard = axes.filter(x => (x.kind === 'against' && x.chartPct >= 56) || x.kind === 'drift').length;
    const summary = same === 4 ? `되고 싶은 ${jo(g, '은', '는')} 네 축 모두 타고난 결과 같아요. 방향은 맞고 남은 건 속도와 과열 관리예요.`
      : `되고 싶은 ${g} 중 ${same}축은 타고난 결과 같아 자연스럽고, ${4 - same}축은 결을 거슬러요${hard ? ` (그중 ${hard}축은 비용이 커요)` : ''}. 사주가 권하는 흐름은 ${jo(rec, '이에요', '예요')}. 거스르는 축은 바꾸기보다 빌려 쓰는 쪽이 오래가요.`;
    return { goal: g, test: t, chart: est.letters, rec, axes, same, hard, summary };
  }

  function compare(test, est) {
    const t = parse(test); if (!t) return null;
    const axes = est.axes.map((a, i) => ({ id: a.id, test: t[i], chart: a.letter, match: t[i] === a.letter, chartPct: a.letterPct, text: TEXTS[a.id][t[i] + a.letter] }));
    const matches = axes.filter(x => x.match).length;
    return { test: t, chart: est.letters, axes, matches, summary: SUMMARY[matches] };
  }

  return { AXES, RULES, RULE_NOTES, TEXTS, SUMMARY, AXIS_DEEP, EXPERIMENT, AXIS_KO, MOVE, estimate, parse, compare, advise, buildSections };
});
