// node mvp/saju/test/saju.test.js
const assert = require('assert');
const Saju = require('../saju.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('JDN 2000-01-01 = 2451545', () => assert.strictEqual(Saju.jdn(2000, 1, 1), 2451545));
t('일주 2000-01-01 = 戊午', () => assert.strictEqual(Saju.pillarFromIndex60((Saju.jdn(2000, 1, 1) + 49) % 60).hanja, '戊午'));
t('일주 1900-01-01 = 甲戌', () => assert.strictEqual(Saju.pillarFromIndex60((Saju.jdn(1900, 1, 1) + 49) % 60).hanja, '甲戌'));
t('년주 2026 = 丙午, 1984 = 甲子', () => { assert.strictEqual(Saju.yearPillarOf(2026).hanja, '丙午'); assert.strictEqual(Saju.yearPillarOf(1984).hanja, '甲子'); });
t('오호둔: 甲년 寅월 = 丙寅, 戊년 寅월 = 甲寅', () => { assert.strictEqual(Saju.monthStemIdx(0, 2), 2); assert.strictEqual(Saju.monthStemIdx(4, 2), 0); });
t('오자둔: 甲일 子시 = 甲, 乙일 丑시 = 丁, 癸일 子시 = 壬', () => { assert.strictEqual(Saju.hourStemIdx(0, 0), 0); assert.strictEqual(Saju.hourStemIdx(1, 1), 3); assert.strictEqual(Saju.hourStemIdx(9, 0), 8); });
t('시지: 23시·0시 = 子, 1시 = 丑, 12시 = 午', () => { assert.strictEqual(Saju.hourBranchIdx(23), 0); assert.strictEqual(Saju.hourBranchIdx(0), 0); assert.strictEqual(Saju.hourBranchIdx(1), 1); assert.strictEqual(Saju.hourBranchIdx(12), 6); });
t('월지: 황경 315→寅, 0→卯, 285→丑, 255→子', () => { assert.strictEqual(Saju.monthBranchFromLongitude(315), 2); assert.strictEqual(Saju.monthBranchFromLongitude(0), 3); assert.strictEqual(Saju.monthBranchFromLongitude(285), 1); assert.strictEqual(Saju.monthBranchFromLongitude(255), 0); });

t('황경: 춘분(3/20경) ≈ 0°, 동지(12/21경) ≈ 270°', () => {
  const lamEq = Saju.sunLongitude(Saju.jdFromMs(Date.UTC(2026, 2, 20, 14, 0)));
  const lamWs = Saju.sunLongitude(Saju.jdFromMs(Date.UTC(2025, 11, 21, 15, 0)));
  assert.ok(lamEq < 1 || lamEq > 359, 'equinox ' + lamEq);
  assert.ok(Math.abs(lamWs - 270) < 1, 'solstice ' + lamWs);
});

t('입춘(315°)은 2000~2030년 모두 2월 3~5일(KST)', () => {
  for (let y = 2000; y <= 2030; y++) {
    const approx = Saju.jdFromMs(Date.UTC(y, 1, 4));
    const jd = Saju.solarTermJd(315, approx);
    assert.ok(jd, 'no root ' + y);
    const kst = new Date(Saju.msFromJd(jd) + 9 * 3600000);
    assert.strictEqual(kst.getUTCMonth(), 1, 'month ' + y);
    assert.ok(kst.getUTCDate() >= 3 && kst.getUTCDate() <= 5, 'day ' + y + ' ' + kst.toISOString());
  }
});

t('2026-01-15 는 입춘 전 → 년주 乙巳, 월주 己丑', () => {
  const r = Saju.compute({ year: 2026, month: 1, day: 15, hour: 10, minute: 0, gender: 'M' });
  assert.strictEqual(r.year.hanja, '乙巳');
  assert.strictEqual(r.month.hanja, '己丑');
});
t('2026-02-10 는 입춘 후 → 년주 丙午, 월주 庚寅', () => {
  const r = Saju.compute({ year: 2026, month: 2, day: 10, hour: 10, minute: 0, gender: 'F' });
  assert.strictEqual(r.year.hanja, '丙午');
  assert.strictEqual(r.month.hanja, '庚寅');
});
t('1984-03-01 → 甲子년 丙寅월', () => {
  const r = Saju.compute({ year: 1984, month: 3, day: 1, hour: 12, minute: 0, gender: 'M' });
  assert.strictEqual(r.year.hanja, '甲子'); assert.strictEqual(r.month.hanja, '丙寅');
});
t('2000-01-01 10:00 → 일주 戊午, 시주 丁巳(사시)', () => {
  const r = Saju.compute({ year: 2000, month: 1, day: 1, hour: 10, minute: 0, gender: 'M', solarCorrectionMin: 0 });
  assert.strictEqual(r.day.hanja, '戊午');
  assert.strictEqual(r.hour.hanja, '丁巳');
});
t('2000-01-01 23:40 (보정 −30 → 23:10) → 야자시, 일주 己未, 시주 甲子', () => {
  const r = Saju.compute({ year: 2000, month: 1, day: 1, hour: 23, minute: 40, gender: 'M' });
  assert.strictEqual(r.corrected.hour, 23);
  assert.strictEqual(r.day.hanja, '己未');
  assert.strictEqual(r.hour.hanja, '甲子');
});
t('2000-01-01 00:10 (보정 −30 → 전날 23:40) → 일주 戊午(1/1), 시주 壬子', () => {
  const r = Saju.compute({ year: 2000, month: 1, day: 1, hour: 0, minute: 10, gender: 'M' });
  assert.strictEqual(r.corrected.d, 31);
  assert.strictEqual(r.day.hanja, '戊午');
  assert.strictEqual(r.hour.hanja, '壬子');
});
t('시간 모름 → 3주, 오행 합 6', () => {
  const r = Saju.compute({ year: 1990, month: 6, day: 15, hourUnknown: true, gender: 'F' });
  assert.strictEqual(r.pillars.length, 3); assert.strictEqual(r.hour, null);
  assert.strictEqual(Object.values(r.elements).reduce((a, b) => a + b, 0), 6);
});
t('십신: 甲 기준 — 甲비견 乙겁재 丙식신 丁상관 戊편재 己정재 庚편관 辛정관 壬편인 癸정인', () => {
  const exp = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
  exp.forEach((e, i) => assert.strictEqual(Saju.tenGod(0, i).name, e));
});
t('십신 개수 = 7 (4주 중 일간 제외)', () => {
  const r = Saju.compute({ year: 1995, month: 8, day: 20, hour: 15, minute: 0, gender: 'M' });
  assert.strictEqual(r.tenGods.length, 7);
  assert.strictEqual(Object.values(r.groups).reduce((a, b) => a + b, 0), 7);
});
t('대운: 양남 순행, 음남 역행, 대운수 1~10, 현재 대운 존재', () => {
  const a = Saju.compute({ year: 1984, month: 6, day: 10, hour: 9, minute: 0, gender: 'M', now: '2026-10-29' }); // 甲子년 남 → 순행
  assert.strictEqual(a.daeun.forward, true);
  assert.ok(a.daeun.startAge >= 1 && a.daeun.startAge <= 10);
  assert.ok(a.daeun.current, 'current daeun');
  assert.strictEqual(a.daeun.list[0].index60, (a.month.index60 + 1) % 60);
  const b = Saju.compute({ year: 1985, month: 6, day: 10, hour: 9, minute: 0, gender: 'M', now: '2026-10-29' }); // 乙丑년 남 → 역행
  assert.strictEqual(b.daeun.forward, false);
  assert.strictEqual(b.daeun.list[0].index60, (b.month.index60 + 59) % 60);
});
t('세운 2026 丙午, 2027 丁未', () => {
  const r = Saju.compute({ year: 1990, month: 1, day: 1, hour: 1, minute: 0, gender: 'F', now: '2026-10-29' });
  assert.strictEqual(r.seun[0].hanja, '丙午'); assert.strictEqual(r.seun[1].hanja, '丁未');
});
t('절입: prev < 출생 < next, 간격 28~33일', () => {
  const r = Saju.compute({ year: 1991, month: 11, day: 3, hour: 6, minute: 0, gender: 'F' });
  const p = Date.parse(r.terms.prev), nx = Date.parse(r.terms.next), b = Date.UTC(1991, 10, 2, 21, 0);
  assert.ok(p < b && b < nx, 'order');
  const gap = (nx - p) / 86400000; assert.ok(gap > 28 && gap < 33, 'gap ' + gap);
});
console.log(`\n${n} tests passed`);

// ── MBTI 교차 분석
const MBTI = require('../mbti.js');
let n2 = 0; function t2(name, fn) { fn(); n2++; console.log('ok -', name); }
t2('명식 MBTI: 샘플(1991-11-03 06:20 F, 식상 4/7) → ENFP, F 강함', () => {
  const r = Saju.compute({ year: 1991, month: 11, day: 3, hour: 6, minute: 20, gender: 'F', now: '2026-10-29' });
  const est = MBTI.estimate(r);
  assert.strictEqual(est.letters, 'ENFP');
  const tf = est.axes.find(a => a.id === 'TF'); assert.ok(tf.letterPct >= 70, 'F strength ' + tf.letterPct);
  est.axes.forEach(a => { assert.ok(a.pct >= 0 && a.pct <= 100); assert.ok(a.factors.length >= 1); });
});
t2('parse: 소문자·잡문자 허용, 잘못된 조합 거부', () => {
  assert.strictEqual(MBTI.parse('enfp'), 'ENFP'); assert.strictEqual(MBTI.parse('I-N-T-J'), 'INTJ');
  assert.strictEqual(MBTI.parse('ABCD'), null); assert.strictEqual(MBTI.parse('EN'), null); assert.strictEqual(MBTI.parse('NEFP'), null);
});
t2('compare: INFJ vs ENFP → 2축 일치, 축별 문장 존재', () => {
  const r = Saju.compute({ year: 1991, month: 11, day: 3, hour: 6, minute: 20, gender: 'F', now: '2026-10-29' });
  const c = MBTI.compare('INFJ', MBTI.estimate(r));
  assert.strictEqual(c.matches, 2); assert.strictEqual(c.axes[0].match, false); assert.strictEqual(c.axes[1].match, true);
  c.axes.forEach(x => assert.ok(x.text && x.text.length > 20)); assert.ok(c.summary);
});
t2('estimate: 다양한 명식에서 네 글자 모두 유효', () => {
  for (let y = 1960; y <= 2010; y += 7) for (const h of [2, 9, 15, 22]) {
    const est = MBTI.estimate(Saju.compute({ year: y, month: (y % 12) + 1, day: (y % 27) + 1, hour: h, minute: 0, gender: y % 2 ? 'M' : 'F' }));
    assert.ok(MBTI.parse(est.letters), est.letters);
  }
});
console.log(`${n2} mbti tests passed`);

// ── 장문 풀이 & 캐릭터 레이어
global.self = global; require('../personas.js'); const PP = global.SajuPersonas;
const RR = require('../report.js');
let n3 = 0; function t3(name, fn) { fn(); n3++; console.log('ok -', name); }
t3('캐릭터 5인(동자는 할머니에 통합): lead 12개 이상, special 완비, 전문가 1인', () => {
  const ids = Object.keys(PP.personas); assert.strictEqual(ids.length, 5); assert.ok(!PP.personas.child);
  ids.forEach(id => { const p = PP.personas[id]; assert.ok(Object.keys(p.lead).length >= 12, id + ' lead'); ['byElem', 'byStrong', 'byWeak'].forEach(k => assert.strictEqual(Object.keys(p.special[k]).length, 5, id + ' ' + k)); assert.ok(p.report.price > 0); });
  assert.strictEqual(PP.personas.master.tier, 'expert'); assert.strictEqual(PP.personas.master.report.price, 39900); assert.ok(!PP.personas.master.consentNote);
});
t3('월운: 2027(丁未)년 寅월 = 壬寅, 丑월 = 癸丑, 절입일 존재', () => {
  const ms = RR.monthPillarsOfYear(2027); assert.strictEqual(ms[0].hanja, '壬寅'); assert.strictEqual(ms[11].hanja, '癸丑'); assert.ok(ms.every(m => m.startKST));
  assert.strictEqual(ms[0].startKST.getUTCMonth(), 1); // 2월
});
t3('신강신약 간이 판정: 라벨 3종 중 하나, 근거 3개', () => {
  const r = Saju.compute({ year: 1991, month: 11, day: 3, hour: 6, minute: 20, gender: 'F' }); const st = RR.strengthJudge(r);
  assert.ok(['신강', '중화', '신약'].includes(st.label)); assert.strictEqual(st.why.length, 3); assert.ok(st.season);
});
t3('풀이 분량: 6캐릭터 × 6명식 모두 15화면(6,750자) 이상, 17장', () => {
  let min = 1e9;
  Object.keys(PP.personas).forEach(pid => [[1991, 11, 3, 6, 'F'], [1984, 6, 10, 9, 'M'], [2001, 2, 2, 23, 'F'], [1975, 12, 25, 14, 'M'], [1996, 8, 8, 8, 'M'], [2010, 3, 15, 0, 'F']].forEach(([y, m, d, h, g]) => {
    const r = Saju.compute({ year: y, month: m, day: d, hour: h, minute: 20, gender: g, now: '2026-10-29' });
    const rep = RR.build(r, PP.personas[pid], { name: '샘플', className: PP.classNames[r.day.stem], now: '2026-10-29' });
    assert.strictEqual(rep.sections.length, 17, pid + ' sections'); assert.ok(rep.sections.some(s => s.id === 'special') && rep.sections.some(s => s.id === 'months'));
    min = Math.min(min, rep.chars);
  }));
  assert.ok(min >= 6750, 'min chars ' + min); console.log('   최소 분량', min, '자 ≈', Math.round(min / 450), '화면');
});
t3('시간 모름(3주)에서도 풀이 생성', () => {
  const r = Saju.compute({ year: 1988, month: 5, day: 5, hourUnknown: true, gender: 'M', now: '2026-10-29' });
  const rep = RR.build(r, PP.personas.sage, { name: '샘플', now: '2026-10-29' }); assert.ok(rep.chars > 5000);
});
t3('MBTI 사주 심층: head 5장 + tail 2장, 불일치 축 실험 포함', () => {
  const r = Saju.compute({ year: 1991, month: 11, day: 3, hour: 6, minute: 20, gender: 'F', now: '2026-10-29' });
  const est = MBTI.estimate(r), cmp = MBTI.compare('INFJ', est); const mb = MBTI.buildSections(r, est, cmp, { name: '지민' });
  assert.strictEqual(mb.head.length, 5); assert.strictEqual(mb.tail.length, 2); assert.ok(mb.tail[0].html.includes('1주차'));
});
console.log(`${n3} report tests passed`);
