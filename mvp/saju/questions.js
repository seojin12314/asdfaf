/*
 * questions.js — 질문 은행(6영역 130문항)과 명식 기반 답변 생성기.
 *  사용자는 영역(캐릭터)별 질문 중 10개를 고르고, 고른 질문의 답을 받는다. 나머지는 +₩5,000으로 연다.
 *  ★ 문항은 상대(연인)·부모(자녀 영역)·검사 MBTI 입력이 있어야 열린다.
 *  답변 규칙: 쉬운 말 · 해요체 · 한 문장 40자 · 2~3문장. 정통(master) 영역만 전문용어를 독음·뜻과 함께 쓴다.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./saju.js'), require('./report.js'), require('./report2.js'), require('./report-lenses.js'), require('./mbti.js'), require('./compat.js'));
  else root.SajuQuestions = factory(root.Saju, root.SajuReport, root.SajuReport2, root.SajuLenses, root.SajuMBTI, root.SajuCompat);
})(typeof self !== 'undefined' ? self : this, function (S, R, R2, LZ, M, CP) {
  'use strict';
  const { G, EP, DM, josa: j } = R2; const T = R2.TABLES, LT = LZ.TABLES;
  const GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }, OVER = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const CLASH = R.CLASH, HAP6 = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
  const HAE = { 子: '未', 未: '子', 丑: '午', 午: '丑', 寅: '巳', 巳: '寅', 卯: '辰', 辰: '卯', 申: '亥', 亥: '申', 酉: '戌', 戌: '酉' };
  const HYEONG = [['寅', '巳', '申'], ['丑', '戌', '未'], ['子', '卯']];
  const TRIAD = [{ set: ['申', '子', '辰'], 역마: '寅', 도화: '酉', 화개: '辰' }, { set: ['寅', '午', '戌'], 역마: '申', 도화: '卯', 화개: '戌' }, { set: ['巳', '酉', '丑'], 역마: '亥', 도화: '午', 화개: '丑' }, { set: ['亥', '卯', '未'], 역마: '巳', 도화: '子', 화개: '未' }];
  const BAEKHO = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'];
  const GWIMUN = { 子: '酉', 酉: '子', 丑: '午', 午: '丑', 寅: '未', 未: '寅', 卯: '申', 申: '卯', 辰: '亥', 亥: '辰', 巳: '戌', 戌: '巳' };
  const GONGMANG = [['戌', '亥'], ['申', '酉'], ['午', '未'], ['辰', '巳'], ['寅', '卯'], ['子', '丑']];
  const HIDDEN = { 子: ['癸'], 丑: ['癸', '辛', '己'], 寅: ['戊', '丙', '甲'], 卯: ['乙'], 辰: ['乙', '癸', '戊'], 巳: ['戊', '庚', '丙'], 午: ['丙', '己', '丁'], 未: ['丁', '乙', '己'], 申: ['戊', '壬', '庚'], 酉: ['辛'], 戌: ['辛', '丁', '戊'], 亥: ['戊', '甲', '壬'] };
  const SYM = { 木: '동쪽·초록·아침·숲', 火: '남쪽·붉은색·한낮·빛', 土: '가운데·노란색·환절기·땅', 金: '서쪽·흰색·저녁·쇠', 水: '북쪽·검정·밤·물' };
  const ELEM_ENV = { 木: '새로 시작하고 키우는 일', 火: '보여 주고 알리는 일', 土: '안정적으로 반복하는 일', 金: '기준을 세우고 자르는 일', 水: '생각하고 흐름을 읽는 일' };
  const ELEM_SHADOW = { 木: '벌여 놓고 멈추지 못해요', 火: '말이 앞서고 기복이 커져요', 土: '미루고 쌓아 두기만 해요', 金: '자르는 말로 곁을 다치게 해요', 水: '생각이 많아져 불안으로 흘러요' };
  const ELEM_GIVE = { 木: '새로 시작할 용기', 火: '마음껏 표현할 자리', 土: '안정된 일상', 金: '분명한 기준', 水: '쉬고 생각할 여유' };
  const POSK = { 년주: '집안', 월주: '일터', 일주: '가장 가까운 자리', 시주: '아이·말년' }; const POSK2 = { 년주: '집안 자리', 월주: '일터 자리', 일주: '가장 가까운 자리', 시주: '아이·말년 자리' };
  const DOMAIN_KO = { love: '연인·궁합', money: '재물·사업', child: '자녀', mbti: 'MBTI 사주', master: '심층 정통 사주', work: '이직·직장' };
  const PERSONA_DOMAIN = { flame: 'love', sage: 'money', child: 'child', mbti: 'mbti', master: 'master', hunter: 'work', granny: 'master' };
  const PERSONA_DOMAIN_KO = { granny: '한 해 흐름·가족' };
  const GROUP_AXIS = { 식상: 'E·N·F·P', 관성: 'S·T·J', 인성: 'I·N·J', 재성: 'S·T', 비겁: 'E·P' };

  // ───── 사실 묶음 ─────
  function facts(r, opts) {
    opts = opts || {}; const name = opts.name || '당신';
    const st = R.strengthJudge(r), rx = R2.direction(r, st); const g = r.groups, tot = r.tenGods.length;
    const lvG = {}; S.TEN_GOD_GROUPS.forEach(k => { lvG[k] = T.groupLevel(g[k], tot); });
    const lvE = {}; S.ELEMENTS.forEach(e => { lvE[e] = T.level(r.elements[e] / r.totalChars, r.totalChars); });
    const cnt = {}; r.tenGods.forEach(t => { cnt[t.name] = (cnt[t.name] || 0) + 1; });
    const e = r.dayMaster.element; const elemOf = grp => grp === '비겁' ? e : grp === '식상' ? GEN[e] : grp === '재성' ? OVER[e] : grp === '인성' ? Object.keys(GEN).find(k => GEN[k] === e) : Object.keys(OVER).find(k => OVER[k] === e);
    const groupOf = el => S.tenGod(r.day.stemIdx, S.STEM_ELEM.indexOf(el)).group;
    const spouseGroup = r.input.gender === 'M' ? '재성' : '관성', childGroup = r.input.gender === 'M' ? '관성' : '식상';
    const spouseHits = r.tenGods.filter(t => t.group === spouseGroup); const spousePos = spouseHits.map(t => t.at.split(' ')[0]);
    const dayTG = r.tenGods.find(t => t.at === '일주 지지'), monthTG = r.tenGods.find(t => t.at === '월주 지지'), hourTG = r.tenGods.find(t => t.at === '시주 지지');
    const br = r.pillars.map(p => ({ b: p.branch, name: p.name })); const clashes = [], haps = [], hyeongs = [], haes = [];
    for (let i = 0; i < br.length; i++) for (let k = i + 1; k < br.length; k++) { const a = br[i], b = br[k]; if (CLASH[a.b] === b.b) clashes.push([a, b]); if (HAP6[a.b] === b.b) haps.push([a, b]); if (HAE[a.b] === b.b) haes.push([a, b]); if (HYEONG.some(h => h.includes(a.b) && h.includes(b.b) && a.b !== b.b)) hyeongs.push([a, b]); }
    const stemHaps = []; r.pillars.forEach((p, i) => r.pillars.slice(i + 1).forEach(q => { if (R.STEM_HAP[p.stem] === q.stem) stemHaps.push([p, q]); }));
    const dayClash = clashes.find(c => c[0].name === '일주' || c[1].name === '일주'); const clashedPos = new Set(clashes.flat().map(x => x.name));
    const cur = r.daeun && r.daeun.current, list = r.daeun ? r.daeun.list : [], idx = cur ? list.indexOf(cur) : -1, nextD = idx >= 0 ? list[idx + 1] : list[0], edge = !!(cur && (r.daeun.ageYears >= cur.toAge - 1 || r.daeun.ageYears <= cur.fromAge + 1));
    const y0 = r.seun[0], y1 = r.seun[1]; const yClash = [r.day, r.year].find(x => CLASH[y1.branch] === x.branch) || null;
    const nextY = y1.year, nowY = y0.year;
    const cal = R2.calendar(r, nextY).map(c => Object.assign(c, { grade: c.clashes.length ? '주의' : rx.allowed.includes(c.branchGroup) ? '추진' : '보통' }));
    const monthsWith = grp => cal.filter(c => c.grade !== '주의' && (c.branchGroup === grp || c.stemGroup === grp));
    const caution = cal.filter(c => c.grade === '주의'), push = cal.filter(c => c.grade === '추진'), good = push.length ? push : cal.filter(c => c.grade !== '주의');
    const ml = cs => cs.slice(0, 3).map(c => c.label).join('·') || '뚜렷한 달 없음';
    const gyeok = monthTG.name === '비견' ? '건록격' : monthTG.name === '겁재' ? '양인격' : monthTG.name + '격';
    const gisin = st.label === '신강' ? (g['비겁'] >= g['인성'] ? '비겁' : '인성') : st.label === '신약' ? ['식상', '재성', '관성'].sort((a, b) => g[b] - g[a])[0] : groupOf(OVER[T.SEASON_NEED[st.season]] === e ? GEN[e] : Object.keys(OVER).find(k => OVER[k] === T.SEASON_NEED[st.season]) || e);
    const triadOf = b => TRIAD.find(t => t.set.includes(b)); const sinsal = [];
    [r.year.branch, r.day.branch].forEach((base, bi) => { const t = triadOf(base); if (!t) return; ['역마', '도화', '화개'].forEach(k => { const hit = r.pillars.find(p => p.branch === t[k] && p.branch !== base); if (hit && !sinsal.some(x => x.k === k)) sinsal.push({ k, at: hit.name, b: hit.branch, base: bi === 0 ? '년지' : '일지' }); }); });
    r.pillars.forEach(p => { if (BAEKHO.includes(p.hanja) && !sinsal.some(x => x.k === '백호')) sinsal.push({ k: '백호', at: p.name, b: p.hanja }); });
    for (let i = 0; i < br.length; i++) for (let k = i + 1; k < br.length; k++) if (GWIMUN[br[i].b] === br[k].b && !sinsal.some(x => x.k === '귀문')) sinsal.push({ k: '귀문', at: br[i].name + '·' + br[k].name, b: br[i].b + br[k].b });
    const gm = GONGMANG[Math.floor(r.day.index60 / 10)]; const gongmang = { branches: gm, hits: r.pillars.filter(p => p.name !== '일주' && gm.includes(p.branch)).map(p => p.name) };
    const hidden = HIDDEN[r.day.branch].map(sx => S.tenGod(r.day.stemIdx, S.STEMS.indexOf(sx)).group);
    const dec = grp => list.filter(p => p.tenGod.group === grp || p.branchTenGod.group === grp);
    const ages = ps => { const a = ps.slice(0, 2).map(p => `${p.fromAge}~${p.toAge}세`); return a.length === 2 ? `${j(a[0], '과')} ${a[1]}` : (a[0] || '없음'); };
    return { r, name, st, rx, g, tot, lvG, lvE, cnt, e, elemOf, groupOf, strong: r.strongestGroup, weak: r.weakestGroup, top: r.sortedGroups, topE: r.sortedElems[0], lowE: r.sortedElems[4], lacking: S.ELEMENTS.filter(x => r.elements[x] === 0), excess: S.ELEMENTS.filter(x => lvE[x] === '과다'), spouseGroup, childGroup, spouseHits, spousePos, spouseN: spouseHits.length, dayTG, monthTG, hourTG, dayG: dayTG.group, clashes, haps, hyeongs, haes, stemHaps, dayClash, clashedPos, cur, list, nextD, edge, curG: cur ? cur.tenGod.group : monthTG.group, y0, y1, yClash, nextY, nowY, cal, caution, push, good, ml, monthsWith, spouseMonths: monthsWith(spouseGroup), gyeok, pick: rx.pick, gisin, sinsal, gongmang, hidden, dec, ages, dm: DM[r.day.stem], season: st.season, compat: opts.compat || null, compatPr: opts.compatPr || null, est: opts.est || null, cmp: opts.cmp || null, adv: opts.adv || null, parent: opts.parent ? facts(opts.parent, { name: '부모' }) : null, child: opts.child ? facts(opts.child, { name: '아이' }) : null };
  }

  // ───── 답변 생성 ─────
  const A = {};
  const sen = (...xs) => xs.filter(Boolean).join(' ');
  const lv = (F, k) => F.lvG[k];
  const has = (F, nm) => (F.cnt[nm] || 0) > 0;
  A.love = [
    ['내가 사랑에 빠질 때 반복되는 패턴은 뭔가요?', F => sen(T.REL[F.dayG].body, F.spouseN === 0 ? '짝 기운이 드러나 있지 않아 인연은 운이 들어올 때 움직여요.' : `짝 기운은 ${[...new Set(F.spousePos)].map(p => POSK[p]).join('·')} 자리에 있어요.`, LT.LOVE_TEMP[F.topE])],
    ['나는 연애에서 주도하는 쪽인가요, 맞춰주는 쪽인가요?', F => { const lead = F.g['비겁'] >= F.g['관성'] && F.r.dayMaster.polarity === '양' || F.g['비겁'] > F.g['관성'] + 1; return sen(lead ? '주도하는 쪽이에요.' : '맞춰 주는 쪽이에요.', lead ? '나 자신의 힘이 나를 누르는 힘보다 커요.' : '나를 누르는 힘이 나 자신의 힘보다 크거나 비슷해요.', lead ? '상대가 따라오게 두되 결정은 같이 하세요.' : '맞추더라도 양보 못 하는 것 하나는 지키세요.'); }],
    ['내가 끌리는 사람과 나한테 맞는 사람은 다른가요?', F => { const se = F.elemOf(F.spouseGroup), hb = HAP6[F.r.day.branch]; return sen(`끌리는 쪽은 ${j(EP[se], '이')} 센 사람이에요.`, `오래 맞는 쪽은 아랫글자가 ${T.BRANCH_MEAN[hb]} 쪽인 사람이에요.`, S.BRANCH_ELEM[S.BRANCHES.indexOf(hb)] === se ? '둘이 같은 방향이라 끌림을 믿어도 돼요.' : '둘이 달라서 끌림과 편안함이 갈려요.'); }],
    ['나는 왜 비슷한 이유로 헤어지나요?', F => sen(F.dayClash ? `가장 가까운 자리가 ${POSK[F.dayClash[0].name === '일주' ? F.dayClash[1].name : F.dayClash[0].name]} 자리와 부딪혀요.` : '가장 가까운 자리에 부딪힘은 없어요.', F.spouseN >= 2 ? '짝 기운이 둘 이상이라 비교하다 끝나는 패턴이에요.' : F.spouseN === 0 ? '짝 기운이 없어 고르는 기준이 흐릿한 채 시작해요.' : '짝 기운이 하나라 한 사람에게 다 걸다 지쳐요.', T.WEAK_WHY[F.weak])],
    ['내 연애가 길게 못 가는 구조적 이유가 있나요?', F => sen(F.dayClash || F.hyeongs.some(h => h.some(x => x.name === '일주')) ? '가장 가까운 자리에 부딪힘이나 마찰이 있어요.' : '가장 가까운 자리는 조용한 편이에요.', lv(F, '비겁') === '과다' ? '나 자신의 힘이 넘쳐 양보가 늦어요.' : lv(F, '인성') === '부족' ? '회복할 틈 없이 다음을 시작하는 게 문제예요.' : '구조보다 타이밍이 문제인 명식이에요.', '같은 자리에서 끝났다면 운이 아니라 모양이에요.')],
    ['나와 오래 가는 사람의 조건은 뭔가요?', F => sen(`태어난 날 글자가 ${T.STEM_MEAN[R.STEM_HAP[F.r.day.stem]]} 쪽인 사람이에요.`, `아랫글자가 ${T.BRANCH_MEAN[HAP6[F.r.day.branch]]} 쪽이면 편하게 오래가요.`, `${j(EP[F.elemOf(F.pick)], '이')} 많은 사람이 내 빈자리를 채워요.`)],
    ['나와 처음엔 좋다가 부딪히는 사람의 특징은?', F => sen(`아랫글자가 ${T.BRANCH_MEAN[CLASH[F.r.day.branch]]} 쪽인 사람이에요.`, `${j(EP[Object.keys(OVER).find(k => OVER[k] === F.e)], '이')} 넘치는 사람은 나를 작아지게 해요.`, '처음 끌림이 센 만큼 사소한 데서 부딪혀요.')],
    ['결혼이 내 인생에 빨리 오는 편인가요, 늦는 편인가요?', F => { const early = F.spousePos.some(p => p === '년주' || p === '월주'), late = F.spousePos.includes('시주'); const d = F.dec(F.spouseGroup)[0]; return sen(early ? '짝 기운이 앞쪽 자리에 있어 빠른 편이에요.' : late ? '짝 기운이 뒤쪽 자리에 있어 늦는 편이에요.' : F.spouseN ? '짝 기운이 가운데 있어 중간쯤이에요.' : '짝 기운이 없어 운이 들어올 때 움직여요.', d ? `짝 기운이 드는 10년 계절은 ${d.fromAge}~${d.toAge}세예요.` : '10년 계절에 짝 기운이 뚜렷하지 않아요.', '빠르고 늦음보다 좋은 달에 결정하는 게 중요해요.'); }],
    ['올해 새로운 인연이 들어오는 시기가 있나요?', F => { const yh = [F.y0, F.y1].filter(y => y.tenGod.group === F.spouseGroup || y.branchTenGod.group === F.spouseGroup); return sen(yh.length ? `${yh.map(y => y.year + '년').join('과 ')}에 짝 기운이 들어요.` : `${F.nowY}년과 ${F.nextY}년은 짝 기운이 드는 해는 아니에요.`, `${F.nextY}년 인연이 움직이는 달은 ${j(F.ml(F.spouseMonths), '이에요')}.`, '그 달엔 새 모임 하나에 꼭 나가세요.'); }],
    ['올해 연애에서 피해야 할 달은 언제인가요?', F => { const dc = F.cal.filter(c => c.clashes.includes('일주')); return sen(dc.length ? `${F.nextY}년 ${j(F.ml(dc), '이에요')}.` : `${F.nextY}년엔 가장 가까운 자리와 부딪히는 달이 없어요.`, dc.length ? '그 달엔 고백도 이별 통보도 미루세요.' : `대신 ${j(F.ml(F.caution), '은')} 큰 약속을 피하세요.`); }],
    ['지금 만나는 사람과 올해 결정(결혼·동거·이별)을 내려도 되나요?', F => { const sp = F.y1.tenGod.group === F.spouseGroup || F.y1.branchTenGod.group === F.spouseGroup; return sen(F.yClash ? `${F.nextY}년은 내 ${POSK2[F.yClash.name]}와 부딪히는 해라 서두르면 손해예요.` : sp ? `${F.nextY}년은 짝 기운이 드는 해라 결정해도 괜찮아요.` : `${F.nextY}년은 다지는 해라 결정보다 확인이 먼저예요.`, `결정한다면 ${F.ml(F.good)} 중 하나에 하세요.`, '한 분기에 큰 결정은 하나만 하세요.'); }],
    ['내가 연인에게 상처 주는 방식은 뭔가요?', F => sen(has(F, '상관') ? '날카로운 말로 상처를 줘요.' : has(F, '겁재') ? '비교와 경쟁심으로 상처를 줘요.' : lv(F, '식상') === '부족' ? '표현하지 않는 것으로 상처를 줘요.' : '내 기준을 상대에게 들이대는 방식이에요.', F.dm.rel, '알아차리는 순간부터 반은 고쳐져요.')],
    ['내가 연인에게 서운함을 느끼는 지점은 어디인가요?', F => sen(lv(F, '인성') === '부족' ? '챙김을 받지 못한다고 느낄 때예요.' : lv(F, '식상') === '과다' ? '내 표현만큼 돌아오지 않을 때예요.' : '내 방식대로 사랑받지 못할 때예요.', F.dm.rel, '서운함은 그 주 안에 한 문장으로 말하세요.')],
    ['나는 사랑과 돈(현실) 중 어느 쪽에 더 흔들리나요?', F => sen(F.spouseGroup === '재성' ? '사랑과 현실이 같은 글자라 둘이 섞여요.' : F.g['재성'] > F.g['관성'] ? '현실 쪽에 더 흔들려요.' : '사랑 쪽에 더 흔들려요.', `손에 쥐는 힘이 ${T.LVV[lv(F, '재성')]}.`, '흔들리는 쪽을 먼저 적어 두면 결정이 쉬워져요.')],
    ['연인과 돈 문제가 생기기 쉬운 구조인가요?', F => { const risk = has(F, '겁재') || F.r.tenGods.some(t => t.group === '재성' && F.clashedPos.has(t.at.split(' ')[0])); return sen(risk ? '돈 문제가 생기기 쉬운 구조예요.' : '돈 문제가 크게 생기는 구조는 아니에요.', risk ? '나와 겨루는 힘이 있거나 돈 글자가 부딪히는 자리에 있어요.' : '돈 글자가 조용한 자리에 있어요.', LT.MONEY_REL[F.dayG].instead.replace(/\. [\s\S]*$/, '.')); }],
    ['나는 한 사람에게 오래 집중하는 편인가요?', F => sen(LT.LOVE_SP[Math.min(3, F.spouseN)].body, F.spouseN === 1 ? '집중하는 만큼 내 일상 하나는 지키세요.' : F.spouseN >= 2 ? '기한을 정하고 한 사람을 고르세요.' : '인연이 움직이는 달에 직접 나서야 보여요.')],
    ['내가 결혼 상대로 피해야 할 유형은?', F => sen(`아랫글자가 ${T.BRANCH_MEAN[CLASH[F.r.day.branch]]} 쪽인 사람과는 부딪히며 배워요.`, F.excess.length ? `${j(EP[F.excess[0]], '이')} 나처럼 넘치는 사람은 같은 데서 무너져요.` : '같은 자리가 비어 있는 사람은 서로 못 채워요.', '피하라기보다 그 사람과는 규칙이 먼저예요.')],
    ['내 사주에서 배우자 자리는 어떤 모습인가요?', F => sen(`가장 가까운 자리 글자는 ${T.BRANCH_MEAN[F.r.day.branch]}이에요.`, T.BRANCH_POS[F.r.day.branch][2] + '.', T.REL[F.dayG].body)],
    ['★ 이 사람과 나는 어떤 점에서 맞고 어디서 부딪히나요?', F => { const c = F.compat; return sen(c.facts.find(x => x.key === 'stem').text, c.facts.find(x => x.key === 'branch').text, c.facts.find(x => x.key === 'supply').text.replace(/\. [\s\S]*$/, '.')); }, 'partner'],
    ['★ 이 사람과 결혼하면 5년 뒤 관계는 어떤 모습일까요?', F => { const c = F.compat; const pf = facts(F.compatPr, {}); return sen(`${j(F.name, '은')} ${SHORT_THEME[F.nextD ? F.nextD.tenGod.group : F.curG]}, ${j(c.B, '은')} ${SHORT_THEME[pf.nextD ? pf.nextD.tenGod.group : pf.curG]} 쪽 10년으로 가요.`, c.facts.find(x => x.key === 'role').text, c.friction >= c.attract ? '부딪히는 자리를 역할로 나누면 5년 뒤도 같은 자리에 있어요.' : '끌림이 큰 사이라 방향만 맞추면 5년 뒤가 더 편해요.'); }, 'partner'],
  ];
  A.money = [
    ['나는 돈을 모으는 사람인가요, 굴리는 사람인가요?', F => sen((F.cnt['정재'] || 0) > (F.cnt['편재'] || 0) ? '차곡차곡 모으는 사람이에요.' : (F.cnt['편재'] || 0) > 0 ? '크게 굴리는 사람이에요.' : lv(F, '비겁') === '과다' ? '벌기보다 지키는 쪽이 과제인 사람이에요.' : '모으는 쪽에 가까워요.', LT.DM_MONEY[F.r.day.stem], LT.MONEY_LEVEL.재성[lv(F, '재성')])],
    ['내가 돈을 잃는 패턴은 뭔가요?', F => sen(has(F, '겁재') ? '사람에게 잃어요. 빌려주고 보증 서는 자리예요.' : lv(F, '비겁') === '과다' ? '동업과 공동 명의에서 잃어요.' : F.r.tenGods.some(t => t.group === '재성' && F.clashedPos.has(t.at.split(' ')[0])) ? '큰 거래에서 한 번에 잃어요.' : '지출 습관에서 조금씩 잃어요.', LT.LEAK[F.topE].avoid.replace(/지 마세요$/, '는 게 이 명식의 구멍이에요.'), LT.LEAK[F.topE].instead.replace(/\. [\s\S]*$/, '.'))],
    ['나는 월급형인가요, 사업형인가요?', F => { const biz = F.g['식상'] + F.g['재성'] > F.g['관성'] + 1; return sen(biz ? '사업형에 가까워요.' : F.g['관성'] > 0 ? '월급형에 가까워요.' : '둘 다 가능한 중간형이에요.', LT.MONEY_PATH[F.top[0]], biz ? '다만 울타리가 될 사람이나 규칙이 필요해요.' : '조직 안에서 부업으로 시험하는 순서가 맞아요.'); }],
    ['혼자 해야 하나요, 동업해야 하나요?', F => sen(lv(F, '비겁') === '과다' ? '혼자가 맞아요. 동업은 몫이 새요.' : lv(F, '비겁') === '부족' ? '동업은 되지만 내 몫을 먼저 말해야 해요.' : '역할만 나누면 동업도 괜찮아요.', has(F, '겁재') ? '나와 겨루는 힘이 있어 돈은 내 이름으로 두세요.' : '돈 거래는 문서로 하면 관계가 남아요.', '같이 하고 싶으면 돈 대신 시간과 일로 참여하세요.')],
    ['내가 돈 벌 때 쓰는 무기는 뭔가요?', F => sen(F.g['식상'] && F.g['재성'] ? '만들어서 파는 재주가 무기예요.' : F.g['식상'] ? '만드는 재주가 무기인데 파는 통로가 필요해요.' : F.g['재성'] ? '돈 냄새를 맡는 감각이 무기예요.' : `${G[F.top[0]]}이 무기예요.`, LT.MONEY_PATH[F.top[0]], `길게 보면 ${j(G[F.pick], '이')} 돈을 키워요.`)],
    ['내 사주에서 큰돈이 들어오는 시기는 언제인가요?', F => { const d = F.dec('재성'); const cur = F.cur; const now = cur && d.includes(cur) ? cur : null; const fut = d.filter(p => !cur || p.fromAge > cur.toAge); const past = d.filter(p => cur && p.toAge < cur.fromAge); return sen(now ? `지금 10년 계절(${now.fromAge}~${now.toAge}세)이 돈이 크게 움직이는 때예요.` : fut.length ? `돈이 크게 움직이는 다음 10년 계절은 ${fut[0].fromAge}~${fut[0].toAge}세예요.` : d.length ? `돈이 크게 움직이던 계절은 ${F.ages(past)}로 이미 지났어요.` : '돈이 크게 움직이는 10년 계절이 뚜렷하지 않아요.', past.length && (now || fut.length) ? `${F.ages(past)}는 이미 지난 돈의 계절이에요.` : (F.st.label === '신약' ? '힘이 약한 편이라 그때 몸을 먼저 챙겨야 남아요.' : '힘이 받쳐 주는 편이라 그때 결과로 바꾸세요.'), `${F.nextY}년에는 ${F.ml(F.monthsWith('재성'))}에 돈이 움직여요.`); }],
    ['올해 돈이 새는 달은 언제인가요?', F => sen(`${F.nextY}년 ${j(F.ml(F.cal.filter(c => c.branchGroup === '비겁' || c.stemGroup === '비겁')), '이에요')}.`, '나와 같은 기운이 드는 달이라 빌려주고 보증 서기 쉬워요.', F.caution.length ? `${F.ml(F.caution)}은 부딪히는 달이라 큰 지출도 피하세요.` : '')],
    ['올해 큰 지출·투자를 해도 되는 달은?', F => sen(`${F.nextY}년 ${j(F.ml(F.monthsWith('재성')), '이에요')}.`, '손에 쥐는 힘이 들어오고 부딪힘이 없는 달이에요.', '그 달에도 금액 상한은 먼저 정하세요.')],
    ['올해 절대 하면 안 되는 돈 관련 행동은?', F => { const y = F.yClash ? T.YEAR.clash : T.YEAR[F.y1.branchTenGod.group]; return sen(`${F.nextY}년엔 ${y.avoid.replace(/지 마세요$/, '는 것이에요')}.`, F.yClash ? `내 ${POSK2[F.yClash.name]}와 부딪히는 해예요.` : `${G[F.y1.branchTenGod.group]} 주제가 짙어지는 해예요.`, y.instead.replace(/\{good\}/g, F.good[0] ? F.good[0].label : '좋은 달').replace(/\. [\s\S]*$/, '.')); }],
    ['나는 투자에서 어떤 실수를 반복하나요?', F => sen(LT.DM_MONEY[F.r.day.stem], has(F, '겁재') ? '남 따라 들어가서 다치는 패턴이 있어요.' : lv(F, '식상') === '과다' ? '동시에 여러 곳에 벌여 정산이 늦어요.' : lv(F, '관성') === '부족' ? '상한 없이 들어가는 게 반복돼요.' : '정보 수집만 하다 기회를 놓쳐요.', '실수는 금액 상한과 분할로만 막혀요.')],
    ['내가 돈을 벌어도 안 남는 이유가 있나요?', F => sen(lv(F, '비겁') === '과다' ? '동업과 공동 지출에서 내 몫을 지키는 일이 중요해요.' : F.st.label === '신약' && lv(F, '재성') !== '부족' ? '힘보다 돈 기회가 많아 돈이 나를 소모해요.' : lv(F, '식상') === '과다' ? '벌이는 데 쓰느라 남지 않아요.' : lv(F, '관성') === '부족' ? '지키는 울타리가 비어 흩어져요.' : lv(F, '재성') === '부족' ? '손에 쥐는 감각이 비어 들어와도 남지 않아요.' : '새는 자리는 작아요. 떼어 두는 비율만 정하면 돼요.', LT.MONEY_LEVEL.관성[lv(F, '관성')], '월급날 자동이체 하나가 울타리예요.')],
    ['지금 하는 일(사업)이 내 명식과 맞나요?', F => sen(`맞는 구조는 ${LT.MONEY_PATH[F.top[0]].replace('가 맞아요.', '')}예요.`, `맞는 일은 ${j(T.CAREER[F.top[0]], '이에요')}.`, '지금 일이 이 안에 있으면 방향은 맞아요. 아니면 부업으로 옮겨 보세요.')],
    ['사업을 시작하기 좋은 시기는 언제인가요?', F => { const d = F.list.filter(p => ['식상', '재성'].includes(p.tenGod.group) && p.toAge >= (F.r.daeun ? F.r.daeun.ageYears : 0))[0]; return sen(d ? `${d.fromAge}~${d.toAge}세가 시작하기 좋은 10년이에요.` : '앞으로 시작에 좋은 10년 계절이 뚜렷하지 않아요.', `${F.nextY}년 안에서는 ${F.ml(F.monthsWith('식상').concat(F.monthsWith('재성')))}에 열어요.`, '시작은 작게, 가격은 먼저 정하고 하세요.'); }],
    ['내 사업에서 가장 위험한 변수는 뭔가요?', F => sen(F.clashes.length ? `${j(POSK2[F.clashes[0][0].name], '과')} ${POSK2[F.clashes[0][1].name]}가 부딪혀 그쪽이 흔들려요.` : '타고난 판에 큰 부딪힘은 없어요.', F.lacking.length ? `${j(EP[F.lacking[0]], '이')} 비어 ${ELEM_ENV[F.lacking[0]]}이 약해요.` : `${j(EP[F.lowE], '이')} 적어 ${ELEM_ENV[F.lowE]}이 약해요.`, '그 영역은 사람이나 외주로 메우세요.')],
    ['나는 어떤 사람과 돈 거래를 하면 손해 보나요?', F => sen(has(F, '겁재') ? '나와 같은 기운이 센 경쟁자형 사람이에요.' : `${j(EP[F.e], '이')} 넘치는 사람과는 몫 다툼이 생겨요.`, `아랫글자가 ${T.BRANCH_MEAN[CLASH[F.r.day.branch]]} 쪽인 사람과는 거래가 흔들려요.`, '가까울수록 문서로 하세요.')],
    ['보증·대여·공동명의 — 내 사주에서 금지인 게 있나요?', F => sen(lv(F, '비겁') === '과다' || has(F, '겁재') ? '셋 다 금지에 가까워요.' : lv(F, '비겁') === '부족' ? '보증은 금지, 대여는 상한을 두세요.' : '보증만 피하면 나머지는 문서로 가능해요.', LT.MONEY_LEVEL.비겁[lv(F, '비겁')], '같이 하고 싶으면 돈 대신 시간으로 참여하세요.')],
    ['부동산과 금융 중 내 사주에 맞는 자산은?', F => { const earth = F.r.elements['土'] / F.r.totalChars, fin = (F.r.elements['水'] + F.r.elements['金']) / F.r.totalChars; return sen(earth > fin ? '부동산처럼 묵히는 자산이 맞아요.' : fin > earth ? '금융처럼 흐르는 자산이 맞아요.' : '둘을 반반 두는 게 맞아요.', (F.cnt['정재'] || 0) >= (F.cnt['편재'] || 0) ? '차곡차곡 쥐는 힘이라 긴 보유가 편해요.' : '크게 굴리는 힘이라 분할 매매가 편해요.', '어느 쪽이든 상한과 기간을 먼저 정하세요.'); }],
    ['내 재물운이 가장 좋은 10년은 언제인가요?', F => { const best = F.st.label === '신약' ? F.dec('인성').concat(F.dec('비겁')) : F.dec('재성').concat(F.dec('식상')); return sen(best.length ? `${F.ages(best)}예요.` : '뚜렷한 10년이 없어 흐름보다 구조가 중요해요.', F.st.label === '신약' ? '힘이 약한 편이라 나를 채우는 계절에 돈이 남아요.' : '힘이 받쳐 주는 편이라 돈이 움직이는 계절에 커져요.', F.cur ? `지금은 ${F.cur.fromAge}~${F.cur.toAge}세, ${LT.MONEY_DECADE[F.curG].body[0]}` : ''); }],
    ['지금 대운에서 돈에 관해 가장 먼저 해야 할 일은?', F => sen(LT.MONEY_DECADE[F.curG].instead.replace(/\. [\s\S]*$/, '.'), LT.MONEY_DECADE[F.curG].body[1], `${j(G[F.pick], '을')} ${F.rx.dir === 'drain' ? '쓰는' : '채우는'} 쪽이 처방이에요.`)],
    ['내 사주의 재물 그릇은 어느 정도인가요?', F => { const big = lv(F, '재성') !== '부족', strong = F.st.label !== '신약', flow = F.g['식상'] > 0 && F.g['재성'] > 0; return sen(big && strong ? '그릇이 크고 담을 힘도 있어요.' : big ? '그릇은 큰데 담을 힘이 약해요.' : strong ? '그릇은 작지만 단단해요.' : '그릇을 키워야 하는 명식이에요.', flow ? '만들어서 파는 흐름이 있어 채우는 길이 열려 있어요.' : '파는 통로를 만들어야 그릇이 채워져요.', big && !strong ? '몸을 먼저 챙겨야 돈이 남아요.' : '떼어 두는 비율이 그릇의 바닥이에요.'); }],
  ];
  // 자녀: 1~14는 아이 명식만으로 답하고, 15~20은 부모 명식이 있어야 열린다(부모-자녀 조합).
  const KID_STYLE = { 관성: ['규칙이 통하는 아이예요.', '혼내는 게 아니라 어른이 먼저 지키는 약속이 통해요.'], 인성: ['규칙이 통하는 아이예요.', '혼내는 게 아니라 어른이 먼저 지키는 약속이 통해요.'], 재성: ['목표와 보상이 통하는 아이예요.', '스티커판과 용돈 교육이 잘 돼요.'], 비겁: ['칭찬이 통하는 아이예요.', '혼내면 더 안 들어요. 혼내기 전에 칭찬 하나 먼저요.'], 식상: ['칭찬이 통하는 아이예요.', '혼내면 더 안 들어요. 혼내기 전에 칭찬 하나 먼저요.'] };
  const KID_HARD = { 인성: '혼자 쉴 시간 없이 일정이 꽉 찼을 때 제일 힘들어요.', 식상: '속마음을 말로 설명해야 할 때 제일 힘들어요.', 비겁: '혼자 결정하고 혼자 버텨야 할 때 제일 힘들어요.', 재성: '결과로 비교당할 때 제일 힘들어요.', 관성: '이유 없이 엄격한 규칙 앞에서 제일 힘들어요.' };
  const KID_CRY = { 火: ['크게 터지고 금방 꺼져요.', '감정에 이름을 붙여 주면 빨리 가라앉아요.'], 水: ['겉으론 조용하고 속으로 오래 담아 둬요.', '그 자리 말고 나중에 따로 물어봐 주세요.'], 木: ['떼를 쓰고 몸으로 밀어붙여요.', '막기보다 방향을 바꿔 주세요.'], 土: ['입을 닫고 숨어요.', '재촉하지 말고 곁에 있어 주세요.'], 金: ['억울함을 따지고 공평을 요구해요.', '이유를 설명해 주면 풀려요.'] };
  const KID_ADULT = { 인성: '기다려 주고 차근차근 설명하는 어른이에요.', 비겁: '같이 뛰어 주고 편들어 주는 어른이에요.', 식상: '아이 말을 끝까지 듣고 표현을 칭찬하는 어른이에요.', 재성: '목표를 정해 주고 결과를 챙겨 주는 어른이에요.', 관성: '규칙이 분명하고 스스로도 지키는 어른이에요.' };
  const KID_PEER = { 식상: '분위기를 만드는 자리예요.', 관성: '규칙을 지키게 하는 자리예요.', 재성: '물건과 놀이를 챙기는 실속파 자리예요.', 인성: '한두 명과 깊게 지내는 자리예요.', 비겁: '앞에서 이끌거나 경쟁하는 자리예요.' };
  const KID_MONEY = { 과다: ['갖고 싶은 게 많고 손에 쥔 걸로 안심해요.', '사 주기보다 고르게 하고 기다리게 하세요.'], 부족: ['물건에 무심해서 잘 잃어버려요.', '물건마다 자리를 정해 주면 나아져요.'], 적정: ['필요한 만큼 챙기는 편이에요.', '용돈은 정해진 날에 정해진 만큼이 잘 맞아요.'] };
  A.child = [
    ['★ 아이의 타고난 기질은 어떤가요?', F => sen(`${T.SEASON_WORD[F.season]}의 ${F.dm.noun} 같은 아이예요.`, F.dm.body[0], F.dm.body[2])],
    ['아이는 칭찬이 통하나요, 규칙이 통하나요?', F => { const k = KID_STYLE[F.strong]; return sen(k[0], `${j(G[F.strong], '이')} 가장 커서 그래요.`, k[1]); }],
    ['아이가 가장 힘들어하는 상황은 뭔가요?', F => sen(KID_HARD[F.weak], `${j(G[F.weak], '이')} 비어 있는 자리라서요.`, '그 상황은 줄여 주고, 생기면 먼저 안아 주세요.')],
    ['아이 힘이 센 편인가요, 약한 편인가요?', F => sen(F.st.label === '신강' ? '힘이 센 아이예요.' : F.st.label === '신약' ? '힘이 약한 쪽인 아이예요.' : '힘이 딱 중간인 아이예요.', '타고난 힘과 받쳐 주는 힘을 더해 본 결과예요.', F.st.label === '신강' ? '부딪혀 봐야 배우니 다 막아 주지 마세요.' : F.st.label === '신약' ? '나쁜 게 아니라 안아 줘야 크는 아이예요.' : '밀어도 되고 안아 줘도 돼요. 아이가 원하는 걸 보세요.')],
    ['아이가 울거나 화낼 때 어떤 모습인가요?', F => { const k = KID_CRY[F.topE]; return sen(k[0], `${j(EP[F.topE], '이')} 가장 많아서 그래요.`, k[1]); }],
    ['아이에게 잘 맞는 선생님·어른은 어떤 유형인가요?', F => sen(KID_ADULT[F.pick], `아이에게 모자란 ${j(G[F.pick], '을')} 채워 주는 사람이라서요.`, '학원을 고를 때 과정보다 이 유형인지 먼저 보세요.')],
    ['아이는 친구들 사이에서 어떤 자리인가요?', F => sen(F.lvG['비겁'] === '과다' ? '앞에서 이끌거나 경쟁하는 자리예요.' : F.lvG['비겁'] === '부족' ? '따라가며 맞춰 주는 자리예요.' : KID_PEER[F.strong], F.lvG['비겁'] === '과다' ? '나 자신의 힘이 넘쳐 지는 걸 못 참아요.' : F.lvG['비겁'] === '부족' ? '나 자신의 힘이 작아 싫다는 말을 늦게 해요.' : `${j(G[F.strong], '이')} 가장 커서 그래요.`, F.lvG['비겁'] === '과다' ? '지는 연습을 놀이로 시켜 주세요.' : F.lvG['비겁'] === '부족' ? '집에서 먼저 싫다고 말하는 연습을 하세요.' : '그 자리를 칭찬해 주면 친구 사이가 편해져요.')],
    ['아이가 어려워하기 쉬운 활동 쪽은 어디인가요?', F => sen(`${ELEM_ENV[F.lowE]} 쪽이에요.`, `${j(EP[F.lowE], '이')} 가장 적어서요.`, '못하는 게 아니라 늦게 오는 거라 비교만 안 하면 돼요.')],
    ['★ 아이에게 잘 맞는 학습·활동 방향은?', F => sen(T.C_WORK[F.top[0]].body, `${T.CAREER_C[F.top[0]]} 놀이에서 눈이 빛나요.`, `${j(G[F.pick], '을')} 키우는 활동이 길게 보면 아이를 받쳐요.`)],
    ['아이가 10대가 되면 어떻게 달라지나요?', F => { const d = F.list.find(p => p.fromAge <= 15 && p.toAge >= 15) || F.list.find(p => p.fromAge > 10); return sen(d ? `열다섯 무렵 10년 계절은 ${T.DECADE[d.tenGod.group].theme}이에요.` : '10대의 10년 계절은 아직 뚜렷하지 않아요.', d ? T.DECADE[d.tenGod.group].body[0] : '', '그때 부모 역할은 지시보다 지켜보기예요.'); }],
    ['올해 아이가 새로운 걸 시작하기 좋은 달은?', F => sen(`${F.nextY}년 ${F.ml(F.monthsWith(F.pick))}이에요.`, '학원·새 친구·새 습관은 이때 시작하세요.', `아이에게 모자란 ${j(G[F.pick], '이')} 들어오는 달이라서요.`)],
    ['올해 아이가 흔들리는 달은 언제인가요?', F => sen(F.caution.length ? `${F.nextY}년 ${F.ml(F.caution)}이에요.` : `${F.nextY}년엔 크게 흔들리는 달이 없어요.`, F.caution.length ? '그 달엔 학교·학원을 바꾸지 말고 더 안아 주세요.' : '그래도 큰 변화는 한 번에 하나씩만요.', F.caution.length ? '아이 글자와 부딪히는 달이라서요.' : '아이 글자와 정면으로 부딪히는 달이 없어서요.')],
    ['아이 몸에서 약해지기 쉬운 쪽은? (전통 배속 참고)', F => sen(T.BODY_SIGNAL[F.e], F.lacking.length ? `${j(EP[F.lacking[0]], '이')} 비어 그쪽 신호도 같이 봐요.` : `${j(EP[F.topE], '이')} 넘칠 때 과열 신호가 와요.`, '진단이 아니에요. 아프면 병원이 먼저예요.')],
    ['아이는 돈과 물건을 어떻게 대하나요?', F => { const k = KID_MONEY[F.lvG['재성']] || KID_MONEY['적정']; return sen(k[0], `${j(G['재성'], '이')} ${{ 과다: '넘쳐서요', 부족: '적어서요' }[F.lvG['재성']] || '알맞은 정도라서요'}.`, k[1]); }],
    ['★ 아이와 나는 어떤 부모-자녀 조합인가요?', F => { const c = CP.analyze(F.parent.r, F.r, { kind: 'friend', nameA: '부모', nameB: '아이' }); return sen(c.facts.find(x => x.key === 'stem').text, c.facts.find(x => x.key === 'branch').text, c.facts.find(x => x.key === 'supply').text.replace(/\. [\s\S]*$/, '.')); }, 'parent'],
    ['자녀와 나는 어떤 지점에서 부딪히기 쉬운가요?', F => { const P = F.parent; const hc = P.clashes.find(c => c.some(x => x.name === '시주')); return sen(hc ? '자녀 자리가 다른 자리와 부딪혀 아이 일로 집이 흔들리기 쉬워요.' : '자녀 자리에 직접 부딪힘은 없어요.', P.g['식상'] > P.g['관성'] ? '내가 표현이 세서 아이의 규칙을 흔들기 쉬워요.' : '내가 규칙이 세서 아이의 표현을 누르기 쉬워요.', '부딪히는 날은 결론을 내지 말고 다음 날 다시 말하세요.'); }, 'parent'],
    ['내가 자녀에게 무의식적으로 강요하기 쉬운 것은?', F => { const P = F.parent; return sen(P.excess.length ? `${j(EP[P.excess[0]], '이')} 넘쳐 ${ELEM_ENV[P.excess[0]]}을 강요하기 쉬워요.` : `${j(G[P.strong], '이')} 커서 내 방식을 강요하기 쉬워요.`, '아이는 나와 다른 글자로 태어났어요.', '강요 대신 보여 주는 쪽이 오래가요.'); }, 'parent'],
    ['내가 자녀에게 주기 어려운 것은 뭔가요?', F => { const P = F.parent; const e = P.lacking[0] || P.lowE; return sen(`${j(EP[e], '이')} 적어 ${j(ELEM_GIVE[e], '을')} 주기 어려워요.`, '없는 걸 억지로 주기보다 그걸 가진 어른을 곁에 두세요.', '부족을 아는 부모가 아이를 덜 다치게 해요.'); }, 'parent'],
    ['나는 자녀 교육에서 어떤 실수를 하기 쉬운가요?', F => { const P = F.parent; return sen(P.lvG['인성'] === '과다' ? '배움을 너무 많이 얹어 아이를 지치게 해요.' : P.lvG['인성'] === '부족' ? '기다려 주지 못하고 결과부터 봐요.' : P.lvG['관성'] === '과다' ? '규칙과 평가로 아이를 재기 쉬워요.' : '내가 잘하는 방식만 정답으로 여기기 쉬워요.', P.dm.childTip.replace(/\. [\s\S]*$/, '.'), '아이의 글자는 내 글자와 달라요.'); }, 'parent'],
    ['아이에게 내가 물려주기 쉬운 성향은?', F => { const P = F.parent; return sen(`${P.dm.noun} 같은 성향이에요. ${P.dm.body[0]}`, P.excess.length ? `${j(EP[P.excess[0]], '이')} 넘치는 것도 같이 가요.` : '', '좋은 것은 보여 주고 넘치는 것은 말로 알려 주세요.'); }, 'parent'],
  ];
  A.mbti = [
    ['내 사주가 추정하는 MBTI는 뭔가요?', F => sen(`타고난 결로 읽으면 ${F.est.letters}예요.`, `가장 크게 민 재료는 ${F.est.axes[0].factors[0].label}이에요.`, '검사와 다르면 환경이 만든 모습이 섞인 거예요.'), 'mbti'],
    ['검사 결과와 사주가 다른 축은 어디고, 왜 다른가요?', F => { const mm = F.cmp.axes.filter(x => !x.match); return sen(mm.length ? `다른 축은 ${mm.map(x => x.id[0] + '/' + x.id[1]).join('·')}예요.` : '네 축이 모두 같은 방향이에요.', mm.length ? `${T.AXIS_NAME[mm[0].id]}은 ${F.est.axes.find(a => a.id === mm[0].id).factors[0].label} 때문에 ${mm[0].chart} 쪽이에요.` : '지금 환경이 타고난 결을 잘 쓰고 있어요.', mm.length ? '검사는 지금 역할, 타고난 결은 충전 방식이에요.' : ''); }, 'mbti'],
    ['그 다른 축이 내 일상에서 어떻게 피로로 나타나나요?', F => { const mm = F.cmp.axes.filter(x => !x.match)[0]; return mm ? M.TEXTS[mm.id][mm.test + mm.chart] : '다른 축이 없어 피로의 자리는 환경 변화 때만 와요.'; }, 'mbti'],
    ['나는 왜 상황마다 MBTI가 달라지는 것 같나요?', F => sen(`지금 10년 계절은 ${G[F.curG]} 주제라 ${GROUP_AXIS[F.curG]} 쪽으로 밀어요.`, `${F.nextY}년은 ${G[F.y1.branchTenGod.group]} 주제라 ${GROUP_AXIS[F.y1.branchTenGod.group]} 쪽이 더 나와요.`, '달라지는 게 아니라 쓰이는 자리가 바뀌는 거예요.'), 'mbti'],
    ['내가 되고 싶은 MBTI는 내 명식과 얼마나 먼가요?', F => F.adv ? sen(`되고 싶은 ${F.adv.goal} 중 ${F.adv.same}축은 타고난 결과 같아요.`, F.adv.same === 4 ? '방향은 맞고 남은 건 속도와 과열 관리예요.' : `${4 - F.adv.same}축은 결을 거슬러 바꾸기보다 빌려 쓰는 쪽이 오래가요.`, `사주가 권하는 흐름은 ${j(F.adv.rec, '이에요')}.`) : '되고 싶은 MBTI를 넣으면 거리를 재 드려요.', 'mbti'],
    ['되고 싶은 모습으로 가려면 무엇을 빌려 써야 하나요?', F => { if (!F.adv) return '되고 싶은 MBTI를 넣으면 빌려 쓸 힘을 알려 드려요.'; const h = F.adv.axes.find(x => x.kind === 'against') || F.adv.axes.find(x => x.kind === 'drift') || F.adv.axes[0]; return sen(`${h.goal} 쪽으로 가려면 ${j(T.MOVE_PLAIN[h.goal], '을')} 빌려요.`, T.MOVE_HOW[h.goal]); }, 'mbti'],
    ['내 E/I는 사교성인가요, 출력 욕구인가요?', F => sen(F.g['식상'] >= F.g['비겁'] ? '출력 욕구에 가까워요. 꺼내야 풀리는 사람이에요.' : '사람 사이에서 힘이 나는 사교성 쪽이에요.', `내보내는 힘이 ${T.LVV[lv(F, '식상')]}, 나 자신의 힘이 ${T.LVV[lv(F, '비겁')]}.`, '혼자서라도 만들어 내보내면 충전돼요.'), 'mbti'],
    ['내 S/N — 큰 그림형인가요, 실행형인가요?', F => { const a = F.est.axes.find(x => x.id === 'SN'); return sen(a.letter === 'S' ? '실행형이에요. 눈앞의 결과에서 힘이 나요.' : '큰 그림형이에요. 가능성을 먼저 봐요.', `결과 화면과 같은 계산에서 ${a.letter} 쪽으로 기울어요.`, '약한 쪽은 사람이나 도구로 메우면 돼요.'); }, 'mbti'],
    ['내 T/F — 결정할 때 뭘 먼저 보나요?', F => { const a = F.est.axes.find(x => x.id === 'TF'); return sen(a.letter === 'T' ? '기준을 먼저 봐요.' : '사람과 온도를 먼저 봐요.', `결과 화면과 같은 계산에서 ${a.letter} 쪽으로 기울어요.`, '실제 선택과 비교하며 참고해 보세요.'); }, 'mbti'],
    ['내 J/P — 계획 안에서 힘이 나나요, 밖에서 나나요?', F => { const a = F.est.axes.find(x => x.id === 'JP'); return sen(a.letter === 'J' ? '계획 안에서 힘이 나요.' : '계획 밖, 열린 상태에서 힘이 나요.', `결과 화면과 같은 계산에서 ${a.letter} 쪽으로 기울어요.`, '마감 하나만 밖에 걸어 두면 어느 쪽이든 돼요.'); }, 'mbti'],
    ['사주상 나와 잘 맞는 MBTI 유형은?', F => { const he = S.STEM_ELEM[S.STEMS.indexOf(R.STEM_HAP[F.r.day.stem])]; const t = M.AXES.map(a => { const v = (M.RULES[a.id].elems[he] || 0); return v > 0 ? a.left : v < 0 ? a.right : F.est.axes.find(x => x.id === a.id).letter; }).join(''); return sen(`끌어당기는 글자 쪽으로 보면 ${t} 유형이에요.`, `${j(EP[he], '이')} 많은 사람이 나를 끌어당겨요.`, '유형은 입구고 두 명식을 맞대야 결론이에요.'); }, 'mbti'],
    ['사주상 나와 부딪히는 MBTI 유형은?', F => { const he = S.STEM_ELEM[S.STEMS.indexOf(R.STEM_HAP[F.r.day.stem])]; const ov = Object.keys(OVER).find(k => OVER[k] === F.e); const oe = ov !== he ? ov : OVER[F.e]; const t = M.AXES.map(a => { const v = (M.RULES[a.id].elems[oe] || 0); return v > 0 ? a.left : v < 0 ? a.right : F.est.axes.find(x => x.id === a.id).letter === a.left ? a.right : a.left; }).join(''); return sen(`나를 누르는 글자 쪽으로 보면 ${t} 유형과 부딪혀요.`, `${j(EP[oe], '이')} 넘치는 사람과는 결이 자주 엇갈려요.`, '부딪히는 유형은 피하기보다 역할을 나누면 돼요.'); }, 'mbti'],
    ['내 MBTI 약점을 사주로 보면 어디서 오나요?', F => sen(`${j(G[F.weak], '이')} 비어 있는 데서 와요.`, T.WEAK_WHY[F.weak], `${j(EP[F.lacking[0] || F.lowE], '이')} 적은 것도 같은 방향이에요.`), 'mbti'],
    ['지금 10년(대운)은 내 MBTI를 어느 쪽으로 미나요?', F => sen(F.cur ? `${F.cur.fromAge}~${F.cur.toAge}세는 ${G[F.curG]} 주제예요.` : '아직 첫 10년 계절 전이에요.', `${GROUP_AXIS[F.curG]} 쪽으로 밀어요.`, T.DECADE[F.curG].body[0]), 'mbti'],
    ['올해 내 성격이 어느 방향으로 흔들리나요?', F => sen(`${F.nextY}년은 ${G[F.y1.branchTenGod.group]} 주제예요.`, `${GROUP_AXIS[F.y1.branchTenGod.group]} 쪽이 평소보다 더 나와요.`, F.yClash ? `내 ${POSK2[F.yClash.name]}와 부딪혀 기복이 커요.` : '흔들림보다 쓰이는 자리가 바뀌는 해예요.'), 'mbti'],
    ['나는 리더형인가요, 참모형인가요?', F => sen(F.g['비겁'] + F.g['관성'] > F.g['인성'] + F.g['식상'] ? '리더형이에요. 앞에 서는 자리에서 힘이 나요.' : '참모형이에요. 받쳐 주고 만드는 자리에서 힘이 나요.', `${F.g['비겁'] + F.g['관성'] > F.g['인성'] + F.g['식상'] ? '나 자신의 힘과 누르는 힘' : '배우는 힘과 내보내는 힘'}이 더 커요.`, '어느 쪽이든 역할이 분명할 때 오래가요.'), 'mbti'],
    ['내가 스트레스받을 때 튀어나오는 그림자 성향은?', F => sen(`${j(EP[F.topE], '이')} 넘칠 때 ${ELEM_SHADOW[F.topE]}.`, T.BODY_SIGNAL[F.e], '그 신호가 오면 하루를 비우는 게 먼저예요.'), 'mbti'],
    ['MBTI와 사주 중 어느 쪽이 지금 나를 더 잘 설명하나요?', F => sen(F.cmp.matches >= 3 ? '둘이 거의 같아 어느 쪽이든 나를 설명해요.' : F.cmp.matches >= 2 ? '반반이라 상황에 따라 다른 쪽이 맞아요.' : '지금은 검사가 역할을, 타고난 결이 충전을 설명해요.', M.SUMMARY[F.cmp.matches].replace(/\. [\s\S]*$/, '.'), '둘 중 하나가 틀린 게 아니라 둘 다 나예요.'), 'mbti'],
    ['내 성격을 가장 잘 쓰는 환경은 어디인가요?', F => sen(`${j(EP[F.elemOf(F.pick)], '이')} 많은 환경, 즉 ${ELEM_ENV[F.elemOf(F.pick)]}이에요.`, `맞는 일은 ${j(T.CAREER[F.top[0]], '이에요')}.`, T.WORK_STYLE[F.strong]), 'mbti'],
    ['4주 안에 실험해볼 수 있는 성격 과제 하나는?', F => { const mm = F.cmp.axes.filter(x => !x.match)[0]; return sen(mm ? `${T.EXP[mm.id]}.` : `${T.EXP.EI}.`, '숫자가 검사와 타고난 결 중 어느 쪽이 맞혔는지 말해 줘요.'); }, 'mbti'],
  ];
  const rs = s => `${s} ${S.STEMS_KO[S.STEMS.indexOf(s)]}(${T.STEM_MEAN[s]})`, rd = b => `${b} ${S.BRANCHES_KO[S.BRANCHES.indexOf(b)]}(${T.BRANCH_MEAN[b]})`, rb = b => `${b} ${S.BRANCHES_KO[S.BRANCHES.indexOf(b)]}`;
  const SHORT_THEME = { 비겁: '자립', 식상: '표현', 재성: '돈', 관성: '책임', 인성: '배움' };
  const haeyo = t => String(t).replace(/있습니다/g, '있어요').replace(/없습니다/g, '없어요').replace(/옵니다/g, '와요').replace(/갑니다/g, '가요').replace(/봅니다/g, '봐요').replace(/큽니다/g, '커요').replace(/늦습니다/g, '늦어요').replace(/못합니다/g, '못해요').replace(/됩니다/g, '돼요').replace(/합니다/g, '해요').replace(/입니다/g, '이에요').replace(/십시오/g, '세요').replace(/습니다/g, '어요');
  const SINSAL_KO = { 역마: '이동과 변화가 많은 글자예요', 도화: '사람을 끄는 매력과 인기의 글자예요', 화개: '혼자 깊어지는 예술·종교·고독의 글자예요', 백호: '기운이 세서 급한 결정을 조심하라는 글자예요', 귀문: '예민함과 직감이 함께 오는 짝이에요' };
  A.master = [
    ['내 일간은 어떤 글자고, 어떤 사람을 뜻하나요?', F => sen(`일간(나를 뜻하는 글자)은 ${rs(F.r.day.stem)}이에요.`, `${T.SEASON_WORD[F.season]}의 ${F.dm.noun}이에요.`, `${F.dm.line}.`)],
    ['내 명식에서 가장 센 글자와 가장 약한 글자는?', F => sen(`가장 센 기운은 ${EP[F.topE]}, 가장 약한 기운은 ${EP[F.lowE]}예요.`, `십신으로는 ${j(G[F.strong], '이')} 가장 크고 ${j(G[F.weak], '이')} 가장 작아요.`, T.WEAK_WHY[F.weak])],
    ['내 사주는 신강인가요, 신약인가요? 그게 왜 중요한가요?', F => sen(`${F.st.label}, ${T.SP[F.st.label]}이에요.`, F.st.why[0].replace(/([一-龥])\(([一-龥])\)/g, (m, b, e) => `${b} ${S.BRANCHES_KO[S.BRANCHES.indexOf(b)]}`).replace(/돕습니다/g, '도와요').replace(/않습니다/g, '않아요').replace(/\((득령|실령)\)/g, '') + '.', `그래서 처방은 ${F.rx.dir === 'drain' ? '덜어 쓰는' : '채우는'} 쪽이에요.`, '모든 조언의 방향이 여기서 정해져요.')],
    ['내 격(格)은 무엇이고, 어떤 인생 무대를 뜻하나요?', F => sen(`월지(태어난 달 글자) 기준 ${F.gyeok}이에요.`, `${R.GOD_NUANCE[F.monthTG.name]}의 무대에서 살아갈 가능성이 커요.`, `쉽게 말해 ${G[F.monthTG.group]} 주제가 직업의 틀이에요.`)],
    ['내 용신은 무엇이고, 생활에서 어떻게 채우나요?', F => sen(`용신(나를 살리는 기운) 1순위는 ${F.pick}, 즉 ${G[F.pick]}이에요.`, T.FILL_ACTION[F.pick], `${j(EP[F.elemOf(F.pick)], '이')} 많은 환경과 사람이 도와요.`)],
    ['내 명식에서 피해야 할 기운(기신)은 뭔가요?', F => sen(`기신(덜어야 할 기운)은 ${F.gisin}, 즉 ${G[F.gisin]}이에요.`, F.st.label === '신강' ? '힘이 센 편이라 나를 더 세게 하는 기운이 짐이 돼요.' : F.st.label === '신약' ? '힘이 약한 편이라 나를 빼 가는 기운이 짐이 돼요.' : '계절 균형을 깨는 쪽이 짐이 돼요.', `${j(EP[F.elemOf(F.gisin)], '이')} 몰리는 달과 사람을 가볍게 두세요.`)],
    ['내 네 기둥(년·월·일·시)은 각각 어떤 시기를 말하나요?', F => sen('년주는 어린 시절과 집안, 월주는 사회와 직업이에요.', '일주는 나와 배우자, 시주는 자녀와 말년이에요.', `내 월주는 ${rb(F.r.month.branch)}, 일주는 ${rb(F.r.day.branch)}예요.`)],
    ['내 원국에 충이 있나요? 어디서 어떻게 작동하나요?', F => sen(F.clashes.length ? `충(부딪힘)은 ${F.clashes.map(c => `${c[0].name} ${rb(c[0].b)}·${c[1].name} ${rb(c[1].b)}`).join(', ')}예요.` : '원국 지지 사이에 충(부딪힘)은 없어요.', F.clashes.length ? `${j(POSK2[F.clashes[0][0].name], '과')} ${POSK2[F.clashes[0][1].name]} 영역에서 변동이 반복돼요.` : '안정적이지만 운에서 오는 부딪힘이 크게 느껴져요.')],
    ['내 원국에 합이 있나요? 무엇이 묶여 있나요?', F => sen(F.stemHaps.length ? `천간합은 ${F.stemHaps.map(p => `${p[0].name}·${p[1].name}`).join(', ')} 윗글자예요.` : '윗글자끼리의 천간합은 없어요.', F.haps.length ? `육합(끌림)은 ${F.haps.map(c => `${c[0].name} ${rb(c[0].b)}·${c[1].name} ${rb(c[1].b)}`).join(', ')}예요.` : '아랫글자끼리의 육합(끌림)은 없어요.', F.haps.length || F.stemHaps.length ? '묶인 자리는 결속이자 발이 묶이는 자리예요.' : '')],
    ['내 원국에 형·파·해가 있나요?', F => sen(F.hyeongs.length ? `형(마찰)은 ${F.hyeongs.map(c => `${c[0].name}·${c[1].name}`).join(', ')}예요.` : '형(마찰)은 없어요.', F.haes.length ? `해(어긋남)는 ${F.haes.map(c => `${c[0].name}·${c[1].name}`).join(', ')}예요.` : '해(어긋남)는 없어요.', '파는 영향이 작아 이 리포트에서는 보지 않아요.')],
    ['내 사주에서 비어 있는 오행은 뭐고, 어떻게 보완하나요?', F => sen(F.lacking.length ? `${F.lacking.map(e => EP[e]).join('·')}이 비어 있어요.` : `아예 빈 오행은 없고 ${j(EP[F.lowE], '이')} 가장 적어요.`, `${ELEM_GIVE[F.lacking[0] || F.lowE]}를 생활에 두는 게 보완이에요.`, `상징으로는 ${SYM[F.lacking[0] || F.lowE]} 쪽이에요.`)],
    ['내 사주에서 넘치는 오행은 뭐고, 어떻게 덜어내나요?', F => sen(F.excess.length ? `${F.excess.map(e => EP[e]).join('·')}이 넘쳐요.` : `넘치는 오행은 없고 ${j(EP[F.topE], '이')} 가장 많아요.`, `넘칠 때 ${ELEM_SHADOW[F.excess[0] || F.topE]}.`, `${j(EP[GEN[F.excess[0] || F.topE]], '으로')} 흘려보내면 덜어져요.`)],
    ['조후(계절 온도)로 보면 내게 필요한 기운은?', F => sen(T.SEASON_SENT[F.season], `조후로는 ${j(EP[T.SEASON_NEED[F.season]], '이')} 반가워요.`, `일간 기준으로 그 기운은 ${G[F.groupOf(T.SEASON_NEED[F.season])]}이에요.`)],
    ['내 십신 분포로 보는 인생의 중심 주제는?', F => sen(`가장 큰 힘은 ${G[F.strong]}(${F.strong})이에요.`, haeyo(R.GROUP_BALANCE[F.strong][F.lvG[F.strong]].split('. ')[0]) + '.', `가장 작은 ${G[F.weak]}(${F.weak})을 ${F.rx.allowed.includes(F.weak) ? '채우는' : '빌려 쓰는'} 게 평생 과제예요.`)],
    ['내 사주에 있는 신살은 뭐고, 어떤 뜻인가요?', F => sen(F.sinsal.length ? F.sinsal.slice(0, 3).map(x => `${x.k}(${x.at}): ${SINSAL_KO[x.k]}.`).join(' ') : '역마·도화·화개·백호·귀문 중 뚜렷한 신살이 없어요.', '신살은 참고 표지이고 판정을 바꾸지 않아요.')],
    ['지장간(숨은 글자)으로 보면 겉과 다른 내 모습은?', F => sen(`일지 ${rb(F.r.day.branch)} 속에 ${j([...new Set(F.hidden)].map(k => G[k]).join('·'), '이')} 숨어 있어요.`, F.hidden[0] !== F.dayG ? `겉은 ${G[F.dayG]}, 속은 ${G[F.hidden[0]]}이에요.` : '겉과 속이 같은 글자라 보이는 대로예요.', '가까운 사람만 속의 글자를 봐요.')],
    ['내 대운 흐름을 10년 단위로 보면 인생 곡선은 어떤가요?', F => sen(F.list.length ? F.list.slice(0, 4).map(p => `${p.fromAge}세 ${SHORT_THEME[p.tenGod.group]}`).join(', ') + ' 순으로 가요.' : '성별이 없어 대운을 세우지 않았어요.', F.list.length > 4 ? F.list.slice(4).map(p => `${p.fromAge}세 ${SHORT_THEME[p.tenGod.group]}`).join(', ') + '이 뒤따라요.' : '', F.cur ? `지금은 ${F.cur.fromAge}~${F.cur.toAge}세 구간이에요.` : '')],
    ['지금 대운은 내 인생에서 어떤 장면인가요?', F => sen(F.cur ? `${F.cur.fromAge}~${F.cur.toAge}세, ${T.DECADE[F.curG].theme}이에요.` : '아직 첫 10년 계절 전이에요.', T.DECADE[F.curG].body[0], T.DECADE[F.curG].body[1])],
    ['다음 대운으로 넘어갈 때 무엇이 바뀌나요?', F => sen(F.nextD ? (F.nextD.tenGod.group === F.curG ? `${F.nextD.fromAge}세부터도 같은 주제가 글자만 바꿔 이어져요.` : `${F.nextD.fromAge}세부터 ${j(T.DECADE[F.nextD.tenGod.group].theme, '으로')} 바뀌어요.`) : '다음 10년 계절 정보가 없어요.', F.nextD ? T.DECADE[F.nextD.tenGod.group].body[0] : '', F.edge ? '지금이 경계라 큰 결정은 첫해를 지나 보고 하세요.' : '경계 2년 동안은 환경과 관계가 같이 흔들려요.')],
    ['내 인생에서 가장 좋은 10년과 가장 조심할 10년은?', F => sen(`좋은 10년은 ${F.ages(F.dec(F.pick))}예요.`, `조심할 10년은 ${F.ages(F.dec(F.gisin).filter(p => !F.dec(F.pick).includes(p)))}예요.`, `${j(G[F.pick], '이')} 들면 좋고 ${j(G[F.gisin], '이')} 몰리면 무거워요.`)],
    ['올해 세운은 내 원국과 어떻게 작용하나요?', F => { const c0 = [F.r.day, F.r.year].find(x => CLASH[F.y0.branch] === x.branch); return sen(`${F.nowY}년은 ${rs(F.y0.stem)} ${rd(F.y0.branch)}예요.`, F.y0.tenGod.group === F.y0.branchTenGod.group ? `윗글자와 아랫글자 모두 ${G[F.y0.tenGod.group]} 주제예요.` : `윗글자는 ${G[F.y0.tenGod.group]}, 아랫글자는 ${G[F.y0.branchTenGod.group]} 주제예요.`, c0 ? `내 ${POSK2[c0.name]}와 충(부딪힘)이라 변동이 컸어요.` : '원국과 부딪히지 않아 주제가 조용히 흘러요.'); }],
    ['내년 세운에서 미리 준비할 것은?', F => { const y = F.yClash ? T.YEAR.clash : T.YEAR[F.y1.branchTenGod.group]; return sen(`${F.nextY}년은 ${rs(F.y1.stem)} ${rd(F.y1.branch)}예요.`, y.instead.replace(/\{good\}/g, F.good[0] ? F.good[0].label : '좋은 달').replace(/\. [\s\S]*$/, '.'), F.yClash ? `내 ${POSK2[F.yClash.name]}와 부딪히는 해라 순서가 전부예요.` : `${G[F.y1.branchTenGod.group]} 주제가 짙어지는 해예요.`); }],
    ['올해 열두 달 중 밀어붙일 달과 멈출 달은?', F => sen(`${F.nextY}년 밀어붙일 달은 ${j(F.ml(F.push), '이에요')}.`, `멈출 달은 ${j(F.ml(F.caution), '이에요')}.`, '달의 경계는 1일이 아니라 절입일이에요.')],
    ['내 사주에서 부모 자리는 어떤가요?', F => sen(`년주 ${rb(F.r.year.branch)}, 월주 ${rb(F.r.month.branch)}가 부모와 집안 자리예요.`, `어머니 자리인 인성(쉬고 배우는 힘)은 ${T.LVV[lv(F, '인성')]}.`, `아버지 자리인 재성(손에 쥐는 힘)은 ${T.LVV[lv(F, '재성')]}.`)],
    ['내 사주에서 형제·동료 자리는 어떤가요?', F => { const pos = F.r.tenGods.filter(t => t.group === '비겁').map(t => t.at.split(' ')[0]); return sen(`비겁(나 자신의 힘)은 ${pos.length ? [...new Set(pos)].join('·') + '에 있어요' : '드러나 있지 않아요'}.`, haeyo(R.GROUP_BALANCE['비겁'][lv(F, '비겁')].split('. ')[0]) + '.', has(F, '겁재') ? '겁재(나와 겨루는 힘)가 있어 돈 거래는 조심해요.' : '동료와 몫 다툼은 크지 않아요.'); }],
    ['내 사주에서 건강이 약해지기 쉬운 쪽은? (전통 배속 참고)', F => sen(T.BODY_SIGNAL[F.e], F.lacking.length ? `${j(EP[F.lacking[0]], '이')} 비어 그쪽 신호도 같이 봐요.` : `${j(EP[F.topE], '이')} 넘칠 때 과열 신호가 와요.`, '전통 배속이고 진단이 아니에요. 증상은 병원이 먼저예요.')],
    ['내 사주의 공망은 어디고, 무슨 뜻인가요?', F => sen(`일주 기준 공망(빈 자리)은 ${F.gongmang.branches.map(rb).join('·')}예요.`, F.gongmang.hits.length ? `${F.gongmang.hits.join('·')}가 공망이라 그 자리는 기대가 비어 자유롭지만 허전해요.` : '원국에 공망에 걸린 자리는 없어요.', '공망은 결핍이 아니라 매이지 않는 자리예요.')],
    ['내 명식에서 평생 반복될 한 가지 주제는?', F => sen(`${G[F.strong]}이 크고 ${G[F.weak]}이 작은 구조예요.`, haeyo(R.INTERACT[F.strong][F.weak].split('. ')[0]) + '.', '이 한 줄이 연애·돈·일에서 같은 모양으로 반복돼요.')],
    ['내 명식이 가진 가장 큰 자산은 뭔가요?', F => sen(`${G[F.pick]}을 쓸 때 가장 잘 풀려요.`, F.haps.length || F.stemHaps.length ? '원국에 합(끌림)이 있어 사람을 끌어당기는 힘이 자산이에요.' : `${F.gyeok}의 무대, 즉 ${G[F.monthTG.group]} 주제가 자산이에요.`, F.dm.body[0])],
    ['전문가라면 내 명식에서 꼭 짚을 세 가지는?', F => sen(`첫째, ${F.st.label}이라 ${F.rx.dir === 'drain' ? '덜어 쓰는' : '채우는'} 방향이 전부예요.`, F.clashes.length ? `둘째, ${j(POSK2[F.clashes[0][0].name], '과')} ${POSK2[F.clashes[0][1].name]}의 충이 변동의 뿌리예요.` : `둘째, ${G[F.weak]}이 비어 있는 자리가 평생 과제예요.`, `셋째, ${T.FILL_ACTION[F.pick]}`)],
  ];
  A.work = [
    ['나는 조직형인가요, 독립형인가요?', F => sen(F.g['관성'] >= F.g['비겁'] + F.g['식상'] ? '조직형이에요. 틀 안에서 힘이 나요.' : '독립형이에요. 내 방식으로 할 때 힘이 나요.', LT.WORK_TYPE[F.top[0]], LT.WORK_LEVEL.관성[lv(F, '관성')])],
    ['내 사주가 말하는 적성 1순위·2순위는?', F => sen(`1순위는 ${j(T.CAREER[F.top[0]], '이에요')}.`, `2순위는 ${j(T.CAREER[F.top[1]], '이에요')}.`, F.dm.work)],
    ['내가 직장에서 반복해서 겪는 갈등 패턴은?', F => sen(has(F, '상관') && F.g['관성'] ? '윗사람과 말로 부딪히는 패턴이에요.' : has(F, '겁재') ? '동료와 몫을 두고 부딪히는 패턴이에요.' : F.r.tenGods.some(t => t.group === '관성' && F.clashedPos.has(t.at.split(' ')[0])) ? '상사나 부서가 자주 바뀌는 패턴이에요.' : '규칙과 자율 사이에서 부딪히는 패턴이에요.', LT.WORK_REL[F.dayG].body, LT.WORK_REL[F.dayG].instead.replace(/\. [\s\S]*$/, '.'))],
    ['내가 직장에서 인정받는 지점과 묻히는 지점은?', F => sen(`인정받는 지점은 ${T.WORK_STYLE[F.strong].replace('에서 성과가 나요.', '')}예요.`, `묻히는 지점은 ${j(G[F.weak], '이')} 비어 있는 자리예요.`, LT.WORK_LEVEL.식상[lv(F, '식상')])],
    ['지금 회사가 내 명식과 맞나요?', F => sen(`맞는 환경은 ${j(EP[F.elemOf(F.pick)], '이')} 많은 곳, ${ELEM_ENV[F.elemOf(F.pick)]}이에요.`, `틀로 보면 ${G[F.monthTG.group]} 주제의 무대가 맞아요.`, '지금 회사가 이 안이면 자리를 바꿀 이유는 적어요.')],
    ['올해 이직해도 되나요?', F => { const ok = (F.y1.tenGod.group === '관성' || F.y1.branchTenGod.group === '관성' || F.y1.branchTenGod.group === '식상') && !F.yClash; return sen(ok ? `${F.nextY}년은 움직여도 되는 해예요.` : F.yClash ? `${F.nextY}년은 내 ${POSK2[F.yClash.name]}와 부딪혀 순서가 중요한 해예요.` : `${F.nextY}년은 준비하고 기록을 만드는 해예요.`, `움직인다면 ${F.ml(F.monthsWith('관성').concat(F.push))}에 하세요.`, '제안은 서면으로 받아 비교한 뒤 답하세요.'); }],
    ['올해 이직에 좋은 달과 피해야 할 달은?', F => sen(`좋은 달은 ${j(F.ml(F.monthsWith('관성').concat(F.push)), '이에요')}.`, `피할 달은 ${j(F.ml(F.caution), '이에요')}.`, '면접은 좋은 달에, 사직서는 피할 달을 빼고 내세요.')],
    ['이직할 때 내가 피해야 할 회사 유형은?', F => sen(`${j(EP[F.elemOf(F.gisin)], '이')} 몰리는 곳, ${ELEM_ENV[F.elemOf(F.gisin)]}만 시키는 회사예요.`, LT.WORK_LEAK[['관성', '식상', '비겁'].find(k => lv(F, k) === '부족') || 'none'].avoid.replace(/지 마세요$/, '는 것도 피하세요.'), '회사 유형보다 상사 한 명이 더 중요해요.')],
    ['이직할 때 내가 찾아야 할 회사 조건은?', F => sen(`${j(EP[F.elemOf(F.pick)], '이')} 많은 곳, ${ELEM_ENV[F.elemOf(F.pick)]}이 있는 회사예요.`, T.WORK_STYLE[F.strong], LT.WORK_REL[F.dayG].body)],
    ['지금 10년(대운)은 커리어에서 어떤 시기인가요?', F => sen(F.cur ? `${F.cur.fromAge}~${F.cur.toAge}세, ${LT.WORK_DECADE[F.curG].body[0]}` : '아직 첫 10년 계절 전이에요.', LT.WORK_DECADE[F.curG].body[1], LT.WORK_DECADE[F.curG].instead.replace(/\. [\s\S]*$/, '.'))],
    ['승진·평가 운이 들어오는 시기는?', F => { const d = F.dec('관성'); const yh = [F.y0, F.y1].filter(y => y.tenGod.group === '관성' || y.branchTenGod.group === '관성'); return sen(d.length ? `직책 운이 드는 10년은 ${F.ages(d)}예요.` : '직책 운이 드는 10년이 뚜렷하지 않아요.', yh.length ? `${yh.map(y => y.year + '년').join('과 ')}에 평가·직책이 걸려요.` : `${F.nowY}년과 ${F.nextY}년은 직책보다 기록의 해예요.`, `${F.nextY}년 평가가 걸리는 달은 ${F.ml(F.monthsWith('관성'))}이에요.`); }],
    ['내가 상사와 부딪히는 이유는 뭔가요?', F => sen(has(F, '상관') && F.g['관성'] ? '톡 쏘는 표현이 규칙과 부딪혀요.' : lv(F, '관성') === '부족' ? '나를 누르는 힘이 작아 지시 자체가 불편해요.' : lv(F, '비겁') === '과다' ? '나 자신의 힘이 커서 주도권을 두고 부딪혀요.' : '기준이 다를 때 먼저 맞추지 않아서예요.', LT.WORK_REL[F.dayG].avoid.replace(/지 마세요$/, '는 게 반복되는 자리예요.'), LT.WORK_REL[F.dayG].instead.replace(/\. [\s\S]*$/, '.'))],
    ['내가 부하·후배를 다룰 때 약한 지점은?', F => sen(lv(F, '식상') === '부족' ? '설명과 칭찬이 적어 후배가 눈치를 봐요.' : lv(F, '식상') === '과다' ? '말이 많아 지시가 흐려져요.' : '후배에게 맡기고 기다리는 게 약해요.', F.r.hour ? `후배 자리인 시주에 ${j(G[F.hourTG.group], '이')} 있어요.` : '시각이 없어 후배 자리는 직접 못 봐요.', '지시는 한 장, 피드백은 한 문장으로 하세요.')],
    ['창업과 이직 중 내 명식은 어느 쪽인가요?', F => sen(F.g['식상'] + F.g['재성'] > F.g['관성'] ? '창업 쪽에 가까워요.' : '이직 쪽, 조직 안에서 자리를 바꾸는 게 맞아요.', LT.MONEY_PATH[F.top[0]], LT.PATH_PAIR[F.top[0]].instead.replace(/\. [\s\S]*$/, '.'))],
    ['지금 쉬어야 하나요, 움직여야 하나요?', F => sen(lv(F, '인성') === '부족' || F.edge || F.yClash ? '지금은 쉬면서 준비하는 쪽이에요.' : '움직여도 되는 자리예요.', F.edge ? '10년 계절이 바뀌는 경계라 큰 결정은 첫해를 지나 보고 해요.' : lv(F, '인성') === '부족' ? '회복 통로가 작아 지친 채 움직이면 비싸게 남아요.' : `${F.nextY}년 ${F.ml(F.push)}이 움직이기 좋은 달이에요.`, '쉬더라도 기록은 계속 만드세요.')],
    ['번아웃이 오는 구조적 이유가 있나요?', F => sen(lv(F, '인성') === '부족' ? '쉬고 기대는 통로가 비어 멈추지 못해요.' : F.st.label === '신약' ? '힘보다 짐이 많아 소모가 빨라요.' : F.excess.length ? `${j(EP[F.excess[0]], '이')} 넘쳐 과열돼요.` : '구조보다 일의 양이 문제예요.', T.BODY_SIGNAL[F.e], T.PRESC.인성.fill.instead.replace(/\. [\s\S]*$/, '.'))],
    ['프리랜서·1인 사업이 내게 맞나요?', F => sen(F.g['비겁'] + F.g['식상'] > F.g['관성'] + 1 ? '맞아요. 혼자 결정하고 책임지는 구조가 편해요.' : lv(F, '관성') === '부족' ? '틀이 작아 자유롭지만 마감은 밖에 걸어야 해요.' : '조직의 울타리가 있을 때 더 멀리 가는 명식이에요.', LT.WORK_TYPE[F.top[0]], '시작한다면 고객 한 명과 계약서 한 장부터예요.')],
    ['전공·경력과 다른 분야로 가도 되나요?', F => sen(`가도 되는 방향은 ${G[F.pick]} 쪽, ${j(T.CAREER_S[F.pick], '이에요')}.`, `${ELEM_ENV[F.lacking[0] || F.lowE]} 쪽은 적응 비용이 커요.`, '옮긴다면 부업으로 석 달 시험한 뒤 가세요.')],
    ['올해 직장에서 절대 하면 안 되는 행동은?', F => { const y = F.yClash ? LT.WORK_YEAR.clash : LT.WORK_YEAR[F.y1.branchTenGod.group]; return sen(`${F.nextY}년엔 ${y.avoid.replace(/지 마세요$/, '는 것이에요')}.`, y.line, y.instead.replace(/\{good\}/g, F.good[0] ? F.good[0].label : '좋은 달').replace(/\. [\s\S]*$/, '.')); }],
    ['커리어에서 내가 가장 빛나는 10년은 언제인가요?', F => { const best = F.dec('관성').concat(F.dec('식상')); return sen(best.length ? `${F.ages(best)}예요.` : '뚜렷한 10년이 없어 꾸준함이 무기예요.', '직책이나 결과물이 움직이는 계절이에요.', F.cur ? `지금은 ${F.cur.fromAge}~${F.cur.toAge}세, ${LT.WORK_DECADE[F.curG].body[0]}` : ''); }],
  ];

  /** 다른 캐릭터가 이 명식에서 볼 한 줄(교차 추천). */
  const HOOK = {
    flame: F => F.spouseN ? `짝 기운이 ${[...new Set(F.spousePos)].map(p => POSK[p]).join('·')} 자리에 있어요. 인연이 움직이는 달은 ${F.ml(F.spouseMonths)}.` : `짝 기운이 드러나 있지 않아 인연은 운에서 와요. ${F.nextY}년 움직이는 달은 ${F.ml(F.spouseMonths)}.`,
    sage: F => { const leak = F.lvG['비겁'] === '과다' ? '동업·보증' : F.lvG['재성'] === '부족' ? '가격 없이 시작하는 일' : F.lvG['관성'] === '부족' ? '울타리 없는 지출' : '지출 습관'; return `돈이 새는 자리는 ${leak}이에요. 거래하기 좋은 달은 ${F.ml(F.monthsWith('재성'))}.`; },
    hunter: F => { const q = [1, 2, 3, 4].map(n => ({ n, score: F.cal.filter(x => Math.ceil(x.solarMonth / 3) === n && x.yearLabel === F.nextY).reduce((a, x) => a + (x.grade === '추진' ? 1 : x.grade === '주의' ? -3 : 0), 0) })).sort((a, b) => b.score - a.score)[0]; return `${F.nextY}년 이직 적기는 ${q.n}분기예요. 시장이 보는 유형은 ${LT.WORK_TYPE[F.top[0]].replace('로 보여요.', '')}.`; },
    granny: F => `${F.nextY}년 멈출 달은 ${F.ml(F.caution)}, 밀어붙일 달은 ${F.ml(F.push)}. 가족 자리와 몸도 같이 봐요.`,
    child: F => '아이 사주는 초롱 동자가 봐요. 아이 생일과 부모 생일을 같이 넣으면 부모-자녀 조합까지 나와요.',
    master: F => `전체를 한 번에: ${F.st.label}, 용신은 ${G[F.pick]}, 격은 ${F.gyeok}. 신살·공망·지장간까지 정통으로 봐요.`,
    mbti: F => `타고난 결로 보면 ${F.est ? F.est.letters : M.estimate(F.r).letters} 쪽이에요. 검사 결과와 맞대면 피곤한 축이 보여요.`,
  };
  function hooks(F, exceptId) { return Object.keys(HOOK).filter(id => id !== exceptId).map(id => ({ id, text: HOOK[id](F) })); }
  function questionTitle(domain, n, F) {
    const year = domain === 'master' && n === 21 ? F.nowY : domain === 'love' && n === 9 ? `${F.nowY}~${F.nextY}` : F.nextY;
    return A[domain][n - 1][0].replace(/올해/g, `${year}년`);
  }
  /** 영역의 질문 목록(잠금 여부 포함). */
  function list(domain, F) {
    return (A[domain] || []).map((it, i) => { const need = it[2]; let locked = null; if (need === 'partner' && !F.compat) locked = '상대 생년월일을 넣으면 열려요'; if (need === 'parent' && !F.parent) locked = '부모 생년월일을 넣으면 열려요'; if (need === 'mbti' && !F.est) locked = '검사 MBTI를 넣으면 열려요'; if (domain === 'mbti' && [5, 6].includes(i + 1) && (!F.adv || !F.adv.goal)) locked = '추구하는 MBTI를 넣으면 열려요'; return { id: `${domain}-${String(i + 1).padStart(2, '0')}`, n: i + 1, q: questionTitle(domain, i + 1, F), locked, star: /^★/.test(it[0]) }; });
  }
  function answer(domain, n, F) {
    const it = A[domain][n - 1]; if (!it) return null;
    try { const text = it[1](F); return { id: `${domain}-${String(n).padStart(2, '0')}`, n, q: questionTitle(domain, n, F), text: String(text || '').replace(/\s+/g, ' ').trim() }; } catch (e) { return { id: `${domain}-${String(n).padStart(2, '0')}`, n, q: questionTitle(domain, n, F), text: '이 질문은 입력이 더 필요해요.', error: String(e && e.message) }; }
  }
  /** 고민(대화 첫 선택지) → 먼저 골라 둘 핵심 질문 3~5개. 잠긴 질문은 빼고, 3개가 안 되면 추천 순서로 채운다. */
  const CORE = {
    love: { reunion: [19, 11, 4, 7, 20], new: [9, 10, 6, 3, 17], match: [19, 20, 11, 6, 7], _: [1, 3, 6, 9, 10] },
    money: { business: [3, 13, 12, 14, 4], invest: [10, 2, 9, 8, 17], save: [11, 2, 1, 7, 20], pair: [4, 15, 16, 14, 9], biz: [4, 15, 16, 14, 9], friend: [15, 16, 4, 9, 2], _: [20, 2, 1, 7, 6] },
    child: { temper: [1, 2, 3, 5, 4], discipline: [2, 3, 5, 6, 4], next: [11, 12, 10, 1, 9], _: [1, 2, 9, 11, 3] },
    mbti: { gap: [2, 3, 1, 18, 7], goal: [5, 6, 20, 14, 1], who: [1, 7, 8, 9, 10], _: [1, 2, 3, 5, 6] },
    master: { all: [3, 5, 4, 18, 30], why: [28, 6, 8, 14, 18], who: [1, 2, 4, 14, 29], year: [21, 22, 18, 28, 23], family: [24, 25, 8, 22, 26], next: [22, 23, 21, 19, 20], _: [1, 3, 5, 18, 30] },
    work: { move: [6, 7, 5, 9, 8], promo: [11, 4, 12, 10, 19], burnout: [16, 15, 1, 3, 17], _: [1, 2, 6, 7, 3] },
  };
  function core(domain, concern, F) {
    const open = list(domain, F).filter(x => !x.locked); const byN = n => open.find(x => x.n === n);
    const tbl = CORE[domain] || {}; const ns = tbl[concern] || tbl._ || [];
    const ids = ns.map(byN).filter(Boolean).map(x => x.id);
    if (ids.length < 3) recommend(domain, F, 10).forEach(id => { if (ids.length < 3 && !ids.includes(id)) ids.push(id); });
    return ids.slice(0, 5);
  }
  function recommend(domain, F, k) { const open = list(domain, F).filter(x => !x.locked); const pri = { love: [1, 3, 4, 6, 9, 10, 11, 16, 18, 8], money: [20, 2, 1, 7, 8, 9, 4, 16, 6, 19], child: [1, 2, 9, 11, 3, 5, 6, 12, 15, 16], mbti: [1, 2, 3, 5, 6, 7, 10, 13, 19, 20], master: [1, 3, 5, 8, 9, 14, 17, 18, 23, 30], work: [1, 2, 6, 7, 3, 12, 10, 19, 14, 20] }[domain] || []; const ids = pri.map(n => open.find(x => x.n === n)).filter(Boolean).map(x => x.id); open.forEach(x => { if (ids.length < (k || 10) && !ids.includes(x.id)) ids.push(x.id); }); return ids.slice(0, k || 10); }
  return { DOMAIN_KO, PERSONA_DOMAIN, PERSONA_DOMAIN_KO, BANK: A, facts, list, answer, recommend, core, CORE, hooks };
});
