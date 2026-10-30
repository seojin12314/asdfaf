/*
 * compat.js — 두 명식 맞대기(궁합) 엔진. 연애(love) · 동업(biz) · 지인(friend) 세 렌즈.
 *  보는 것: ① 타고난 글자(일간) 합·충·생극  ② 여덟 글자 전체의 합·충·형·해·반합(자리 가중)
 *          ③ 서로 채워 주는 기운(상대가 내 처방 방향의 기운을 가졌는지)  ④ 힘의 균형(신강·신약)
 *          ⑤ 역할 구도(상대 일간이 나에게 어떤 힘인지)  ⑥ 둘 다 좋은 달 / 한쪽이 흔들리는 달
 *  출력: 점수(15~95)·한 줄·사실(facts, 키+문장)·피할 것/대신·리포트 섹션·근거 HTML. 문장은 쉬운 말·해요체.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./saju.js'), require('./report.js'), require('./report2.js'));
  else root.SajuCompat = factory(root.Saju, root.SajuReport, root.SajuReport2);
})(typeof self !== 'undefined' ? self : this, function (S, R, R2) {
  'use strict';
  const G = R2.G, EP = R2.EP, j = R2.josa;
  const GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }, OVER = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const STEM_CLASH = { 甲: '庚', 庚: '甲', 乙: '辛', 辛: '乙', 丙: '壬', 壬: '丙', 丁: '癸', 癸: '丁' };
  const HAP6 = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
  const HAE = { 子: '未', 未: '子', 丑: '午', 午: '丑', 寅: '巳', 巳: '寅', 卯: '辰', 辰: '卯', 申: '亥', 亥: '申', 酉: '戌', 戌: '酉' };
  const HYEONG = [['寅', '巳', '申'], ['丑', '戌', '未'], ['子', '卯']];
  const TRI = [['申', '子', '辰'], ['亥', '卯', '未'], ['寅', '午', '戌'], ['巳', '酉', '丑']];
  const CLASH = R.CLASH;
  const POS = { 년주: '집안 자리', 월주: '일터 자리', 일주: '옆자리', 시주: '말년 자리' };
  const W = { 일주: 3, 월주: 2, 년주: 1, 시주: 1 };
  const KIND = { love: { ko: '연애 궁합', big: '이별·동거 같은 큰 결정', partner: '그 사람' }, biz: { ko: '동업 궁합', big: '계약·지분 변경', partner: '동업자' }, friend: { ko: '지인 궁합', big: '돈 거래와 보증', partner: '그 친구' } };
  const BRANCH_MEAN = { 子: '한밤의 물', 丑: '언 땅', 寅: '새벽 숲', 卯: '봄 들판', 辰: '봄비 머금은 땅', 巳: '초여름 열기', 午: '한낮의 불', 未: '늦여름 마른 땅', 申: '초가을 쇠', 酉: '가을 정점의 쇠', 戌: '늦가을 마른 흙', 亥: '초겨울 바다' };
  const rd = b => `${b} ${S.BRANCHES_KO[S.BRANCHES.indexOf(b)]}(${BRANCH_MEAN[b]})`;

  function elemOfGroup(r, grp) { const e = r.dayMaster.element; return grp === '비겁' ? e : grp === '식상' ? GEN[e] : grp === '재성' ? OVER[e] : grp === '인성' ? Object.keys(GEN).find(k => GEN[k] === e) : Object.keys(OVER).find(k => OVER[k] === e); }

  function analyze(a, b, opts) {
    opts = opts || {}; const kind = KIND[opts.kind] ? opts.kind : 'love'; const A = opts.nameA || '나', B = opts.nameB || KIND[kind].partner;
    const stA = R.strengthJudge(a), stB = R.strengthJudge(b); const rxA = R2.direction(a, stA), rxB = R2.direction(b, stB);
    const facts = []; let score = 50; const tags = [];
    const fact = (key, text, tone, extra) => facts.push(Object.assign({ key, text, tone }, extra || {}));
    // ① 일간
    const sa = a.day.stem, sb = b.day.stem, ea = a.dayMaster.element, eb = b.dayMaster.element;
    let stem;
    if (R.STEM_HAP[sa] === sb) { stem = 'hap'; score += 10; tags.push('글자 끌림'); fact('stem', `${j(A, '과')} ${B}의 타고난 글자는 서로 끌어당기는 짝이에요.`, 'good'); }
    else if (STEM_CLASH[sa] === sb) { stem = 'clash'; score -= 8; tags.push('글자 부딪힘'); fact('stem', '두 사람의 타고난 글자가 정면으로 부딪히는 짝이에요.', 'bad'); }
    else if (ea === eb) { stem = 'same'; score += 2; fact('stem', '둘 다 같은 기운의 글자라 거울 같은 사이예요.', 'neutral'); }
    else if (GEN[ea] === eb) { stem = 'aGen'; score += 1; fact('stem', `${j(A, '이')} ${j(B, '을')} 키우는 쪽이라 주는 자리가 자주 ${A}예요.`, 'neutral'); }
    else if (GEN[eb] === ea) { stem = 'bGen'; score += 5; fact('stem', `${j(B, '이')} ${j(A, '을')} 키우는 쪽이라 ${j(A, '이')} 받는 자리에 있어요.`, 'good'); }
    else if (OVER[ea] === eb) { stem = 'aOver'; score += 0; fact('stem', `${j(A, '이')} ${j(B, '을')} 누르는 쪽이라 주도권이 ${A}에게 가요.`, 'neutral'); }
    else { stem = 'bOver'; score -= 4; fact('stem', `${j(B, '이')} ${j(A, '을')} 누르는 쪽이라 ${j(A, '이')} 작아지기 쉬워요.`, 'bad'); }
    // ② 여덟 글자 관계
    const pairs = [];
    a.pillars.forEach(pa => b.pillars.forEach(pb => {
      const w = Math.max(1, Math.round((W[pa.name] + W[pb.name]) / 2)); const x = pa.branch, y = pb.branch; let rel = null;
      if (CLASH[x] === y) rel = 'clash'; else if (HAP6[x] === y) rel = 'hap'; else if (HYEONG.some(h => h.includes(x) && h.includes(y) && x !== y)) rel = 'hyeong'; else if (HAE[x] === y) rel = 'hae'; else if (TRI.some(t => t.includes(x) && t.includes(y) && x !== y)) rel = 'tri';
      if (rel) pairs.push({ rel, w, pa: pa.name, pb: pb.name, x, y });
    }));
    const sum = (rels, k) => pairs.filter(p => rels.includes(p.rel)).reduce((s, p) => s + p.w * (k[p.rel] || 1), 0);
    const attract = sum(['hap', 'tri'], { hap: 1, tri: .7 }), friction = sum(['clash', 'hyeong', 'hae'], { clash: 1, hyeong: .7, hae: .5 });
    score += Math.min(20, attract * 4) - Math.min(20, friction * 4);
    pairs.sort((p, q) => q.w - p.w || ['clash', 'hap', 'hyeong', 'hae', 'tri'].indexOf(p.rel) - ['clash', 'hap', 'hyeong', 'hae', 'tri'].indexOf(q.rel));
    const main = pairs[0];
    const REL_T = { hap: ['끌림으로 묶여요. 자연스럽게 가까워지는 자리예요.', 'good', '자리 끌림'], tri: ['같은 편으로 모여요. 뜻이 쉽게 맞는 자리예요.', 'good', '같은 편'], clash: ['부딪혀요. 사소한 일로 다투기 쉬운 자리예요.', 'bad', '자리 부딪힘'], hyeong: ['마찰이 있어요. 서로를 다듬는 자리예요.', 'bad', '마찰'], hae: ['어긋남이 있어요. 오해가 쌓이기 쉬운 자리예요.', 'bad', '어긋남'] };
    if (main) { const t = REL_T[main.rel]; tags.push(t[2]); fact('branch', main.pa === main.pb ? `두 사람의 ${POS[main.pa]} 글자가 ${t[0]}` : `${A}의 ${POS[main.pa]}와 ${B}의 ${POS[main.pb]} 글자가 ${t[0]}`, t[1], { pair: main }); }
    else fact('branch', '여덟 글자 사이에 뚜렷한 끌림도 부딪힘도 없어요. 잔잔한 사이예요.', 'neutral');
    if (pairs.length > 1) { const n = { good: pairs.filter(p => p.rel === 'hap' || p.rel === 'tri').length, bad: pairs.filter(p => p.rel !== 'hap' && p.rel !== 'tri').length }; fact('branch2', n.good && n.bad ? '끌리는 자리와 부딪히는 자리가 같이 있어 기복이 있는 사이예요.' : n.good ? '끌리는 자리가 여럿이라 붙는 속도가 빨라요.' : '부딪히는 자리가 여럿이라 규칙 없이는 소모돼요.', n.good && !n.bad ? 'good' : n.bad && !n.good ? 'bad' : 'neutral'); }
    // ③ 서로 채워 주는 기운
    const needA = elemOfGroup(a, rxA.pick), needB = elemOfGroup(b, rxB.pick);
    const supA = b.elements[needA] / b.totalChars >= 0.25 || eb === needA, supB = a.elements[needB] / a.totalChars >= 0.25 || ea === needB;
    if (supA) score += 8; if (supB) score += 8;
    const supply = supA && supB ? 'both' : supA ? 'aOnly' : supB ? 'bOnly' : 'none';
    if (supA && supB) tags.push('서로 보완');
    fact('supply', supply === 'both' ? `서로에게 부족한 기운을 채워 주는 짝이에요. ${A}에겐 ${EP[needA]}, ${B}에겐 ${j(EP[needB], '이')} 와요.` : supply === 'aOnly' ? `${B}에게 ${j(EP[needA], '이')} 많아 ${A}의 빈자리를 채워 줘요.` : supply === 'bOnly' ? `${A}에게 ${j(EP[needB], '이')} 많아 ${B}의 빈자리를 채워 줘요.` : `${A}에게 필요한 ${j(EP[needA], '이')} ${B}에게도 적어요. 둘 다 밖에서 채워야 해요.`, supply === 'none' ? 'bad' : 'good', { needA, needB, supA, supB });
    // ④ 힘의 균형
    let balance; const la = stA.label, lb = stB.label;
    if (la === '신강' && lb === '신강') { balance = 'strongStrong'; score -= 6; fact('balance', '둘 다 힘이 센 편이라 주도권을 두고 부딪히기 쉬워요.', 'bad'); }
    else if (la === '신약' && lb === '신약') { balance = 'weakWeak'; score -= 4; fact('balance', '둘 다 힘보다 짐이 많은 편이라 서로 기대다 지칠 수 있어요.', 'bad'); }
    else if ((la === '신강' && lb === '신약') || (la === '신약' && lb === '신강')) { balance = 'comp'; score += 6; tags.push('힘의 균형'); fact('balance', '한쪽은 힘이 세고 한쪽은 받쳐 주는 편이라 균형이 맞아요.', 'good'); }
    else { balance = 'mid'; score += 2; fact('balance', '한쪽이 중간이라 흐름에 따라 균형이 쉽게 잡혀요.', 'neutral'); }
    // ⑤ 역할 구도
    const tgAB = S.tenGod(a.day.stemIdx, b.day.stemIdx).group; // 상대가 나에게 어떤 힘인지
    const tgBA = S.tenGod(b.day.stemIdx, a.day.stemIdx).group;
    let role, roleText, roleTone = 'neutral';
    if (kind === 'love') {
      const spA = a.input.gender === 'M' ? '재성' : '관성', spB = b.input.gender === 'M' ? '재성' : '관성';
      const ab = tgAB === spA, ba = tgBA === spB;
      role = ab && ba ? 'mutual' : ab ? 'aSees' : ba ? 'bSees' : 'none';
      score += role === 'mutual' ? 10 : role === 'none' ? 0 : 5; roleTone = role === 'none' ? 'neutral' : 'good'; if (role === 'mutual') tags.push('서로 짝 기운');
      roleText = role === 'mutual' ? '서로가 서로의 짝 기운이라 인연의 모양이 분명해요.' : role === 'aSees' ? `${B}는 ${A}의 짝 기운이에요. ${A} 쪽 마음이 먼저 움직여요.` : role === 'bSees' ? `${A}는 ${B}의 짝 기운이에요. ${B} 쪽이 먼저 다가와요.` : '짝 기운으로 묶인 사이는 아니라 친구처럼 시작하는 인연이에요.';
    } else if (kind === 'biz') {
      role = tgAB; const T = { 비겁: ['동등한 공동대표 구도예요. 몫을 문서로 나누지 않으면 흔들려요.', 0, 'neutral'], 식상: [`${A}가 만들고 ${B}가 배우며 받는 구도예요. 기여를 기록해야 해요.`, 4, 'good'], 인성: [`${B}가 ${A}를 받쳐 주는 후원자 구도예요. ${A}가 결과를 내야 오래가요.`, 4, 'good'], 재성: [`${A}가 판을 쥐고 ${B}가 실행하는 구도예요. ${B}의 몫을 먼저 정해요.`, 6, 'good'], 관성: [`${B}가 기준을 쥐고 ${A}가 실행하는 구도예요. ${A}의 재량을 미리 정해요.`, 6, 'good'] }[tgAB];
      roleText = T[0]; score += T[1]; roleTone = T[2]; if (tgAB === '재성' || tgAB === '관성') tags.push('역할 분명');
    } else {
      role = tgAB; const T = { 비겁: ['같은 눈높이의 친구예요. 경쟁이 붙으면 돈 거래만 피하면 돼요.', 8, 'good'], 식상: [`${A}가 베풀고 ${B}가 받는 친구예요. 한쪽만 주면 서운함이 쌓여요.`, 5, 'neutral'], 인성: [`${B}가 챙기고 ${A}가 받는 친구예요. 돌려주는 날을 정해 두세요.`, 5, 'neutral'], 재성: [`${A}가 이끌고 ${B}가 따르는 친구예요. 부탁이 한쪽으로 몰리기 쉬워요.`, -3, 'neutral'], 관성: [`${B}가 이끌고 ${A}가 따르는 친구예요. 싫은 건 싫다고 말해야 오래가요.`, -3, 'neutral'] }[tgAB];
      roleText = T[0]; score += T[1]; roleTone = T[2]; if (tgAB === '비겁') tags.push('같은 눈높이');
    }
    fact('role', roleText, roleTone, { tgAB, tgBA });
    // ⑥ 달력
    const nextY = a.seun[1].year; const grade = (r, rx) => R2.calendar(r, nextY).map(c => Object.assign(c, { grade: c.clashes.length ? '주의' : rx.allowed.includes(c.branchGroup) ? '추진' : '보통' }));
    const ca = grade(a, rxA), cb = grade(b, rxB);
    const both = ca.filter((c, i) => c.grade !== '주의' && cb[i].grade !== '주의' && (c.grade === '추진' || cb[i].grade === '추진'));
    const shaky = ca.map((c, i) => ({ c, who: c.grade === '주의' && cb[i].grade === '주의' ? 'both' : c.grade === '주의' ? 'a' : cb[i].grade === '주의' ? 'b' : null })).filter(x => x.who);
    const good = both.length ? both : ca.filter((c, i) => c.grade !== '주의' && cb[i].grade !== '주의');
    const goodLabel = good.slice(0, 2).map(c => c.label).join('·') || '뚜렷한 달 없음', cautionLabel = shaky.slice(0, 2).map(x => x.c.label).join('·');
    fact('months', `${nextY}년 둘 다 좋은 달은 ${j(goodLabel, '이에요')}.${shaky.length ? ` 한쪽이 흔들리는 달은 ${j(cautionLabel, '이에요')}.` : ''}`, 'neutral', { good: good.map(c => c.label), shaky: shaky.map(x => ({ label: x.c.label, who: x.who })) });
    // 점수·판정
    score = Math.max(15, Math.min(95, Math.round(score)));
    const label = score >= 75 ? '잘 맞는 편' : score >= 55 ? '맞춰 가면 좋은 편' : score >= 40 ? '규칙이 필요한 편' : '쉽지 않은 편';
    const head = { love: { 4: '끌림도 균형도 있는 짝이에요.', 3: '맞춰 가면 오래가는 짝이에요.', 2: '규칙을 정하면 괜찮은 짝이에요.', 1: '쉽지 않지만 모양을 알면 피할 수 있어요.' }, biz: { 4: '역할이 맞물리는 동업이에요.', 3: '문서만 있으면 굴러가는 동업이에요.', 2: '권한을 먼저 나눠야 하는 동업이에요.', 1: '돈을 섞기엔 조심스러운 사이예요.' }, friend: { 4: '오래가는 친구 모양이에요.', 3: '편한데 선은 필요한 친구예요.', 2: '부탁의 한도를 정해야 하는 친구예요.', 1: '돈 거래만 없으면 괜찮은 친구예요.' } }[kind][score >= 75 ? 4 : score >= 55 ? 3 : score >= 40 ? 2 : 1];
    // 피할 것 / 대신
    const K = KIND[kind]; let avoid, instead;
    const cm = cautionLabel || good[0] && ca.find(c => c.grade === '주의') ? cautionLabel : '';
    if (friction >= attract) {
      avoid = `${nextY}년 ${cm || goodLabel.split('·')[0]}에는 ${j(K.big, '을')} 하지 마세요`;
      instead = `${j(K.big, '은')} ${goodLabel.split('·')[0]}에 하세요. 부딪히는 자리는 ${{ love: '같은 자리를 원한다는 신호라 역할을 나누면 가라앉아요.', biz: '권한이 겹친다는 신호라 결재선을 하나로 정하면 풀려요.', friend: '기대가 다르다는 신호라 부탁의 한도를 정하면 편해져요.' }[kind]}`;
    } else {
      avoid = { love: `끌림만 믿고 ${cm ? cm + '에 ' : ''}큰 약속을 서두르지 마세요`, biz: '잘 맞는다고 몫과 역할을 말로만 정하지 마세요', friend: '편하다고 돈 거래를 시작하지 마세요' }[kind];
      instead = { love: `${goodLabel.split('·')[0]}에 서로의 1년 계획을 나눠 보세요. 끌림이 큰 사이는 방향만 맞추면 오래가요.`, biz: '첫 달에 몫·역할·그만둘 조건을 한 장으로 적으세요. 잘 맞는 동업일수록 문서가 우정을 지켜요.', friend: '돈 대신 시간과 정보를 주고받으세요. 편한 사이는 거래가 없을 때 가장 오래가요.' }[kind];
    }
    const section = { id: 'pair', title: `${B}와의 ${K.ko}`, conclusion: `${label} · ${head}`, body: [facts[0].text, facts.find(f => f.key === 'branch').text, facts.find(f => f.key === 'supply').text.split('. ')[0] + (facts.find(f => f.key === 'supply').text.includes('. ') ? '.' : ''), roleText.split('. ')[0] + '.', facts.find(f => f.key === 'months').text.split('. ')[0] + '.'].slice(0, 5), avoid, instead, viz: { type: 'compat', score, label, tags, a: { ko: a.day.ko, hanja: a.day.hanja, name: A }, b: { ko: b.day.ko, hanja: b.day.hanja, name: B }, good: good.slice(0, 3).map(c => c.label), shaky: shaky.slice(0, 3).map(x => x.c.label) } };
    const l3 = `<p><b>타고난 글자.</b> ${A} ${a.day.stem} ${a.day.stemKo} · ${B} ${b.day.stem} ${b.day.stemKo} → ${stem === 'hap' ? '천간합' : stem === 'clash' ? '천간충' : stem === 'same' ? '같은 오행' : stem === 'aGen' ? `${A}가 생(生)` : stem === 'bGen' ? `${B}가 생(生)` : stem === 'aOver' ? `${A}가 극(剋)` : `${B}가 극(剋)`}. ${B}의 일간은 ${A}에게 ${tgAB}, ${A}의 일간은 ${B}에게 ${tgBA}.</p>${pairs.length ? `<table class="gods l3t"><thead><tr><th>${A}</th><th>${B}</th><th>관계</th><th>무게</th></tr></thead><tbody>${pairs.map(p => `<tr><td>${p.pa} ${rd(p.x)}</td><td>${p.pb} ${rd(p.y)}</td><td>${{ hap: '육합', tri: '반합', clash: '충', hyeong: '형', hae: '해' }[p.rel]}</td><td>${'●'.repeat(p.w)}</td></tr>`).join('')}</tbody></table>` : '<p>여덟 글자 사이에 합·충·형·해가 없어요.</p>'}<p class="muted">끌림 ${attract.toFixed(1)} · 마찰 ${friction.toFixed(1)}. 자리 무게는 일주 3, 월주 2, 년·시주 1의 평균. ${A}의 처방 기운 ${rxA.pick}(${EP[needA]})을 ${B}가 ${supA ? '충분히 가짐' : '적게 가짐'}, ${B}의 처방 기운 ${rxB.pick}(${EP[needB]})을 ${A}가 ${supB ? '충분히 가짐' : '적게 가짐'}. 힘: ${A} ${la} · ${B} ${lb}. 점수는 공개 규칙의 합산이며 예측이 아니에요.</p>`;
    return { kind, kindKo: K.ko, A, B, score, label, head, tags, facts, stem, main, pairs, supply, balance, role, tgAB, tgBA, attract, friction, good: good.map(c => c.label), shaky: shaky.map(x => ({ label: x.c.label, who: x.who })), avoid, instead, section, l3, nextY };
  }
  return { KIND, analyze };
});
