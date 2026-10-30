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
