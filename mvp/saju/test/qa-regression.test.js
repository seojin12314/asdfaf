const assert = require('node:assert/strict');
const test = require('node:test');
const S = require('../saju.js');
const M = require('../mbti.js');
const Q = require('../questions.js');
const R2 = require('../report2.js');
const P = require('../personas.js').SajuPersonas;
const base = { year: 1991, month: 7, day: 18, hour: 17, minute: 10, gender: 'M', solarCorrectionMin: -30, now: '2026-10-30T03:00:00Z' };
const r = S.compute(base), est = M.estimate(r);
const facts = Q.facts(r, { est, cmp: M.compare('INFJ', est) });

test('reject impossible calendar dates instead of silently rolling them forward', () => {
  for (const date of [{month:2,day:30},{month:13},{year:1899},{year:2031},{day:0}]) {
    assert.throws(() => S.compute({...base,...date}));
  }
  assert.doesNotThrow(() => S.compute({...base,year:2000,month:2,day:29}));
});
test('reject invalid clock values and nonfinite corrections', () => {
  for (const change of [{hour:24},{hour:-1},{hour:NaN},{minute:60},{minute:-1},{solarCorrectionMin:Infinity}]) {
    assert.throws(() => S.compute({...base,...change}));
  }
});
test('17:10 boundary is explicit: -30 minutes changes the hour pillar', () => {
  assert.equal(r.hour.hanja,'壬申');
  assert.equal(S.compute({...base,solarCorrectionMin:0}).hour.hanja,'癸酉');
  assert.equal(S.compute({...base,hourUnknown:true}).hour,null);
});
test('missing desired MBTI locks its questions and excludes them from paid recommendations', () => {
  const questions = Q.list('mbti',facts);
  for(const n of [5,6]) assert.ok(questions.find(q=>q.n===n).locked);
  assert.ok(!Q.recommend('mbti',facts,10).some(id=>['mbti-05','mbti-06'].includes(id)));
  const complete=Q.facts(r,{est,cmp:M.compare('INFJ',est),adv:M.advise(est,'INFJ','ENTJ')});
  for(const n of [5,6]) assert.equal(Q.list('mbti',complete).find(q=>q.n===n).locked,null);
});
test('MBTI question answers agree with displayed S/T/J axes', () => {
  assert.equal(est.letters,'ESTJ');
  assert.match(Q.answer('mbti',8,facts).text,/실행형/);
  assert.match(Q.answer('mbti',9,facts).text,/기준을 먼저/);
  assert.match(Q.answer('mbti',10,facts).text,/계획 안/);
});
test('money leakage answer does not erase a documented partnership risk', () => {
  const answer=Q.answer('money',11,facts).text;
  assert.doesNotMatch(answer,/새는 자리는 작|큰 구멍은 없/);
  assert.match(answer,/동업|공동|몫/);
});
test('business timing includes a currently active suitable decade', () => {
  assert.match(Q.answer('money',13,facts).text,/34~43세/);
});
test('question titles explicitly name the year used by their answers', () => {
  assert.match(Q.list('money',facts).find(q=>q.n===7).q,/2027년/);
  assert.match(Q.answer('money',7,facts).q,/2027년/);
  assert.match(Q.list('master',facts).find(q=>q.n===21).q,/2026년/);
});
test('January at the end of a solar-term year belongs to the next calendar year', () => {
  const rep=R2.build(r,{persona:P.personas.sage,name:'테스트'});
  const jan=rep.L1.calendar.find(c=>c.solarMonth===1);
  assert.equal(jan.yearLabel,2028);
  assert.match(rep.L1.trio.find(t=>t.src==='month').avoid,/2028년 1월/);
});
test('all question banks render without error for complete and incomplete inputs', () => {
  for(const input of [base,{...base,hourUnknown:true},{...base,year:2000,month:2,day:29,gender:'F'}]) {
    const chart=S.compute(input), e=M.estimate(chart);
    const f=Q.facts(chart,{est:e,cmp:M.compare('INFJ',e)});
    for(const domain of Object.keys(Q.BANK)) for(const q of Q.list(domain,f).filter(q=>!q.locked)) {
      const a=Q.answer(domain,q.n,f);
      assert.ok(!a.error,`${domain}/${q.n}: ${a.error}`);
      assert.ok(a.text && !/undefined|NaN/.test(a.text),`${domain}/${q.n}: ${a.text}`);
    }
  }
});

test('granny(삼신할머니) bank: child-fortune answers render for M/F, with and without hour', () => {
  for (const input of [base, { ...base, gender: 'F' }, { ...base, hourUnknown: true }, { ...base, year: 2000, month: 2, day: 29, gender: 'F' }]) {
    const chart = S.compute(input), f = Q.facts(chart, {});
    const cl = Q.childLuck(f); assert.match(cl.est, /명/); assert.equal(cl.grp, input.gender === 'M' ? '관성' : '식상');
    assert.equal(Q.recommend('granny', f, 5).length, 5);
    for (const q of Q.list('granny', f)) { const a = Q.answer('granny', q.n, f); assert.ok(!a.error && a.text && !/undefined|NaN/.test(a.text), `${q.n}: ${a.error || a.text}`); }
    if (input.hourUnknown) assert.match(Q.answer('granny', 4, f).text, /시각을 몰라/);
  }
  assert.equal(Q.childLuck(r).grp, '관성'); // 명식(r)만 넘겨도 된다(미연시 대본용)
  assert.match(Q.list('granny', facts).find(q => q.n === 11).q, /2026년/); // 올해 세운 문항은 올해 연도
});
test('child persona removed; granny owns the child-fortune domain and the child-mode bank', () => {
  assert.equal(P.personas.child, undefined); assert.equal(Q.PERSONA_DOMAIN.granny, 'granny'); assert.equal(Q.PERSONA_DOMAIN.child, undefined);
  assert.ok(Q.list('child', facts).length >= 14);
  const rep = R2.build(r, { persona: P.personas.granny, name: '테스트' }); assert.ok(rep.L2.some(s => s.id === 'baby'), 'granny report has 자녀복 section');
  const kid = R2.build(r, { persona: P.personas.granny, name: '아이', child: true }); assert.ok(kid.L2.some(s => /아이/.test(s.title)), 'child mode uses child tables'); assert.ok(!kid.L2.some(s => s.id === 'baby'));
  const rd = P.generateReading(r, P.personas.granny, { name: '아이', child: true }); assert.match(rd.lines[0], /아이/);
});

test('tone layer: report sentences take each character voice; master/mbti untouched', () => {
  const T = require('../tone.js');
  const s = ['자녀 인연은 1~2명으로 읽혀요.', '이 달엔 큰 계약을 하지 마세요.', '힘이 센 편이에요.', '자녀 글자 1개가 일터에 있어서요.', '나는 어떤 사람인가요?', '주요 원인은 피로예요.'];
  assert.deepEqual(s.map(x => T.text(x, 'flame')), ['자녀 인연은 1~2명으로 읽혀.', '이 달엔 큰 계약을 하지 마.', '힘이 센 편이야.', '자녀 글자 1개가 일터에 있어서.', '나는 어떤 사람인가?', '주요 원인은 피로야.']);
  assert.deepEqual(s.map(x => T.text(x, 'granny')), ['자녀 인연은 1~2명으로 읽혀.', '이 달엔 큰 계약을 하지 말렴.', '힘이 센 편이란다.', '자녀 글자 1개가 일터에 있어서.', '나는 어떤 사람인가?', '주요 원인은 피로란다.']);
  assert.deepEqual(s.map(x => T.text(x, 'sage')), ['자녀 인연은 1~2명으로 읽히네.', '이 달엔 큰 계약을 하지 말거라.', '힘이 센 편이다.', '자녀 글자 1개가 일터에 있기 때문이다.', '나는 어떤 사람인가?', '주요 원인은 피로다.']);
  assert.deepEqual(s.map(x => T.text(x, 'hunter')), ['자녀 인연은 1~2명으로 읽힙니다.', '이 달엔 큰 계약을 하지 마십시오.', '힘이 센 편입니다.', '자녀 글자 1개가 일터에 있기 때문입니다.', '나는 어떤 사람인가요?', '주요 원인은 피로입니다.']);
  for (const pid of ['master', 'mbti']) assert.deepEqual(s.map(x => T.text(x, pid)), s);
  // 리포트 전 문장이 변환 뒤 해요체로 남지 않는다(물음표 제외)
  const rep = R2.build(r, { persona: P.personas.sage, name: '테스트' }); const strs = [];
  rep.L2.forEach(x => strs.push(x.conclusion, ...x.body, x.avoid, x.instead)); rep.end.insteads.forEach(x => strs.push(x.text)); strs.push(...rep.end.closing);
  for (const x of strs.filter(Boolean)) for (const a of String(x).split(/(?<=[.!?])\s+/)) { const b = T.text(a, 'sage').replace(/[.!?…]+$/, ''); assert.ok(!/(요|죠)$/.test(b) || /\?$/.test(a), `sage left haeyo: ${a} → ${b}`); }
});
