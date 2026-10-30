/*
 * saju.js — 만세력 결정론 계산 엔진 (MVP)
 *
 * 역할: 생년월일시 → 사주 원국(년·월·일·시주), 오행 분포, 십신, 대운, 세운.
 * LLM은 이 결과를 "해석"만 한다. 계산은 절대 LLM에게 맡기지 않는다.
 *
 * 계산 규칙(이 MVP가 채택한 유파·근사):
 *  - 년주 경계: 입춘(태양 황경 315°). 월주 경계: 12절기(황경 30° 간격).
 *  - 태양 황경: Meeus 저정밀 공식(오차 약 0.01°, 시각 약 15분). 운영 전환 시 KASI 절기 자료로 교체.
 *  - 일주: (율리우스일수 + 49) mod 60. 2000-01-01 = 戊午, 1900-01-01 = 甲戌 로 검증.
 *  - 시주: 자시 23:00~00:59. 23시 이후 출생은 다음 날 일주를 쓴다(옵션 lateZiNextDay).
 *  - 진태양시 보정: 기본 −30분(서울 127°E vs 표준자오선 135°E). 서머타임(1948~51, 55~60, 87~88) 미반영.
 *  - 음력 입력 미지원(MVP). 양력만.
 *  - 대운수: 양남음녀 순행(다음 절입까지 일수/3), 음남양녀 역행(지난 절입부터 일수/3). 반올림, 1~10.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Saju = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const STEM_ELEM = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  const BRANCH_ELEM = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
  // 지지의 본기(本氣) 천간 인덱스: 子癸 丑己 寅甲 卯乙 辰戊 巳丙 午丁 未己 申庚 酉辛 戌戊 亥壬
  const BRANCH_MAIN_STEM = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];
  const BRANCH_ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  const ELEMENTS = ['木', '火', '土', '金', '水'];
  const ELEM_KO = { 木: '목', 火: '화', 土: '토', 金: '금', 水: '수' };
  const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const OVERCOMES = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const TEN_GOD_GROUPS = ['비겁', '식상', '재성', '관성', '인성'];
  const HOUR_LABELS = ['자시 23:00~00:59', '축시 01:00~02:59', '인시 03:00~04:59', '묘시 05:00~06:59', '진시 07:00~08:59', '사시 09:00~10:59', '오시 11:00~12:59', '미시 13:00~14:59', '신시 15:00~16:59', '유시 17:00~18:59', '술시 19:00~20:59', '해시 21:00~22:59'];

  const DEG = Math.PI / 180;
  const MS_PER_DAY = 86400000;

  function mod(n, m) { return ((n % m) + m) % m; }
  function norm360(x) { return mod(x, 360); }

  // 그레고리력 날짜 → 율리우스일수(정수, 정오 기준)
  function jdn(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  // UTC 밀리초 → 율리우스일(실수)
  function jdFromMs(ms) { return ms / MS_PER_DAY + 2440587.5; }
  function msFromJd(jd) { return (jd - 2440587.5) * MS_PER_DAY; }

  // 태양의 시황경(apparent longitude), 도 단위. Meeus, Astronomical Algorithms ch.25 (저정밀)
  function sunLongitude(jd) {
    const T = (jd - 2451545.0) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mr = M * DEG;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
      + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
      + 0.000289 * Math.sin(3 * Mr);
    const trueLong = L0 + C;
    const omega = 125.04 - 1934.136 * T;
    const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);
    return norm360(lambda);
  }

  // 황경 target(도)에 도달하는 시각(JD)을 approxJd 근방 ±windowDays 에서 이분법으로 찾는다.
  function solarTermJd(targetDeg, approxJd, windowDays) {
    const w = windowDays || 18;
    const f = (jd) => { let d = norm360(sunLongitude(jd) - targetDeg); if (d > 180) d -= 360; return d; };
    let lo = approxJd - w, hi = approxJd + w;
    let flo = f(lo), fhi = f(hi);
    if (!(flo < 0 && fhi > 0)) {
      // 창을 넓혀 한 번 더 시도
      lo = approxJd - 2 * w; hi = approxJd + 2 * w; flo = f(lo); fhi = f(hi);
      if (!(flo < 0 && fhi > 0)) return null;
    }
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const fm = f(mid);
      if (fm < 0) lo = mid; else hi = mid;
      if (hi - lo < 1 / 86400) break;
    }
    return (lo + hi) / 2;
  }

  function sexagenaryIndex(stemIdx, branchIdx) {
    for (let i = 0; i < 60; i++) if (i % 10 === stemIdx && i % 12 === branchIdx) return i;
    return -1;
  }

  function pillar(stemIdx, branchIdx, name) {
    const s = mod(stemIdx, 10), b = mod(branchIdx, 12);
    return {
      name: name || '',
      stem: STEMS[s], branch: BRANCHES[b],
      stemKo: STEMS_KO[s], branchKo: BRANCHES_KO[b],
      stemIdx: s, branchIdx: b,
      stemElem: STEM_ELEM[s], branchElem: BRANCH_ELEM[b],
      stemPolarity: s % 2 === 0 ? '양' : '음',
      animal: BRANCH_ANIMAL[b],
      hanja: STEMS[s] + BRANCHES[b],
      ko: STEMS_KO[s] + BRANCHES_KO[b],
      index60: sexagenaryIndex(s, b),
    };
  }

  function pillarFromIndex60(i, name) { const k = mod(i, 60); return pillar(k % 10, k % 12, name); }

  // 십신: 일간 기준으로 다른 천간의 관계
  function tenGod(dayStemIdx, otherStemIdx) {
    const dE = STEM_ELEM[dayStemIdx], oE = STEM_ELEM[otherStemIdx];
    const same = (dayStemIdx % 2) === (otherStemIdx % 2);
    if (oE === dE) return { name: same ? '비견' : '겁재', group: '비겁' };
    if (GENERATES[dE] === oE) return { name: same ? '식신' : '상관', group: '식상' };
    if (OVERCOMES[dE] === oE) return { name: same ? '편재' : '정재', group: '재성' };
    if (OVERCOMES[oE] === dE) return { name: same ? '편관' : '정관', group: '관성' };
    return { name: same ? '편인' : '정인', group: '인성' };
  }

  function yearPillarOf(sajuYear, name) { return pillar(mod(sajuYear - 4, 10), mod(sajuYear - 4, 12), name || '년주'); }

  // 오호둔(五虎遁): 년간 → 인월(寅月)의 천간
  function monthStemIdx(yearStemIdx, monthBranchIdx) {
    const base = ((yearStemIdx % 5) * 2 + 2) % 10; // 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲
    const offset = mod(monthBranchIdx - 2, 12);    // 寅=0
    return (base + offset) % 10;
  }

  // 오자둔(五鼠遁): 일간 → 자시(子時)의 천간
  function hourStemIdx(dayStemIdx, hourBranchIdx) {
    const base = (dayStemIdx % 5) * 2; // 甲己→甲, 乙庚→丙, 丙辛→戊, 丁壬→庚, 戊癸→壬
    return (base + hourBranchIdx) % 10;
  }

  function hourBranchIdx(hour) { return Math.floor(mod(hour + 1, 24) / 2); }

  // 황경 → 월지(月支). 寅월 = [315, 345)
  function monthBranchFromLongitude(lambda) {
    const idx = Math.floor(norm360(lambda - 315) / 30);
    return (idx + 2) % 12;
  }

  function addDays(y, m, d, n) {
    const t = Date.UTC(y, m - 1, d) + n * MS_PER_DAY;
    const dt = new Date(t);
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
  }

  /**
   * compute(input)
   * input: { year, month, day, hour, minute, hourUnknown, gender:'M'|'F',
   *          tzOffsetMin=540 (KST), solarCorrectionMin=-30, lateZiNextDay=true, now=Date }
   */
  function compute(input) {
    const opt = Object.assign({ tzOffsetMin: 540, solarCorrectionMin: -30, lateZiNextDay: true, hourUnknown: false, minute: 0 }, input || {});
    const notes = [];
    const y = +opt.year, mo = +opt.month, d = +opt.day;
    const calendarDate = new Date(Date.UTC(y, mo - 1, d));
    if (![y, mo, d].every(Number.isInteger) || y < 1900 || y > 2030 || calendarDate.getUTCFullYear() !== y || calendarDate.getUTCMonth() !== mo - 1 || calendarDate.getUTCDate() !== d) throw new Error('1900~2030년의 올바른 양력 생년월일을 입력해 주세요.');
    if (!opt.hourUnknown && (!Number.isInteger(+opt.hour) || +opt.hour < 0 || +opt.hour > 23 || !Number.isInteger(+opt.minute) || +opt.minute < 0 || +opt.minute > 59)) throw new Error('올바른 출생 시각을 입력해 주세요.');
    if (!Number.isFinite(+opt.solarCorrectionMin) || Math.abs(+opt.solarCorrectionMin) > 1440 || !Number.isFinite(+opt.tzOffsetMin) || Math.abs(+opt.tzOffsetMin) > 1440) throw new Error('시간 보정값을 확인해 주세요.');

    // 1) 보정된 현지 시각
    let localMin;
    if (opt.hourUnknown) {
      localMin = 12 * 60; // 시간 모름: 정오 기준으로 황경만 계산, 시주 생략
      notes.push('출생 시간 미입력: 시주 생략, 년·월·일주만 계산');
    } else {
      localMin = (+opt.hour) * 60 + (+opt.minute) + (+opt.solarCorrectionMin || 0);
      if (opt.solarCorrectionMin) notes.push(`진태양시 보정 ${opt.solarCorrectionMin > 0 ? '+' : ''}${opt.solarCorrectionMin}분 적용`);
    }
    let dayShift = 0;
    while (localMin < 0) { localMin += 1440; dayShift -= 1; }
    while (localMin >= 1440) { localMin -= 1440; dayShift += 1; }
    const corr = addDays(y, mo, d, dayShift);
    const corrHour = Math.floor(localMin / 60), corrMinute = localMin % 60;

    // 2) UTC 순간 → 태양 황경
    const utcMs = Date.UTC(corr.y, corr.m - 1, corr.d, corrHour, corrMinute) - opt.tzOffsetMin * 60000;
    const jd = jdFromMs(utcMs);
    const lambda = sunLongitude(jd);

    // 3) 년주 (입춘 기준)
    const sajuYear = (corr.m <= 2 && lambda < 315 && lambda > 180) ? corr.y - 1 : corr.y;
    const yearP = yearPillarOf(sajuYear, '년주');

    // 4) 월주 (절기 기준)
    const mB = monthBranchFromLongitude(lambda);
    const monthP = pillar(monthStemIdx(yearP.stemIdx, mB), mB, '월주');

    // 5) 일주
    let dayDate = corr;
    if (!opt.hourUnknown && corrHour >= 23 && opt.lateZiNextDay) {
      dayDate = addDays(corr.y, corr.m, corr.d, 1);
      notes.push('23시 이후 출생(야자시): 다음 날 일주 적용');
    }
    const dayIdx60 = mod(jdn(dayDate.y, dayDate.m, dayDate.d) + 49, 60);
    const dayP = pillarFromIndex60(dayIdx60, '일주');

    // 6) 시주
    let hourP = null;
    if (!opt.hourUnknown) {
      const hB = hourBranchIdx(corrHour);
      hourP = pillar(hourStemIdx(dayP.stemIdx, hB), hB, '시주');
      hourP.label = HOUR_LABELS[hB];
    }

    const pillars = [yearP, monthP, dayP, hourP].filter(Boolean);

    // 7) 오행 분포 (천간 + 지지 본기)
    const elements = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    pillars.forEach(p => { elements[p.stemElem] += 1; elements[p.branchElem] += 1; });
    const totalChars = pillars.length * 2;

    // 8) 십신 (일간 제외)
    const tenGods = [];
    pillars.forEach(p => {
      if (p.name !== '일주') tenGods.push(Object.assign({ at: p.name + ' 천간', char: p.stem }, tenGod(dayP.stemIdx, p.stemIdx)));
      tenGods.push(Object.assign({ at: p.name + ' 지지', char: p.branch }, tenGod(dayP.stemIdx, BRANCH_MAIN_STEM[p.branchIdx])));
    });
    const groups = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
    tenGods.forEach(t => { groups[t.group] += 1; });
    const sortedGroups = TEN_GOD_GROUPS.slice().sort((a, b) => groups[b] - groups[a]);
    const strongestGroup = sortedGroups[0];
    const weakestGroup = sortedGroups[sortedGroups.length - 1];
    const sortedElems = ELEMENTS.slice().sort((a, b) => elements[b] - elements[a]);

    // 9) 절입 시각과 대운
    const monthStartDeg = norm360(315 + 30 * mod(mB - 2, 12));
    const degIntoMonth = norm360(lambda - monthStartDeg);
    const prevTermJd = solarTermJd(monthStartDeg, jd - degIntoMonth / 360 * 365.2422);
    const nextTermJd = solarTermJd(norm360(monthStartDeg + 30), jd + (30 - degIntoMonth) / 360 * 365.2422);
    let daeun = null;
    if (opt.gender && prevTermJd && nextTermJd) {
      const yangYear = yearP.stemIdx % 2 === 0;
      const forward = (opt.gender === 'M') === yangYear; // 양남음녀 순행
      const days = forward ? (nextTermJd - jd) : (jd - prevTermJd);
      const startAge = Math.min(10, Math.max(1, Math.round(days / 3)));
      const list = [];
      for (let i = 1; i <= 8; i++) {
        const p = pillarFromIndex60(monthP.index60 + (forward ? i : -i), '대운');
        p.fromAge = startAge + (i - 1) * 10;
        p.toAge = p.fromAge + 9;
        p.tenGod = tenGod(dayP.stemIdx, p.stemIdx);
        p.branchTenGod = tenGod(dayP.stemIdx, BRANCH_MAIN_STEM[p.branchIdx]);
        list.push(p);
      }
      const now = opt.now ? new Date(opt.now) : new Date();
      const ageYears = Math.floor((now.getTime() - utcMs) / (MS_PER_DAY * 365.2425));
      const current = list.find(p => ageYears >= p.fromAge && ageYears <= p.toAge) || null;
      daeun = { forward, startAge, ageYears, list, current, note: '만 나이 기준. 대운수는 절입까지 일수/3 반올림' };
    }

    // 10) 세운 (올해·내년)
    const nowYear = (opt.now ? new Date(opt.now) : new Date()).getFullYear();
    const seun = [nowYear, nowYear + 1].map(yy => {
      const p = yearPillarOf(yy, '세운');
      p.year = yy; p.tenGod = tenGod(dayP.stemIdx, p.stemIdx); p.branchTenGod = tenGod(dayP.stemIdx, BRANCH_MAIN_STEM[p.branchIdx]);
      return p;
    });

    return {
      input: opt,
      corrected: { y: corr.y, m: corr.m, d: corr.d, hour: opt.hourUnknown ? null : corrHour, minute: opt.hourUnknown ? null : corrMinute },
      sajuYear, lambda: Math.round(lambda * 1000) / 1000,
      pillars, year: yearP, month: monthP, day: dayP, hour: hourP,
      dayMaster: { stem: dayP.stem, stemKo: dayP.stemKo, element: dayP.stemElem, elementKo: ELEM_KO[dayP.stemElem], polarity: dayP.stemPolarity, idx: dayP.stemIdx },
      elements, totalChars, sortedElems,
      tenGods, groups, strongestGroup, weakestGroup, sortedGroups,
      terms: { prev: prevTermJd ? new Date(msFromJd(prevTermJd)).toISOString() : null, next: nextTermJd ? new Date(msFromJd(nextTermJd)).toISOString() : null },
      daeun, seun, notes,
    };
  }

  return {
    STEMS, STEMS_KO, STEM_ELEM, BRANCHES, BRANCHES_KO, BRANCH_ELEM, BRANCH_MAIN_STEM, BRANCH_ANIMAL, ELEMENTS, ELEM_KO, TEN_GOD_GROUPS, HOUR_LABELS,
    jdn, sunLongitude, solarTermJd, jdFromMs, msFromJd,
    pillar, pillarFromIndex60, yearPillarOf, monthStemIdx, hourStemIdx, hourBranchIdx, monthBranchFromLongitude, tenGod,
    compute,
  };
});
