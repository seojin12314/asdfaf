// 고정 대사 추출: 캐릭터별 정적 문자열(이름·명식에 따라 바뀌지 않는 대사)만 모아 work/voice-lines.json 생성
global.self = global; self.Saju = require('../mvp/saju/saju.js'); require('../mvp/saju/personas.js'); self.SajuReport = require('../mvp/saju/report.js'); self.SajuMBTI = require('../mvp/saju/mbti.js'); require('../mvp/saju/vn-scripts.js');
const M = self.SajuMBTI;
const S = self.Saju, P = self.SajuPersonas, SC = self.SajuVNScripts;
const charts = [
  { name: 'A', year: 1991, month: 11, day: 3, hour: 6, minute: 20, hourUnknown: false, gender: 'F', solarCorrectionMin: -30 },
  { name: 'B', year: 1988, month: 2, day: 4, hour: 12, minute: 0, hourUnknown: true, gender: 'M', solarCorrectionMin: -30 },
  { name: 'C', year: 2019, month: 7, day: 15, hour: 23, minute: 30, hourUnknown: false, gender: 'M', solarCorrectionMin: -30 },
].map(i => S.compute(i));
const out = []; const seen = new Set();
const add = (id, key, t) => { if (!t || /\{/.test(t)) return; const k = id + '|' + t; if (seen.has(k)) return; seen.add(k); out.push({ id, key, text: t }); };
for (const id of ['flame', 'sage', 'granny', 'child', 'hunter', 'mbti']) {
  const sc = SC.SCRIPTS[id], p = P.personas[id] || sc.persona;
  sc.intro.forEach((l, i) => add(id, 'intro' + i, l.t));
  add(id, 'concern', sc.concern.prompt);
  sc.concern.options.forEach(o => o.reply.forEach((l, i) => add(id, 'reply-' + o.value + i, l.t)));
  sc.ask.lead.forEach((l, i) => add(id, 'lead' + i, l.t));
  ['name', 'gender', 'date', 'time'].forEach(k => add(id, 'ask-' + k, sc.ask[k]));
  add(id, 'reuse', sc.ask.reuse.prompt);
  if (sc.ask.partner) ['prompt', 'gender', 'date', 'got', 'skip'].forEach(k => add(id, 'partner-' + k, sc.ask.partner[k]));
  if (sc.ask.mbti) add(id, 'ask-mbti', sc.ask.mbti);
  if (sc.ask.goal) ['prompt', 'pick', 'got', 'skip'].forEach(k => add(id, 'goal-' + k, sc.ask.goal[k]));
  sc.ask.done.forEach((l, i) => add(id, 'done' + i, l.t));
  sc.summon.forEach((l, i) => add(id, 'summon' + i, l.t));
  sc.ending.lines.forEach((l, i) => add(id, 'ending' + i, l.t)); add(id, 'ending-prompt', sc.ending.prompt);
  // 명식과 무관하게 항상 같은 분석 대사만(3개 명식에서 동일한 문장)
  for (const o of sc.concern.options) {
    const runs = charts.map(r => { const c = { name: '당신', r, p, pr: null, concern: o.value, dayKo: r.day.stemKo + r.dayMaster.elementKo, className: P.classNames[r.day.stem], strong: r.strongestGroup, weak: r.weakestGroup, seunNext: r.seun[1].year, year: r.seun[0].year }; if (sc.mbti) { c.est = M.estimate(r); c.cmp = M.compare('INFJ', c.est); c.adv = M.advise(c.est, 'INFJ', 'ENTJ'); } return sc.beats(c).map(b => b.t); });
    runs[0].forEach(t => { if (runs.every(rr => rr.includes(t))) add(id, 'beat-' + o.value, t); });
  }
}
require('fs').writeFileSync('work/voice-lines.json', JSON.stringify(out, null, 1));
const per = {}; out.forEach(l => { per[l.id] = (per[l.id] || 0) + 1; });
console.log('lines', out.length, per, 'chars', out.reduce((a, l) => a + l.text.length, 0));
