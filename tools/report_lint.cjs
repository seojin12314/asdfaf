// 리포트 합격 기준 자동 검사: 여러 명식 × 캐릭터 × MBTI 조합으로 report2.build → lint.
// 사용: node tools/report_lint.cjs [N=120] [--show]   (실패가 하나라도 있으면 종료 코드 1)
const path = require('path');
const dir = path.join(__dirname, '..', 'mvp', 'saju');
global.self = global; require(path.join(dir, 'personas.js')); const P = global.SajuPersonas;
const S = require(path.join(dir, 'saju.js')), M = require(path.join(dir, 'mbti.js')), R2 = require(path.join(dir, 'report2.js')), CP = require(path.join(dir, 'compat.js'));
const N = +(process.argv[2] || 120); const show = process.argv.includes('--show');
let seed = 20261030; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const TYPES = ['INFJ', 'ENFP', 'ISTJ', 'ESTP', 'INTP', 'ENTJ', 'ISFP', 'ESFJ'];
const ids = Object.keys(P.personas).concat(['mbti']);
const fails = []; let n = 0; const byRule = {}; let maxChars = 0, sumChars = 0;
const fixed = [{ year: 1991, month: 7, day: 18, hour: 17, minute: 10, gender: 'M' }, { year: 1991, month: 11, day: 3, hour: 6, minute: 20, gender: 'F' }, { year: 1988, month: 12, day: 26, hour: 23, minute: 30, gender: 'F' }, { year: 2001, month: 2, day: 4, hour: 0, minute: 30, gender: 'F' }, { year: 1975, month: 8, day: 8, hourUnknown: true, gender: 'F' }];
for (let i = 0; i < N; i++) {
  const inp = i < fixed.length ? fixed[i] : { year: 1960 + Math.floor(rnd() * 55), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28), hour: Math.floor(rnd() * 24), minute: Math.floor(rnd() * 60), gender: rnd() < 0.6 ? 'F' : 'M', hourUnknown: rnd() < 0.15 };
  const r = S.compute(Object.assign({ solarCorrectionMin: -30 }, inp));
  const pid = ids[i % ids.length];
  let rep;
  try {
    if (pid === 'mbti') { const est = M.estimate(r); const t = TYPES[i % TYPES.length], gl = rnd() < 0.7 ? TYPES[(i + 3) % TYPES.length] : null; const cmp = M.compare(t, est); const adv = M.advise(est, t, gl); rep = R2.build(r, { kind: 'mbti', name: ['지민', '김서연', '테스트유저'][i % 3], est, cmp, adv }); }
    else {
      let compat = null;
      if (i % 4 === 0 && ['flame', 'sage', 'hunter', 'master'].includes(pid)) { const pr = S.compute({ year: 1965 + Math.floor(rnd() * 45), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28), hour: 12, hourUnknown: true, gender: rnd() < 0.5 ? 'F' : 'M' }); compat = CP.analyze(r, pr, { kind: pid === 'flame' ? 'love' : (i % 8 === 0 ? 'friend' : 'biz'), nameA: ['지민', '김서연', '테스트유저'][i % 3], nameB: pid === 'flame' ? '그 사람' : '동업자' }); }
      rep = R2.build(r, { persona: P.personas[pid], name: ['지민', '김서연', '테스트유저'][i % 3], compat });
    }
  } catch (e) { fails.push({ i, pid, inp, problems: [{ rule: 'crash', msg: e.stack.split('\n').slice(0, 3).join(' | ') }] }); continue; }
  n++; maxChars = Math.max(maxChars, rep.chars); sumChars += rep.chars;
  const pr = R2.lint(rep);
  if (pr.length) { fails.push({ i, pid, inp, problems: pr }); pr.forEach(p => { byRule[p.rule] = (byRule[p.rule] || 0) + 1; }); }
}
console.log(`built ${n}/${N} · chars avg ${Math.round(sumChars / Math.max(1, n))} max ${maxChars} · failing reports ${fails.length}`);
if (Object.keys(byRule).length) console.log('by rule:', byRule);
if (fails.length) { const lim = show ? fails.length : 6; fails.slice(0, lim).forEach(f => { console.log(`\n#${f.i} ${f.pid} ${JSON.stringify(f.inp)}`); f.problems.slice(0, show ? 50 : 8).forEach(p => console.log(`  [${p.rule}] ${p.msg}`)); }); process.exit(1); }
