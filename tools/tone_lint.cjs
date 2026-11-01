// 캐릭터 말투 일관성 검사: vn-scripts.js · personas.js 의 캐릭터별 문자열에서 문장 어미를 분류해 기대 말투와 다른 문장을 보고한다.
// 사용: node tools/tone_lint.cjs [--all]
const fs = require('fs'), path = require('path'); const dir = path.join(__dirname, '..', 'mvp', 'saju');
const EXPECT = { flame: 'banmal', sage: 'hage', granny: 'banmal', hunter: 'hamnida', master: 'haeyo', mbti: 'haeyo' };
const KO = { banmal: '반말', hage: '하게/느니라', haeyo: '해요체', hamnida: '합니다체' };
function classify(s) {
  const t = s.replace(/["'”’)\]…!?.\s]+$/g, '').trim(); if (!t) return null;
  if (/(니다|십시오|니까)$/.test(t) && !/아니다$/.test(t)) return 'hamnida';
  if (/(인지|한지|는지|ㄹ지|할지|을지|일지)$/.test(t)) return null;
  if (!/[.!?…]$/.test(s.trim()) && t.length < 16) return null;
  if (/(요|죠)$/.test(t)) return 'haeyo';
  if (/(느니라|니라|거라|하마|보마|주마|구나|로구나|게다|느냐|더냐|네|세)$/.test(t)) return 'hage';
  if (/(야|어|아|지|니|래|해|봐|줘|거든|잖아|다|라|자|까|게|걸|데|고|든|군|네|냐|뭐|데|뿐)$/.test(t)) return 'banmal';
  return null;
}
function strings(src) { src = src.replace(/(label|keep|fresh|sheet|again|yes|no|ok|who|placeholder): '[^']*'/g, '').replace(/sees: \[[^\]]*\]/g, ''); const out = []; const re = /'((?:\\.|[^'\\])*)'|`((?:\\.|[^`\\])*)`/g; let m; while ((m = re.exec(src))) { const v = m[1] != null ? m[1] : m[2]; if (v && /[가-힣]/.test(v) && v.length > 6) out.push(v); } return out; }
function sentences(v) { return v.replace(/\$\{[^}]*\}/g, '○').split(/(?<=[.!?…])\s+|\n/).map(x => x.trim()).filter(x => x.length > 4); }
const vn = fs.readFileSync(path.join(dir, 'vn-scripts.js'), 'utf8'), pe = fs.readFileSync(path.join(dir, 'personas.js'), 'utf8');
function block(src, startRe, endRe) { const i = src.search(startRe); if (i < 0) return ''; const rest = src.slice(i + 1); const k = rest.search(endRe); return rest.slice(0, k < 0 ? undefined : k); }
const IDS = ['flame', 'sage', 'granny', 'hunter', 'master', 'mbti'];
let total = 0, bad = 0; const report = [];
IDS.forEach((id, i) => {
  const next = IDS[i + 1];
  const vb = block(vn, new RegExp(`\\n    ${id}: \\{`), next ? new RegExp(`\\n    ${next}: \\{`) : /\n  \};\n  \/\/ ───── 궁합/);
  const pb = id === 'mbti' ? '' : block(pe, new RegExp(`id: '${id}'`), next && next !== 'mbti' ? new RegExp(`id: '${next}'`) : /\n  \};/);
  const exp = EXPECT[id]; const seen = new Set();
  [vb, pb].forEach((src, si) => strings(src).forEach(v => sentences(v).forEach(s => { total++; const c = classify(s); if (c && c !== exp && !(exp === 'banmal' && c === 'hage') && !(exp === 'hage' && c === 'banmal')) { const k = s.slice(0, 60); if (!seen.has(k)) { seen.add(k); bad++; report.push(`[${id} ${si ? 'personas' : 'vn'}] 기대 ${KO[exp]} / 실제 ${KO[c]}: ${k}`); } } })));
});
console.log(`sentences ${total} · mismatched ${bad}`);
report.slice(0, process.argv.includes('--all') ? 1000 : 80).forEach(l => console.log(l));
