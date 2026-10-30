// 질문 은행 답변 검사: 여러 명식 × 6영역 전 문항. 문장 40자 · 해요체 · undefined/빈 답 · 괄호 중첩 · (정통 제외) 전문용어.
// 사용: node tools/qa_lint.cjs [N=80] [--show]
const path = require('path'); const dir = path.join(__dirname, '..', 'mvp', 'saju');
global.self = global; require(path.join(dir, 'personas.js'));
const S = require(path.join(dir, 'saju.js')), M = require(path.join(dir, 'mbti.js')), R2 = require(path.join(dir, 'report2.js')), CP = require(path.join(dir, 'compat.js')), Q = require(path.join(dir, 'questions.js'));
const N = +(process.argv[2] || 80); const show = process.argv.includes('--show');
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const TYPES = ['INFJ', 'ENFP', 'ISTJ', 'ESTP', 'INTP', 'ENTJ', 'ISFP', 'ESFJ'];
const JARGON = R2.JARGON; const probs = []; let n = 0; const byRule = {};
const push = (rule, msg, ctx) => { probs.push({ rule, msg, ctx }); byRule[rule] = (byRule[rule] || 0) + 1; };
for (let i = 0; i < N; i++) {
  const inp = { year: 1960 + Math.floor(rnd() * 50), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28), hour: Math.floor(rnd() * 24), minute: Math.floor(rnd() * 60), gender: rnd() < 0.6 ? 'F' : 'M', hourUnknown: rnd() < 0.15, solarCorrectionMin: -30 };
  const r = S.compute(inp); const pr = S.compute({ year: 1965 + Math.floor(rnd() * 40), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28), hour: 12, hourUnknown: true, gender: rnd() < 0.5 ? 'F' : 'M' });
  const parent = S.compute({ year: 1960 + Math.floor(rnd() * 25), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28), hour: Math.floor(rnd() * 24), gender: rnd() < 0.5 ? 'F' : 'M' });
  const est = M.estimate(r), t = TYPES[i % 8], cmp = M.compare(t, est), adv = i % 3 ? M.advise(est, t, TYPES[(i + 3) % 8]) : null;
  const name = ['지민', '김서연', '테스트유저', '나'][i % 4];
  for (const domain of Object.keys(Q.BANK)) {
    const compat = domain === 'love' ? CP.analyze(r, pr, { kind: 'love', nameA: name, nameB: '그 사람' }) : null;
    const F = Q.facts(r, { name, compat, compatPr: pr, parent: domain === 'child' ? parent : null, est, cmp, adv });
    Q.list(domain, F).forEach(item => {
      if (item.locked) return; const a = Q.answer(domain, item.n, F); n++; const ctx = `${domain}-${item.n} ${name}`;
      if (!a.text || a.error) push('crash', a.error || 'empty', ctx);
      if (/undefined|null|NaN|\[object/.test(a.text)) push('undefined', a.text.slice(0, 60), ctx);
      if (/습니다|십시오|입니다|합니다/.test(a.text)) push('tone', a.text.slice(0, 60), ctx);
      if (/\)\(|\([^)]*\(/.test(a.text)) push('paren', a.text.slice(0, 60), ctx);
      if (/\((는|가|를|와|이|은|을|과)\)/.test(a.text)) push('josa', a.text.slice(0, 60), ctx);
      const sents = R2.sentences(a.text); if (sents.length > 4) push('sentences', `${sents.length}문장 ${a.text.slice(0, 40)}`, ctx);
      const LIM = domain === 'master' ? 48 : 40; sents.forEach(s => { if (s.length > LIM) push('length', `${s.length}자: ${s}`, ctx); });
      if (domain !== 'master' && JARGON.test(a.text)) push('jargon', (a.text.match(new RegExp(`[^.]*${(a.text.match(JARGON) || [''])[0]}[^.]*`)) || [''])[0].slice(0, 60), ctx);
      if (domain !== 'master' && /[一-龥]/.test(a.text)) push('hanja', a.text.slice(0, 60), ctx);
    });
  }
}
console.log(`answers ${n} · problems ${probs.length}`, byRule);
const seen = new Set(); probs.filter(p => { const k = p.rule + '|' + p.msg; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, show ? 400 : 40).forEach(p => console.log(`[${p.rule}] ${p.ctx}: ${p.msg}`));
process.exit(probs.length ? 1 : 0);
