/* app.js — 화면 흐름(콘티)과 렌더링. 계산 Saju, 캐릭터 SajuPersonas, MBTI SajuMBTI, 장문 풀이 SajuReport. */
(function () {
  'use strict';
  const S = window.Saju, P = window.SajuPersonas, M = window.SajuMBTI, R = window.SajuReport, R2 = window.SajuReport2, UI = window.SajuReportUI, CP = window.SajuCompat, QB = window.SajuQuestions;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ART = 'assets/characters/';
  const SCREENS = ['home', 'persona', 'form', 'reading', 'result'];
  const STEPS = { persona: ['시작', '캐릭터', '정보', '리딩', '시트'], mbti: ['시작', 'MBTI 사주', '정보', '리딩', '결과'] };
  const MBTI_PRODUCT = { title: 'MBTI 사주 심층', price: 9900, chapters: ['검사·명식·추구 세 글자 맞대기: 사주가 권하는 흐름', '네 축 심층: 명식이 그렇게 기운 이유', '검사와 명식의 간격 읽기', '일간·오행·십신으로 보는 기질', '환경 vs 기질 4주 실험'] };
  const state = { mode: 'persona', persona: null, input: null, result: null, reading: null, unlocked: false, est: null, cmp: null, report: null, compat: null, parent: null, qsel: [], qall: false, qdomain: null };
  const won = n => '₩' + n.toLocaleString();
  const PL = () => window.SajuPlain; const plainT = (t, seen) => (PL() ? PL().text(t, seen) : t); const plainH = (h, seen) => (PL() ? PL().html(h, seen) : h); const plainS = g => (PL() ? PL().short(g) : g);

  // ───── 캐릭터 이미지 슬롯 ─────
  const probeCache = {};
  function probe(url) { if (!probeCache[url]) probeCache[url] = new Promise(res => { const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = url; }); return probeCache[url]; }
  function artHTML(p, kind, cls) { return `<span class="art ${cls || ''}" data-kind="${kind}"><img src="${ART}${p.id}/${kind}.png" alt="" onerror="this.closest('.art').classList.add('noart')"><span class="emblem">${p.emblem}</span></span>`; }
  function bgLayersHTML(p) {
    const f = k => `${ART}${p.id}/${k}.png`;
    return `<div class="bg-stage" aria-hidden="true">
      <img class="bg far" src="${f('bg_intro_far')}" alt="" onerror="this.remove()">
      <img class="bg mid" src="${f('bg_intro_mid')}" alt="" onerror="this.remove()">
      <img class="bg mid dup" src="${f('bg_intro_mid')}" alt="" onerror="this.remove()">
      <img class="bg near" src="${f('bg_intro_near')}" alt="" onerror="this.remove()">
    </div>`;
  }
  function bindParallax(root) {
    const near = root && root.querySelector('.bg.near'); if (!near || reduced) return;
    const move = (dx, dy) => { near.style.transform = `translate(${(dx * 12).toFixed(1)}px, ${(dy * 12).toFixed(1)}px) scale(1.04)`; };
    root.addEventListener('pointermove', e => { const r = root.getBoundingClientRect(); move((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5); });
    root.addEventListener('pointerleave', () => move(0, 0));
    if (window.DeviceOrientationEvent) addEventListener('deviceorientation', e => { if (e.gamma == null) return; move(Math.max(-.5, Math.min(.5, e.gamma / 60)), Math.max(-.5, Math.min(.5, (e.beta - 45) / 90))); }, { passive: true });
  }
  async function setFace(name) {
    const p = state.persona; const art = $('#portrait .art'); if (!p || !art || art.classList.contains('noart')) return;
    const url = ART + p.id + '/' + (name === 'neutral' ? 'face.png' : `face_${name}.png`);
    if (await probe(url)) art.querySelector('img').src = url;
  }

  // ───── 화면·단계 ─────
  function show(id) {
    SCREENS.forEach(s => { const el = $('#s-' + s); if (el) el.hidden = s !== id; });
    const idx = SCREENS.indexOf(id);
    const stepsEl = $('#steps'); if (stepsEl) stepsEl.innerHTML = STEPS[state.mode].map((t, i) => `<li class="${i === idx ? 'on' : i < idx ? 'done' : ''}">${t}</li>`).join('');
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }
  function setMode(mode) { state.mode = mode; if (mode === 'mbti') { state.persona = null; document.documentElement.dataset.persona = 'mbti'; $('#app').dataset.persona = 'mbti'; } }
  function setPersona(id) { state.persona = P.personas[id]; document.documentElement.dataset.persona = id; $('#app').dataset.persona = id; }

  // ───── 배경 별가루 ─────
  function stars() {
    const c = $('#stars'); if (!c) return; const ctx = c.getContext('2d'); let w, h, pts = [];
    function size() { w = c.width = innerWidth * devicePixelRatio; h = c.height = innerHeight * devicePixelRatio; pts = Array.from({ length: 70 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.2 + .3) * devicePixelRatio, v: (Math.random() * .15 + .05) * devicePixelRatio, a: Math.random() })); }
    size(); addEventListener('resize', size);
    function draw() { ctx.clearRect(0, 0, w, h); const accent = getComputedStyle(document.documentElement).getPropertyValue('--p-accent').trim() || '#d8b45f'; pts.forEach(p => { p.y -= p.v; p.a += .01; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } ctx.globalAlpha = .35 + .35 * Math.sin(p.a); ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1; if (!reduced) requestAnimationFrame(draw); }
    draw();
  }

  // ───── 0. 홈 ─────
  function renderHome() {
    const MBTI_CARD = { id: 'mbti', name: '도윤 선생님', role: 'MBTI 사주 · 성향 상담', tagline: '검사 결과와 타고난 결이 다른 이유를 네 축으로 풀어요.', tier: 'character', palette: { accent: '#66d6c5' }, report: { price: MBTI_PRODUCT.price } };
    const ids = Object.keys(P.personas); const cards = ids.filter(id => P.personas[id].tier !== 'expert').map(id => P.personas[id]).concat([MBTI_CARD], ids.filter(id => P.personas[id].tier === 'expert').map(id => P.personas[id]));
    $('#roster').innerHTML = cards.map(p => { const id = p.id; const expert = p.tier === 'expert'; return `
      <button type="button" class="pcard ${expert ? 'expert' : ''}" data-id="${id}" style="--pc:${p.palette.accent}">
        ${expert ? '<span class="ribbon">전문가</span>' : ''}
        <div class="art-wrap">${id === 'mbti' ? `<span class="art" data-kind="full"><img src="${ART}mbti/full.png" alt="" onerror="this.closest('.art').classList.add('noart')"></span>` : artHTML(p, 'full')}</div>
        <div class="pbody">
          <div class="pname">${p.name}</div>
          <div class="prole">${p.role}${p.org ? ' · ' + p.org : ''}</div>
          <div class="ptag">${p.tagline}</div>
          <div class="pprice">무료 3줄 · ${expert ? '종합' : '심층'} <b>${won(p.report.price)}</b>${expert ? '<br><small>정통 30 + 연인·재물·이직 60, 질문 90개 답 전부</small>' : ''}</div>
        </div>
      </button>`; }).join('');
    $$('#roster .pcard').forEach(b => b.addEventListener('click', () => { if (b.dataset.id === 'mbti') { setMode('mbti'); if (window.SajuVN) { window.SajuVN.start('mbti'); return; } renderMbtiIntro(); show('persona'); return; } state.mode = 'persona'; setPersona(b.dataset.id); if (window.SajuVN) { window.SajuVN.start(b.dataset.id); return; } renderPersonaIntro(); show('persona'); }));
    renderResume();
  }

  // ───── 리포트 보관함(이 기기에 저장 · 새로고침 뒤 재열람) ─────
  const SNAP_KEY = 'saju.reports';
  function snapKey(s) { const i = s.input || {}; return `${s.mode}|${s.persona || 'mbti'}|${i.year}-${i.month}-${i.day}|${i.gender}`; }
  function loadSnaps() {
    try {
      let arr = JSON.parse(localStorage.getItem(SNAP_KEY) || '[]'); if (!Array.isArray(arr)) arr = [];
      const old = JSON.parse(localStorage.getItem('saju.last') || 'null'); if (old && old.input) { arr.push(old); localStorage.removeItem('saju.last'); localStorage.setItem(SNAP_KEY, JSON.stringify(arr)); }
      return arr.filter(s => s && s.input && s.v === 1);
    } catch (e) { return []; }
  }
  function saveSnap() {
    if (!state.input || !state.result) return;
    const s = { v: 1, at: Date.now(), mode: state.mode, persona: state.persona ? state.persona.id : null, input: state.input, compatIn: state.compatIn || null, parentIn: state.parentIn || null, concern: state.concern || null, concernLabel: state.concernLabel || null, situation: state.situation || null, situationLabel: state.situationLabel || null, qsel: state.qsel, qall: state.qall, paid: !!state.unlocked };
    try { const prev = loadSnaps().find(x => snapKey(x) === snapKey(s)); if (prev && prev.paid && !s.paid) { s.paid = true; s.qall = s.qall || prev.qall; } const arr = loadSnaps().filter(x => snapKey(x) !== snapKey(s)); arr.unshift(s); localStorage.setItem(SNAP_KEY, JSON.stringify(arr.slice(0, 12))); } catch (e) { /* 저장 공간 없음·차단 */ }
  }
  function removeSnap(key) { try { localStorage.setItem(SNAP_KEY, JSON.stringify(loadSnaps().filter(x => snapKey(x) !== key))); } catch (e) { /* 무시 */ } }
  function clearSnap() { /* 처음부터 눌러도 산 리포트는 지우지 않는다 */ }
  function snapWho(s) { const p = s.persona ? P.personas[s.persona] : null; return s.mode === 'mbti' ? '도윤 선생님 · MBTI 사주' : p ? `${p.name} · ${p.role}` : ''; }
  function renderResume() {
    const old = $('#resume'); if (old) old.remove(); const list = loadSnaps().filter(snapWho).sort((a, b) => (b.paid - a.paid) || (b.at - a.at)); if (!list.length) return;
    const row = s => { const i = s.input; const birth = `${i.year}.${String(i.month).padStart(2, '0')}.${String(i.day).padStart(2, '0')}${i.hourUnknown ? '' : ' ' + String(i.hour).padStart(2, '0') + ':' + String(i.minute).padStart(2, '0')}`; const k = snapKey(s); let note = null; try { note = JSON.parse(localStorage.getItem(`saju-note-${i.year}${i.month}${i.day}-${s.mode === 'mbti' ? 'mbti' : s.persona}`) || 'null'); } catch (e) { note = null; } const noteTag = note ? (note.done ? ' · <em>오늘 할 일 ✓</em>' : '') + (note.note ? ' · 메모 1줄' : '') : ''; return `<div class="resume-row"><div><b>${snapWho(s)}</b><small>${i.name || '당신'} · ${birth} · ${s.paid ? '<em>구매함</em>' + (s.qall ? ' · 전체 답' : '') : '무료 결과'}${noteTag}</small>${note && note.note ? `<small class="note-prev">“${note.note.slice(0, 40)}”</small>` : ''}</div><div class="row"><button type="button" class="btn ${s.paid ? 'primary' : ''}" data-resume="${k}">이어 보기</button><button type="button" class="btn ghost" data-del="${k}">지우기</button></div></div>`; };
    $('#roster').insertAdjacentHTML('beforebegin', `<div class="card resume" id="resume"><div class="eyebrow">내 리포트 보관함 · 이 기기에 저장돼 새로고침해도 다시 열려요</div>${list.map(row).join('')}</div>`);
    $$('#resume [data-resume]').forEach(b => b.addEventListener('click', () => { const s = loadSnaps().find(x => snapKey(x) === b.dataset.resume); if (s) resume(s); }));
    $$('#resume [data-del]').forEach(b => b.addEventListener('click', () => { removeSnap(b.dataset.del); renderResume(); }));
  }
  function resume(s) {
    if (s.mode === 'mbti') setMode('mbti'); else { state.mode = 'persona'; setPersona(s.persona); }
    if (!compute(s.input)) { removeSnap(snapKey(s)); renderResume(); return; }
    const sub = x => { try { return S.compute({ year: x.year, month: x.month, day: x.day, hour: 12, minute: 0, hourUnknown: true, gender: x.gender, solarCorrectionMin: 0 }); } catch (e) { return null; } };
    state.concern = s.concern || null; state.concernLabel = s.concernLabel || null; state.situation = s.situation || null; state.situationLabel = s.situationLabel || null;
    if (s.compatIn) { const pr = sub(s.compatIn); state.compatIn = s.compatIn; state.compat = pr ? { pr, kind: s.compatIn.kind || 'love', nameB: s.compatIn.nameB || '상대' } : null; }
    if (s.parentIn) { state.parentIn = s.parentIn; state.parent = sub(s.parentIn); }
    if (Array.isArray(s.qsel) && s.qsel.length) { state.qsel = s.qsel.slice(); state.qinitialized = true; }
    state.qall = !!s.qall;
    show('result'); renderResult();
    if (s.paid) { renderReport(); setTimeout(() => { const t = $('#report'); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }, 80); }
  }
  function domainKo(domain) { const pid = state.mode === 'mbti' ? 'mbti' : state.persona && state.persona.id; return (QB.PERSONA_DOMAIN_KO || {})[pid] || QB.DOMAIN_KO[domain]; }

  // ───── 1. 캐릭터 소개 / MBTI 사주 소개 ─────
  function renderPersonaIntro() {
    const p = state.persona;
    $('#pintro').innerHTML = `
      <div class="pintro-hero">
        <div class="pintro-art" id="pintro-art">${bgLayersHTML(p)}<div class="halo"></div>${artHTML(p, 'full')}</div>
        <div class="pintro-body">
          <div class="eyebrow">${p.role}${p.org ? ' · ' + p.org : ''}</div>
          <h2>${p.name}</h2>
          <p class="hero tagline" style="padding:0">${p.tagline}</p>
          <p class="pvoice">${p.voice}</p>
          <h3>이 캐릭터가 보는 명식</h3>
          <ul>${p.sees.map(s => `<li>${s}</li>`).join('')}</ul>
          <div class="formula small"><span><b>${p.name}</b><small>캐릭터 하나</small></span><i>×</i><span><b>내 명식</b><small>하나</small></span><i>×</i><span><b>리포트</b><small>하나</small></span></div>
          <div class="pricebox"><div>무료 · 3줄 결과 + 캐릭터 시트 + 오행·십신</div><div>심층 · ${P.fill(p.report.title, { seunNext: new Date().getFullYear() + 1 })} <b>${won(p.report.price)}</b> · 결론 1화면 + 쉬운 설명 7장 + 근거${p.tier === 'expert' ? ' + 질문 90개 답 전부 + 근거 카드 + 용어표' : ''}</div></div>
          <div class="actions"><button type="button" class="btn primary block" id="btn-persona-next">${p.name}에게 보이기</button><button type="button" class="btn ghost block" data-back="home">← 다른 캐릭터 보기</button></div>
        </div>
      </div>`;
    bindNav(); bindParallax($('#pintro-art'));
  }
  function renderMbtiIntro() {
    $('#pintro').innerHTML = `
      <div class="pintro-hero">
        <div class="pintro-art"><div class="halo"></div><div class="mbti-intro-letters"><span>E</span><span>N</span><span>F</span><span>P</span></div></div>
        <div class="pintro-body">
          <div class="eyebrow">별도 상품</div>
          <h2>MBTI 사주</h2>
          <p class="hero tagline" style="padding:0">내가 아는 나(검사), 타고난 나(타고난 결), 되고 싶은 나(추구)를 네 축으로 나란히 놓아요.</p>
          <h3>이 상품이 보는 것</h3>
          <ul><li>타고난 결(다섯 힘·다섯 기운 비율)이 가리키는 성향 네 글자와 축별 강도</li><li>검사 결과와 축별 일치·불일치, 그 간격의 의미</li><li>추구하는 MBTI까지 넣으면: 축별로 유지·회복·역행 판정과 <b>사주가 권하는 흐름</b>, 그쪽으로 가려면 명식의 어떤 기운을 쓰는지</li><li>환경이 만든 모습과 기질을 구분하는 4주 실험</li></ul>
          <div class="pricebox"><div>무료 · 축별 비교 카드 + 명식 추정 근거</div><div>심층 · ${MBTI_PRODUCT.title} <b>${won(MBTI_PRODUCT.price)}</b></div></div>
          <p class="note">사주와 MBTI 사이에 검증된 대응 관계는 없어요. 다섯 힘과 다섯 기운의 비율을 네 축에 옮긴 공개 규칙으로, 자기 인식과 타고난 결을 나란히 보는 도구예요.</p>
          <div class="actions"><button type="button" class="btn primary block" id="btn-persona-next">내 명식으로 비교하기</button><button type="button" class="btn ghost block" data-back="home">← 처음으로</button></div>
        </div>
      </div>`;
    bindNav();
  }
  function bindNav() {
    const nx = $('#btn-persona-next'); if (nx) nx.onclick = () => { prepForm(); show('form'); };
    $$('[data-back]').forEach(b => { b.onclick = () => { if (b.dataset.back === 'persona' && state.mode === 'mbti') renderMbtiIntro(); show(b.dataset.back); }; });
  }

  // ───── 2. 입력 ─────
  function mbtiPickHTML(prefix) {
    return M.AXES.map(a => `<div class="seg mini"><label><input type="radio" name="${prefix}_${a.id}" value="${a.left}"><span>${a.left} <small>${a.leftKo}</small></span></label><label><input type="radio" name="${prefix}_${a.id}" value="${a.right}"><span>${a.right} <small>${a.rightKo}</small></span></label></div>`).join('') + `<button type="button" class="btn ghost mbti-clear" data-prefix="${prefix}">선택 지우기</button>`;
  }
  function readMBTI(scope, prefix) { const l = M.AXES.map(a => { const el = scope.querySelector(`input[name="${prefix}_${a.id}"]:checked`); return el ? el.value : ''; }).join(''); return l.length === 4 ? l : null; }
  function setMBTI(scope, prefix, letters) { M.AXES.forEach((a, i) => $$(`input[name="${prefix}_${a.id}"]`, scope).forEach(r => { r.checked = !!letters && r.value === letters[i]; })); }
  function prepForm() {
    const mb = state.mode === 'mbti';
    $('#mbti-field').hidden = !mb; $('#goal-field').hidden = !mb;
    $('#form-eyebrow').textContent = mb ? 'MBTI 사주 · 정보' : `${state.persona.name} · 정보`;
    $('#form-title').textContent = mb ? '생년월일시와 평소 MBTI, 추구하는 MBTI를 알려 주세요' : '생년월일시를 알려 주세요';
    $('#mbti-field-label').textContent = '평소 검사에서 나오는 MBTI (필수)';
    $('#btn-submit').textContent = mb ? '명식과 비교하기' : '명식 펼치기';
    $('#form-error').hidden = true;
  }
  function readForm() {
    const f = $('#birth'); const err = (m) => { $('#form-error').textContent = m; $('#form-error').hidden = false; return null; };
    const v = readYMD(f); if (v.error) { if (v.el) v.el.focus(); return err(v.error); }
    const [y, m, d] = [v.year, v.month, v.day];
    const hourUnknown = f.hourUnknown.checked; let hour = 12, minute = 0;
    if (!hourUnknown) { const t = readHM(f); if (t.error) { if (t.el) t.el.focus(); return err(t.error); } hour = t.hour; minute = t.minute; }
    const mbti = readMBTI(f, 'mbti'); const goal = readMBTI(f, 'goal');
    if (state.mode === 'mbti' && !mbti) return err('MBTI 네 축을 모두 선택해 주세요.');
    if (state.mode === 'mbti' && M.AXES.some(a => f.querySelector(`input[name="goal_${a.id}"]:checked`)) && !goal) return err('추구하는 MBTI는 네 축을 모두 고르거나, 전부 비워 주세요.');
    $('#form-error').hidden = true;
    return { name: f.name.value.trim(), year: y, month: m, day: d, hour, minute, hourUnknown, gender: f.gender.value, solarCorrectionMin: f.solar.checked ? -30 : 0, mbti, goal };
  }
  function fillSample() { const f = $('#birth'); f.name.value = '지민'; f.date.value = '1991-11-03'; f.time.value = '06:20'; f.by.value = '1991'; f.bm.value = '11'; f.bd.value = '03'; f.bh.value = '06'; f.bmi.value = '20'; f.hourUnknown.checked = false; f.time.disabled = f.bh.disabled = f.bmi.disabled = false; $$('input[name=gender]', f).forEach(r => r.checked = r.value === 'F'); f.solar.checked = true; setMBTI(f, 'mbti', 'INFJ'); setMBTI(f, 'goal', 'ENTJ'); }

  /** 년/월/일·시/분 숫자칸: 다 채우면 다음 칸으로 */
  function bindYMD(rootEl) { rootEl.querySelectorAll('.ymd').forEach(g => { const ins = [...g.querySelectorAll('input')]; ins.forEach((inp, i) => { inp.addEventListener('input', () => { const v = inp.value.replace(/\D/g, ''), max = +inp.maxLength || 4; inp.value = v.slice(0, max); let rest = v.slice(max), j = i; while (rest && ins[j + 1]) { j++; const mx = +ins[j].maxLength || 2; ins[j].value = rest.slice(0, mx); rest = rest.slice(mx); } if (v.length >= max && ins[i + 1]) ins[Math.min(j + 1, ins.length - 1)].focus(); }); inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) ins[i - 1].focus(); }); }); }); }
  /** 달력/시계 선택(기본)과 숫자 직접 입력 사이 전환. 한 번 고른 방식은 기기에 기억한다. */
  function entryManual(rootEl, kind) { const y = rootEl.querySelector(`.ymd[data-kind="${kind}"]`); return !!(y && !y.hidden); }
  function bindEntryToggle(rootEl) {
    rootEl.querySelectorAll('[data-entry]').forEach(btn => {
      const kind = btn.dataset.entry;
      const apply = (manual, focus) => { const y = rootEl.querySelector(`.ymd[data-kind="${kind}"]`), p = rootEl.querySelector(`.pick[data-kind="${kind}"]`); if (!y || !p) return; y.hidden = !manual; p.hidden = manual; btn.textContent = manual ? (kind === 'date' ? '달력으로 고르기' : '시계로 고르기') : '직접 입력하기'; try { localStorage.setItem('saju.entry.' + kind, manual ? 'manual' : 'picker'); } catch (e) { /* 무시 */ } if (focus) { const f = (manual ? y : p).querySelector('input'); if (f) setTimeout(() => f.focus(), 30); } };
      let pref = null; try { pref = localStorage.getItem('saju.entry.' + kind); } catch (e) { /* 무시 */ }
      apply(pref === 'manual', false);
      btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); apply(!entryManual(rootEl, kind), true); });
    });
  }
  function readYMD(rootEl) {
    if (!entryManual(rootEl, 'date')) {
      const f = rootEl.querySelector('.pick[data-kind="date"] input'); if (!f || !f.value) return { error: '생년월일을 골라 주세요. 달력이 불편하면 "직접 입력하기"를 눌러 주세요.', el: f };
      if (!f.validity.valid) return { error: '1900~2030년의 올바른 양력 날짜를 골라 주세요.', el: f };
      const [y, m, d] = f.value.split('-').map(Number); return { year: y, month: m, day: d };
    }
    const yEl = rootEl.querySelector('#vn-y, #by'); const y = +yEl.value, m = +rootEl.querySelector('#vn-m, #bm').value, d = +rootEl.querySelector('#vn-d, #bd').value;
    if (!y || !m || !d) return { error: '년, 월, 일을 모두 숫자로 넣어 주세요.', el: yEl };
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (y < 1900 || y > 2030 || dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return { error: '1900~2030년의 실제 있는 양력 날짜를 넣어 주세요.', el: yEl };
    return { year: y, month: m, day: d };
  }
  function readHM(rootEl) {
    if (!entryManual(rootEl, 'time')) {
      const f = rootEl.querySelector('.pick[data-kind="time"] input'); if (!f || !f.value || !f.validity.valid) return { error: '시각을 고르거나 "몰라요"를 눌러 주세요. 불편하면 "직접 입력하기"로 숫자를 넣어도 돼요.', el: f };
      const [hh, mm] = f.value.split(':').map(Number); return { hour: hh, minute: mm };
    }
    const hEl = rootEl.querySelector('#vn-h, #bh'), mEl = rootEl.querySelector('#vn-mi, #bmi'); const h = hEl.value.trim(), mi = mEl.value.trim();
    if (h === '') return { error: '시각을 넣거나 "몰라요"를 눌러 주세요.', el: hEl };
    const hour = +h, minute = mi === '' ? 0 : +mi;
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) return { error: '시는 0~23 사이로 넣어 주세요(오후 5시 → 17).', el: hEl };
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) return { error: '분은 0~59 사이로 넣어 주세요.', el: mEl };
    return { hour, minute };
  }
  const birthFields = { bindYMD, readYMD, readHM, bindEntryToggle, entryManual };

  // ───── 3. 리딩 ─────
  function runReading(done) {
    const who = state.mode === 'mbti' ? 'MBTI 사주가' : `${state.persona.name}이(가)`;
    const phases = ['만세력으로 년·월·일·시주를 세우는 중', '오행과 십신의 균형을 재는 중', state.mode === 'mbti' ? '네 축의 기울기를 계산하는 중' : '대운과 세운, 열두 달을 겹치는 중', `${who} 해석을 고르는 중`];
    $('#phases').innerHTML = phases.map(p => `<div>${p}</div>`).join('');
    $('#summon-art').innerHTML = state.mode === 'mbti' ? `<div class="big-letters">${state.input.mbti.split('').map(c => `<span>${c}</span>`).join('')}</div>` : artHTML(state.persona, 'full');
    const stage = $('#reading-stage'); stage.innerHTML = state.mode === 'mbti' ? '' : bgLayersHTML(state.persona);
    const items = $$('#phases div'); let i = 0;
    const step = () => { items.forEach((el, k) => { el.classList.toggle('on', k === i); el.classList.toggle('done', k < i); }); $('#phase').textContent = phases[i]; i++; if (i < phases.length) setTimeout(step, reduced ? 10 : 750); else setTimeout(done, reduced ? 10 : 800); };
    step();
  }

  // ───── 4. 시트 공통 조각 ─────
  function pillarsHTML(r, compact) {
    const order = [r.hour, r.day, r.month, r.year].filter(Boolean);
    const godOf = (p, where) => { const g = r.tenGods.find(t => t.at === p.name + ' ' + where); return g ? plainS(g.name) : (p.name === '일주' && where === '천간' ? (PL() && PL().on ? '나' : '일간(나)') : ''); };
    return `<div class="pillars ${order.length === 3 ? 'three' : ''}">${order.map(p => `<div class="pillar ${p.name === '일주' ? 'me' : ''}"><div class="pn">${p.name}</div>${compact ? '' : `<div class="god">${godOf(p, '천간')}</div>`}<div class="hz el-${p.stemElem}">${p.stem}</div><div class="hz el-${p.branchElem}">${p.branch}</div>${compact ? '' : `<div class="god">${godOf(p, '지지')}</div>`}<div class="ko">${p.ko}</div></div>`).join('')}</div>`;
  }
  function radarSVG(r) {
    const cx = 130, cy = 132, Rr = 92, n = 5; const max = Math.max(3, ...S.ELEMENTS.map(e => r.elements[e]));
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n; const pt = (i, k) => [cx + Rr * k * Math.cos(ang(i)), cy + Rr * k * Math.sin(ang(i))];
    const ring = k => S.ELEMENTS.map((_, i) => pt(i, k).map(v => v.toFixed(1)).join(',')).join(' ');
    const vals = S.ELEMENTS.map(e => r.elements[e] / max); const poly = S.ELEMENTS.map((_, i) => pt(i, vals[i]).map(v => v.toFixed(1)).join(',')).join(' '); const top = r.sortedElems[0];
    return `<svg class="radar" viewBox="0 0 260 264" role="img" aria-label="오행 분포">${[.25, .5, .75, 1].map(k => `<polygon class="grid" points="${ring(k)}"/>`).join('')}${S.ELEMENTS.map((_, i) => { const [x, y] = pt(i, 1); return `<line class="axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('')}<polygon class="area" points="${poly}"/>${S.ELEMENTS.map((e, i) => { const [x, y] = pt(i, vals[i]); return `<circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"><title>${e} ${S.ELEM_KO[e]}: ${r.elements[e]}/${r.totalChars}</title></circle>`; }).join('')}${S.ELEMENTS.map((e, i) => { const [x, y] = pt(i, 1.24); const dy = i === 0 ? -4 : 4; return `<text class="lbl hz" x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="middle">${e}</text><text class="lbl" x="${x.toFixed(1)}" y="${(y + dy + 13).toFixed(1)}" text-anchor="middle">${S.ELEM_KO[e]} ${P.elementWords[e].split('·')[0]}</text>`; }).join('')}${(() => { const i = S.ELEMENTS.indexOf(top); const [x, y] = pt(i, vals[i]); return `<text class="val" x="${(x + 8).toFixed(1)}" y="${(y - 6).toFixed(1)}">${r.elements[top]}</text>`; })()}</svg>`;
  }
  function statsHTML(r) { const tot = r.tenGods.length || 1; return `<div class="stats">${S.TEN_GOD_GROUPS.map(g => `<div class="stat"><div class="nm"><b>${P.groupStats[g]}</b><small>${g}</small></div><div class="bar"><i data-w="${Math.round(r.groups[g] / tot * 100)}"></i></div><div class="v">${r.groups[g]}</div></div>`).join('')}</div>`; }
  function typewrite(el, text, done) {
    if (reduced) { el.textContent = text; done && done(); return; }
    el.innerHTML = '<span></span><i class="caret"></i>'; const span = el.firstChild; let i = 0; let tick = 0;
    const port = $('#portrait'); if (port) port.classList.add('talking');
    const step = () => { span.textContent = text.slice(0, ++i); if (i % 6 === 0) setFace((tick++ % 2) ? 'talk' : 'neutral'); if (i < text.length) setTimeout(step, 28); else { const c = el.querySelector('.caret'); if (c) c.remove(); if (port) port.classList.remove('talking'); setFace('neutral'); done && done(); } };
    step();
  }
  function evidence(r) {
    $('#kv').innerHTML = `<dt>사주 연도</dt><dd>${r.sajuYear}년 ${r.year.ko}년 (${r.year.animal})</dd><dt>가장 강한 기운</dt><dd>${plainT(r.strongestGroup + ' · ' + P.groupDesc[r.strongestGroup], new Set())}</dd><dt>가장 약한 기운</dt><dd>${plainT(r.weakestGroup + ' · ' + P.groupDesc[r.weakestGroup], new Set())}</dd><dt>보정</dt><dd>${r.notes.length ? r.notes.join(' / ') : '없음'}</dd>`;
    $('#gods').innerHTML = `<table class="gods"><thead><tr><th>자리</th><th>글자</th><th>십신</th><th>그룹</th></tr></thead><tbody>${r.tenGods.map(t => `<tr><td>${t.at}</td><td class="el-${S.STEM_ELEM[S.STEMS.indexOf(t.char)] || S.BRANCH_ELEM[S.BRANCHES.indexOf(t.char)]}">${t.char}</td><td>${plainT(t.name, new Set())}</td><td>${plainT(t.group, new Set())}</td></tr>`).join('')}</tbody></table>`;
  }
  function birthString() { const i = state.input; return `${i.year}.${String(i.month).padStart(2, '0')}.${String(i.day).padStart(2, '0')} ${i.hourUnknown ? '시간 모름' : String(i.hour).padStart(2, '0') + ':' + String(i.minute).padStart(2, '0')} · ${i.gender === 'M' ? '남' : '여'}`; }

  // ───── 4-A. 캐릭터 시트 ─────
  function renderResult() {
    const r = state.result; state.unlocked = false; $('#report').hidden = true; $('#teaser').hidden = false; $('#report').innerHTML = '';
    $('#pillars').innerHTML = pillarsHTML(r, false); $('#radar').innerHTML = radarSVG(r); $('#stats').innerHTML = statsHTML(r); evidence(r);
    requestAnimationFrame(() => setTimeout(() => $$('#stats .bar i').forEach(i => i.style.width = i.dataset.w + '%'), 60));
    renderQPick(); saveSnap();
    if (state.mode === 'mbti') return renderMbtiResult();
    const p = state.persona, rd = state.reading, cls = P.classNames[r.day.stem];
    $('#result-eyebrow').textContent = '캐릭터 시트'; $('#mbti-card').hidden = true; $('#lines-card').hidden = false; $('#btn-cross').hidden = false; $('#btn-again').textContent = '다른 캐릭터로 같은 명식 보기';
    $('#sheet-head').innerHTML = `<img class="head-bg" src="${ART}${p.id}/bg_header.png" alt="" onerror="this.remove()"><div class="portrait" id="portrait">${artHTML(p, 'face')}</div><div><div class="who">${p.name} · ${state.input.name || '당신'}의 명식</div><div class="cls">${cls}</div><div class="sub">${plainT(`${r.day.stemKo}${r.dayMaster.elementKo}(${r.day.stem}) 일간`, new Set())} · ${r.dayMaster.polarity}${S.ELEM_KO[r.dayMaster.element]} · ${P.elementWords[r.dayMaster.element]}</div><div class="formula small"><span><b>${p.name}</b><small>캐릭터</small></span><i>×</i><span><b>${state.input.name || '당신'}</b><small>명식</small></span><i>×</i><span><b>리포트 1</b><small>심층</small></span></div></div><div class="bubble" id="bubble"></div>`;
    const lines = $('#lines'); lines.innerHTML = '';
    const cc = $('#compat-card'); const cp = compatResult(); if (cp) { cc.hidden = false; cc.innerHTML = compatCardHTML(cp); } else cc.hidden = true;
    const title = P.fill(p.report.title, { seunNext: r.seun[1].year });
    const rep = state.report || (state.report = buildReport());
    $('#teaser-title').textContent = title; $('#teaser-meta').textContent = `${p.name}의 ${p.tier === 'expert' ? '전문가 종합' : '고민 특화'} 풀이 · 결론 1화면 + 쉬운 설명 ${rep.L2.length}장 + 근거`;
    $('#price').innerHTML = `${won(p.report.price)}<small>1회 · 즉시 발행</small>`;
    $('#teaser-l1').innerHTML = UI.teaserHTML(rep);
    const faces = ['neutral', 'smile', 'serious']; const seen = new Set();
    typewrite($('#bubble'), plainT(rd.greeting, seen), () => { rd.lines.forEach((t, i) => setTimeout(() => { setFace(faces[i]); const d = document.createElement('div'); d.className = 'line appear'; d.innerHTML = `<span class="n">${i + 1}</span><span>${plainT(t, seen)}</span>`; lines.appendChild(d); if (i === rd.lines.length - 1) setTimeout(() => { const d2 = document.createElement('p'); d2.className = 'muted'; d2.textContent = plainT(rd.close, seen); lines.appendChild(d2); setFace('neutral'); }, reduced ? 0 : 500); }, reduced ? 0 : 420 * (i + 1))); });
  }

  // ───── 4-B. MBTI 사주 결과 ─────
  function mbtiCardHTML(est, cmp, test, adv) {
    const letters = (type, other) => type.split('').map((ch, i) => `<span class="${other && other[i] !== ch ? 'miss' : ''}">${ch}</span>`).join('');
    const strengthWord = pct => pct < 56 ? '경계' : pct >= 75 ? '뚜렷' : '보통';
    const axisRow = (a, i) => { const t = test ? test[i] : null; const g = adv ? adv.goal[i] : null; const w = Math.abs(a.pct - 50); const fill = a.pct >= 50 ? `left:${50 - w}%;width:${w}%` : `left:50%;width:${w}%`; return `<div class="axis"><div class="l ${a.letter === a.left ? 'on' : ''}">${a.left}<small>${a.leftKo}</small></div><div class="track"><div class="fill" style="${fill}"></div>${t ? `<div class="test" style="left:${t === a.left ? '5%' : '95%'}" title="검사 ${t}">${t}</div>` : ''}${g ? `<div class="goal" style="left:${g === a.left ? '18%' : '82%'}" title="추구 ${g}">★</div>` : ''}</div><div class="r ${a.letter === a.right ? 'on' : ''}">${a.right}<small>${a.rightKo}</small></div><div class="meta"><span>타고난 결 <b>${a.letter}</b> · ${strengthWord(a.letterPct)}</span>${t ? `<span class="${t === a.letter ? 'ok' : 'ng'}">검사 ${t} · ${t === a.letter ? '같은 방향' : '다른 방향'}</span>` : ''}${g ? `<span class="${g === a.letter ? 'ok' : 'ng'}">추구 ${g} · ${adv.axes[i].verdict}</span>` : ''}</div></div>`; };
    const sameWord = n => n === 4 ? '네 축 모두 같은 방향' : n === 0 ? '네 축 모두 다른 방향' : `네 축 중 ${n}축 같은 방향`;
    return `<div class="eyebrow">${adv ? '검사 · 타고난 결 · 추구, 세 글자 맞대기' : '네 축 비교'}</div><div class="mbti-head">${test ? `<div class="mbti-type">${letters(test, est.letters)}<small>내가 아는 나 · 검사</small></div><div class="mbti-vs">vs</div>` : ''}<div class="mbti-type">${letters(est.letters, test)}<small>타고난 나 · 타고난 결</small></div>${adv ? `<div class="mbti-vs">vs</div><div class="mbti-type goal">${letters(adv.goal, est.letters)}<small>되고 싶은 나 · 추구</small></div>` : ''}${test ? `<div class="chip accent">검사와 ${sameWord(cmp.matches)}</div>` : ''}${adv ? `<div class="chip accent">추구와 ${sameWord(adv.same)}</div>` : ''}</div><div class="axes">${est.axes.map(axisRow).join('')}</div>${adv ? `<div class="advice"><div class="rec">사주가 권하는 흐름 <b>${adv.rec}</b></div><p class="sum">${adv.summary}</p>${adv.axes.map(x => `<div class="row-a"><b class="v">${x.left}/${x.right} · ${x.verdict}</b> <span class="muted">검사 ${x.test || '-'} · 타고난 결 ${x.chart}(${strengthWord(x.chartPct)}) · 추구 ${x.goal}</span><br>${x.text}</div>`).join('')}</div>` : ''}${cmp ? `<div class="mbti-lines"><p><b>${cmp.summary}</b></p>${cmp.axes.map(x => `<p><b>${x.test}→${x.chart}</b> ${x.text}</p>`).join('')}</div>` : ''}<details class="why"><summary>왜 이렇게 나왔나요?</summary><ul>${est.axes.map(a => `<li><b>${a.left}/${a.right}</b> → ${a.letter}(${strengthWord(a.letterPct)}). ${a.factors.map(f => `${f.label}은 ${f.v > 0 ? a.left : a.right} 쪽`).join(', ')}. <span class="muted">${a.note}</span></li>`).join('')}</ul><p class="muted">사주와 MBTI 사이에 검증된 대응 관계는 없어요. 위 규칙은 다섯 힘과 다섯 기운의 비율을 네 축에 옮긴 공개 규칙이에요. 검사(자기 인식)와 타고난 결(기질)을 나란히 놓고 보는 도구예요.</p></details>`;
  }
  function renderMbtiResult() {
    const r = state.result; const est = M.estimate(r); const cmp = M.compare(state.input.mbti, est); const adv = M.advise(est, state.input.mbti, state.input.goal); state.est = est; state.cmp = cmp; state.adv = adv;
    $('#result-eyebrow').textContent = 'MBTI 사주 · 결과'; $('#lines-card').hidden = true; $('#btn-cross').hidden = true; $('#btn-again').textContent = '캐릭터에게 같은 사주 보이기';
    $('#sheet-head').innerHTML = `<div class="mbti-hero"><div class="mbti-type" style="font-size:34px">${cmp.test}<small>검사</small></div><div class="mbti-vs">vs</div><div class="mbti-type" style="font-size:34px">${est.letters}<small>타고난 결</small></div>${adv ? `<div class="mbti-vs">vs</div><div class="mbti-type goal" style="font-size:34px">${adv.goal}<small>추구</small></div>` : ''}<div class="chip accent">${adv ? `사주가 권하는 흐름 ${adv.rec}` : `네 축 중 ${cmp.matches}축 같은 방향`}</div></div><div class="bubble" id="bubble">${plainT(adv ? adv.summary : cmp.summary, new Set())}</div>`;
    $('#mbti-card').hidden = false; $('#mbti-card').innerHTML = plainH(mbtiCardHTML(est, cmp, cmp.test, adv), new Set());
    const rep = state.report || (state.report = buildReport());
    $('#teaser-title').textContent = MBTI_PRODUCT.title; $('#teaser-meta').textContent = (adv ? '추구 MBTI로 가는 길 + ' : '') + `세 글자 맞대기 · 결론 1화면 + 쉬운 설명 ${rep.L2.length}장 + 근거`;
    $('#price').innerHTML = `${won(MBTI_PRODUCT.price)}<small>1회 · 즉시 발행</small>`; $('#teaser-l1').innerHTML = UI.teaserHTML(rep);
  }

  // ───── 5. 심층 리포트(장문) ─────
  // ───── 질문 10개 고르기 ─────
  function qDomain() { return state.mode === 'mbti' ? 'mbti' : (QB.PERSONA_DOMAIN[state.persona ? state.persona.id : 'master'] || 'master'); }
  function qFacts() {
    if (state.qfacts) return state.qfacts;
    const r = state.result; const est = state.mode === 'mbti' || state.input.mbti ? (state.est || M.estimate(r)) : null; const cmp = est && state.input.mbti ? (state.cmp || M.compare(state.input.mbti, est)) : null; const adv = est && state.input.goal ? (state.adv || M.advise(est, state.input.mbti, state.input.goal)) : null;
    state.qfacts = QB.facts(r, { name: state.input.name || '나', compat: compatResult(), compatPr: state.compat ? state.compat.pr : null, parent: state.parent || null, est, cmp, adv });
    return state.qfacts;
  }
  function qList() { return QB.list(qDomain(), qFacts()); }
  function renderQPick() {
    const box = $('#qpick'); if (!box || !QB) return; const domain = qDomain(); const items = qList(); const F = qFacts();
    const available = Math.min(10, items.filter(it => !it.locked).length);
    const coreIds = QB.core(domain, state.concern, F, state.situation);
    if (!state.qinitialized) { state.qsel = coreIds.slice(); state.qinitialized = true; }
    const sel = new Set(state.qsel); const core = items.filter(it => coreIds.includes(it.id)); const rest = items.filter(it => !coreIds.includes(it.id));
    const moreOpen = rest.some(it => sel.has(it.id));
    const row = it => `<label class="qitem ${it.locked ? 'locked' : ''} ${sel.has(it.id) ? 'on' : ''}"><input type="checkbox" data-q="${it.id}" ${sel.has(it.id) ? 'checked' : ''} ${it.locked ? 'disabled' : ''}><span class="qn">${String(it.n).padStart(2, '0')}</span><span class="qt">${it.q.replace(/^★\s*/, '')}${it.star ? ' <i class="star">★</i>' : ''}${it.locked ? `<small>${it.locked}</small>` : ''}</span></label>`;
    const concern = state.concernLabel ? `<span class="chip accent">${state.concernLabel}</span>${state.situationLabel ? `<span class="chip">${state.situationLabel}</span>` : ''}` : '';
    box.hidden = false;
    box.innerHTML = `<div class="eyebrow">내 질문 · ${domainKo(domain)}</div><div class="qpick-head"><h3>${concern ? `${concern}<br>${state.situationLabel ? '고민과 지금 상황에 맞춰' : '고민에 맞춰'} ${core.length}개를 먼저 골라 뒀어요` : `핵심 질문 ${core.length}개를 먼저 골라 뒀어요`}</h3><span class="qcount"><b id="qcount">${sel.size}</b>/${available}<small>${available}개까지 같은 가격</small></span></div><p class="muted">${isExpert() ? '정경진 종합 풀이는 결제하면 30개 전부 답하고, 연인·재물·이직 질문 60개까지 함께 열려요(추가 결제 없음). 먼저 읽고 싶은 질문만 골라 두세요.' : `기본 가격에 질문 ${available}개까지 들어가요. 이대로 열어도 되고, 아래에서 ${available}개까지 더 골라도 값은 같아요. 안 고른 질문은 리포트 안에서 +₩5,000에 한 번에 열 수 있어요.`}</p>${available < 10 ? `<p class="note" role="status">현재 입력으로 답할 수 있는 질문은 ${available}개예요. 잠긴 질문은 추가 정보가 필요해요. 표시된 상품 가격은 동일하므로 제공 범위를 확인해 주세요.</p>` : ''}<div class="qlist qcore">${core.map(row).join('')}</div><details class="qmore" ${moreOpen ? 'open' : ''}><summary><b>더 고르기</b><span id="qmore-sub">남은 자리 ${Math.max(0, available - sel.size)}개 · 질문 ${rest.length}개 더</span></summary><div class="qtools"><button type="button" class="btn" id="btn-qauto">추천 ${available}개로 채우기</button><button type="button" class="btn ghost" id="btn-qcore">핵심만</button><button type="button" class="btn ghost" id="btn-qclear">비우기</button></div><div class="qlist">${rest.map(row).join('')}</div></details>`;
    const sync = () => { const n = state.qsel.length; $('#qcount').textContent = n; const ms = $('#qmore-sub'); if (ms) ms.textContent = `남은 자리 ${Math.max(0, available - n)}개 · 질문 ${rest.length}개 더`; renderQSample(); saveSnap(); $$('#qpick .qitem').forEach(l => l.classList.toggle('on', state.qsel.includes(l.querySelector('input').dataset.q))); const pay = $('#btn-pay'); if (pay) { pay.disabled = n === 0; pay.textContent = n ? (state.unlocked ? `고른 질문 ${n}개로 다시 보기` : `고른 질문 ${n}개 답 보기${n < available ? ` · ${available}개까지 같은 값` : ''}`) : '질문을 골라 주세요'; } };
    $$('#qpick input[data-q]').forEach(cb => cb.addEventListener('change', () => { const id = cb.dataset.q; if (cb.checked) { if (state.qsel.length >= 10) { cb.checked = false; box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); return; } state.qsel.push(id); } else state.qsel = state.qsel.filter(x => x !== id); state.report = null; sync(); if (state.unlocked) { clearTimeout(state.rerenderT); state.rerenderT = setTimeout(() => renderReport(), 250); } }));
    $('#btn-qauto').addEventListener('click', () => { state.qsel = QB.recommend(domain, F, 10); state.report = null; renderQPick(); if (state.unlocked) renderReport(); });
    $('#btn-qcore').addEventListener('click', () => { state.qsel = coreIds.slice(); state.report = null; renderQPick(); if (state.unlocked) renderReport(); });
    $('#btn-qclear').addEventListener('click', () => { state.qsel = []; state.report = null; renderQPick(); if (state.unlocked) renderReport(); });
    sync();
  }
  function renderQSample() {
    const box = $('#qsample'); if (!box) return; const domain = qDomain(), F = qFacts(); const items = qList(); const first = state.qsel.map(id => items.find(it => it.id === id)).find(it => it && !it.locked);
    if (!first) { box.hidden = true; return; }
    const a = QB.answer(domain, first.n, F); const others = state.qsel.length - 1;
    box.hidden = false; box.innerHTML = `<div class="eyebrow">맛보기 · ${state.situationLabel ? `'${state.situationLabel}' 상황에 맞춘 첫 답` : '고른 질문 중 첫 번째 답'}</div><div class="qa"><div class="qq"><span class="qn">Q${String(a.n).padStart(2, '0')}</span><b>${a.q.replace(/^★\s*/, '')}</b></div><div class="qa-a">${(a.text.match(/[^.!?]+[.!?]?/g) || [a.text]).map(x => `<p>${x.trim()}</p>`).join('')}</div></div>${others > 0 ? `<p class="muted" style="margin:8px 0 0">나머지 ${others}개 답도 이렇게 바로 결론부터 말해요. 결제하면 결론 화면과 근거까지 함께 열려요.</p>` : ''}`;
  }
  function crossBlock() {
    if (!QB) return []; const me = state.mode === 'mbti' ? 'mbti' : state.persona.id; const F = qFacts();
    const pri = { flame: ['sage', 'master', 'mbti'], sage: ['hunter', 'flame', 'master'], hunter: ['sage', 'mbti', 'master'], granny: ['master', 'sage', 'flame'], child: ['master', 'granny', 'flame'], master: ['child', 'mbti', 'granny'], mbti: ['flame', 'hunter', 'master'] }[me] || ['master'];
    return QB.hooks(F, me).filter(h => pri.includes(h.id)).sort((a, b) => pri.indexOf(a.id) - pri.indexOf(b.id)).slice(0, 3).map(h => { const p = P.personas[h.id]; return Object.assign(h, p ? { name: p.name, role: p.role, accent: p.palette.accent, face: artHTML(p, 'face') } : { name: '도윤 선생님', role: 'MBTI 사주', accent: '#66d6c5', face: `<img src="${ART}mbti/face.png" alt="">` }); });
  }
  // ───── 전문가(정경진) 상품: 전 영역 질문 답 + 근거 카드 + 용어표 ─────
  const GLOSS = [['비겁', '나 자신의 힘', '나와 같은 기운. 자립·경쟁·고집'], ['식상', '내보내는 힘', '말·손·아이디어로 꺼내는 기운'], ['재성', '손에 쥐는 힘', '돈·결과·현실을 다루는 기운'], ['관성', '나를 누르는 힘', '규칙·책임·직책·압박'], ['인성', '쉬고 배우는 힘', '배움·보호·휴식·어른 복'], ['신강·신약', '힘이 센 편·약한 편', '일간을 받치는 기운이 많은지 적은지'], ['용신', '채울 기운', '명식의 균형을 맞춰 주는 기운'], ['기신', '피할 기운', '넘치거나 균형을 깨는 기운'], ['격', '인생 무대', '태어난 달의 기운이 정하는 큰 무대'], ['대운', '10년 계절', '열 해마다 바뀌는 큰 흐름'], ['세운', '올해 날씨', '해마다 들어오는 기운'], ['충', '부딪힘', '글자끼리 정면으로 맞서는 관계'], ['합', '끌림', '글자끼리 묶이는 관계'], ['공망', '빈 자리', '힘이 덜 실리는 자리'], ['신살', '특수 표식', '역마·도화·화개 같은 표식'], ['지장간', '숨은 글자', '땅 글자 안에 숨은 하늘 글자'], ['조후', '계절 온도', '태어난 계절의 춥고 더움']];
  function isExpert() { return state.mode === 'persona' && !!state.persona && state.persona.tier === 'expert'; }
  function evidenceHTML(F) {
    const r = F.r; const yong = F.st && F.st.yongshin ? F.st.yongshin.pick : null; const why = F.st && F.st.why ? String(F.st.why[0] || '') : '';
    const cell = (k, v, s) => `<div class="qev-c"><small>${k}</small><b>${v}</b>${s ? `<span>${s}</span>` : ''}</div>`;
    return `<div class="qev"><div class="qev-h">이 답들의 근거 · 원국 한 장</div><div class="qev-grid">${cell('여덟 글자', r.pillars.map(p => `${p.name.replace('주', '')} ${p.hanja}`).join(' · '))}${cell('일간(나)', `${r.day.stem} ${r.day.stemKo}${r.dayMaster.elementKo}`, `${r.dayMaster.polarity}${r.dayMaster.elementKo} · ${F.season}생`)}${cell('판정', `${F.st.label}(${F.st.label === '신강' ? '힘이 센 편' : F.st.label === '신약' ? '힘이 약한 편' : '중간'})`, why)}${cell('격(인생 무대)', F.gyeok)}${cell('용신 후보(채울 기운)', yong ? `${yong} · ${R2.G[yong] || ''}` : '뚜렷하지 않음')}${cell('기신(피할 기운)', `${F.gisin} · ${R2.G[F.gisin] || ''}`)}${cell('다섯 힘 개수', ['비겁', '식상', '재성', '관성', '인성'].map(k => `${k} ${F.g[k]}`).join(' · '))}${cell('신살 · 공망', `${F.sinsal.length ? F.sinsal.map(s => `${s.k}(${s.at})`).join(' · ') : '신살 없음'} · 공망 ${F.gongmang.branches.join('')}`)}</div></div>`;
  }
  function expertExtras(F) {
    const domains = ['love', 'money', 'work'].concat(F.est ? ['mbti'] : []);
    return domains.map(d => { const all = QB.list(d, F); const open = all.filter(x => !x.locked); return { domain: d, ko: QB.DOMAIN_KO[d], answers: open.map(x => QB.answer(d, x.n, F)), locked: all.length - open.length }; }).filter(x => x.answers.length);
  }
  function qaBlock() {
    if (!QB) return null; const domain = qDomain(), F = qFacts(), items = qList(); const expert = isExpert();
    if (expert && state.unlocked) state.qall = true;
    const order = state.qsel.map(id => items.find(it => it.id === id)).filter(it => it && !it.locked); const answers = order.map(it => QB.answer(domain, it.n, F));
    const rest = items.filter(it => !state.qsel.includes(it.id)).map(it => state.qall && !it.locked ? QB.answer(domain, it.n, F) : it);
    const extra = expert && state.qall ? expertExtras(F) : null; const extraN = extra ? extra.reduce((n, x) => n + x.answers.length, 0) : 0;
    const first3 = expert ? answers.slice(0, 3) : null;
    return { first3, title: expert ? `${domainKo(domain)} · 질문 전부` : `${domainKo(domain)} · 내가 고른 질문`, lead: expert && state.qall ? `먼저 고른 ${answers.length}개부터 답하고, 나머지 ${rest.length}개와 다른 영역 ${extraN}개 답도 아래에 전부 열려 있어요.` : `${state.input.name || '당신'}의 명식으로 ${answers.length}개 질문에 답해요.`, answers, rest, all: state.qall, expert, evidence: expert ? evidenceHTML(F) : null, extra, gloss: expert ? GLOSS : null };
  }
  function compatResult() { const c = state.compat; if (!c || !c.pr || !CP || !state.result) return null; if (!c.res) c.res = CP.analyze(state.result, c.pr, { kind: c.kind, nameA: state.input.name || '나', nameB: c.nameB || '상대' }); return c.res; }
  function compatCardHTML(cp) {
    return `<div class="eyebrow">${cp.kindKo} · ${cp.A} × ${cp.B}</div>${UI.compatVizHTML(cp.section.viz)}<p class="chead">${cp.head}</p><ul class="cfacts">${cp.facts.map(f => `<li class="t-${f.tone}">${f.text}</li>`).join('')}</ul>${UI.pairHTML(cp.avoid, cp.instead)}<p class="muted" style="margin:10px 0 0">상대 출생 시각은 받지 않아 년·월·일 세 기둥으로 맞댔어요. 심층 리포트에는 이 궁합이 한 장으로 들어가고 글자 관계표가 근거로 붙어요.</p>`;
  }
  function buildReport() {
    const r = state.result, name = state.input.name || '당신';
    if (state.mode === 'mbti') { const est = state.est || M.estimate(r); const cmp = state.cmp || M.compare(state.input.mbti, est); const adv = state.adv || M.advise(est, state.input.mbti, state.input.goal); return R2.build(r, { kind: 'mbti', name, est, cmp, adv, title: MBTI_PRODUCT.title }); }
    const p = state.persona; return R2.build(r, { persona: p, name, title: P.fill(p.report.title, { seunNext: r.seun[1].year }), compat: compatResult() });
  }
  function planKey() { const i = state.input; return `${i.year}${i.month}${i.day}-${state.mode === 'mbti' ? 'mbti' : state.persona.id}`; }
  function renderReport() {
    const rep = state.report || (state.report = buildReport()); const p = state.persona; state.unlocked = true; if (isExpert()) state.qall = true; saveSnap();
    const face = p ? `<span class="face-chip">${artHTML(p, 'face')}</span>` : state.mode === 'mbti' ? `<span class="face-chip"><span class="art" data-kind="face"><img src="${ART}mbti/face.png" alt="" onerror="this.closest('.face-chip').remove()"></span></span>` : '';
    $('#report').innerHTML = `
      <div class="rtop">
        ${p ? `<img class="head-bg" src="${ART}${p.id}/bg_header.png" alt="" onerror="this.remove()">` : ''}
        <div class="row"><span class="chip accent">${state.mode === 'mbti' ? 'MBTI 사주' : p.name}</span><span class="chip">결론 1화면 · 쉬운 설명 ${rep.L2.length}장 · 근거 ${rep.L3.length}장</span></div>
        <h3 class="rtitle">${rep.title}</h3>
        <div class="formula small"><span><b>${state.mode === 'mbti' ? '도윤 선생님' : p.name}</b><small>캐릭터 하나</small></span><i>×</i><span><b>${state.input.name || '당신'}</b><small>명식 하나</small></span><i>×</i><span><b>이 리포트</b><small>하나</small></span></div>
        <p class="muted">${state.input.name || '당신'} · ${birthString()}</p>
      </div>
      <div class="rwrap">${UI.fullHTML(rep, { personaFace: face, planKey: planKey(), qa: qaBlock(), cross: crossBlock() })}</div>`;
    UI.bind($('#report'), rep);
    $$('#report .cross-card').forEach(b => b.addEventListener('click', () => { const id = b.dataset.vn; if (id === 'mbti') { setMode('mbti'); if (window.SajuVN) return window.SajuVN.start('mbti'); } else { state.mode = 'persona'; setPersona(id); if (window.SajuVN) return window.SajuVN.start(id); } show('home'); }));
    const ub = $('#btn-unlock'); if (ub) ub.addEventListener('click', () => { const rest = qList().filter(it => !state.qsel.includes(it.id) && !it.locked).length; $('#unlock-what').textContent = `남은 ${rest}문항 전체 답변`; $('#m-unlock').hidden = false; });
    $('#teaser').hidden = true; $('#report').hidden = false; state.unlocked = true;
    $('#report').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  // ───── 공유 카드 ─────
  function shareCard() {
    const r = state.result, p = state.persona, rd = state.reading; const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const cs = getComputedStyle(document.documentElement); const accent = cs.getPropertyValue('--p-accent').trim(), accent2 = cs.getPropertyValue('--p-accent2').trim();
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, accent2); g.addColorStop(.55, '#0b0e18'); g.addColorStop(1, '#0b0e18'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const bgImg = state.shareBg; if (bgImg) { x.globalAlpha = .55; x.drawImage(bgImg, 0, 0, W, H); x.globalAlpha = 1; const g2 = x.createLinearGradient(0, 0, 0, H); g2.addColorStop(0, 'rgba(11,14,24,.2)'); g2.addColorStop(.5, 'rgba(11,14,24,.75)'); g2.addColorStop(1, 'rgba(11,14,24,.95)'); x.fillStyle = g2; x.fillRect(0, 0, W, H); }
    x.globalAlpha = .12; for (let i = 0; i < 90; i++) { x.fillStyle = accent; x.beginPath(); x.arc(Math.random() * W, Math.random() * H, Math.random() * 3 + 1, 0, 7); x.fill(); } x.globalAlpha = 1;
    const disp = `'Gowun Batang', 'Noto Serif KR', serif`, body = `'IBM Plex Sans KR', 'Noto Sans KR', sans-serif`;
    x.textAlign = 'center'; x.fillStyle = 'rgba(242,236,220,.75)'; x.font = `500 30px ${body}`; x.fillText(state.mode === 'mbti' ? `MBTI 사주 · ${state.input.name || '당신'}의 명식` : `${p.name}이(가) 읽은 ${state.input.name || '당신'}의 명식`, W / 2, 110);
    x.fillStyle = accent; x.font = `700 300px ${disp}`; x.fillText(r.day.stem, W / 2, 400);
    x.fillStyle = '#f2ecdc'; x.font = `700 72px ${disp}`; x.fillText(P.classNames[r.day.stem], W / 2, 500);
    x.fillStyle = 'rgba(242,236,220,.7)'; x.font = `400 30px ${body}`; x.fillText(`${r.day.stemKo}${r.dayMaster.elementKo} 일간 · ${P.elementWords[r.dayMaster.element]}`, W / 2, 550);
    const est = state.est || M.estimate(r); const tm = state.input.mbti; const cm = tm ? M.compare(tm, est) : null;
    x.fillStyle = accent; x.font = `600 28px ${body}`; const gl = state.input.goal ? M.parse(state.input.goal) : null; x.fillText(`명식 ${est.letters}` + (cm ? `  ·  검사 ${cm.test}` : '') + (gl ? `  ·  추구 ${gl}` : '') + (cm && !gl ? `  ·  ${cm.matches}/4 일치` : ''), W / 2, 594);
    const order = [r.hour, r.day, r.month, r.year].filter(Boolean); const bw = 190, gap = 24, total = order.length * bw + (order.length - 1) * gap, x0 = (W - total) / 2;
    const ec = { 木: cs.getPropertyValue('--e-wood').trim(), 火: cs.getPropertyValue('--e-fire').trim(), 土: cs.getPropertyValue('--e-earth').trim(), 金: cs.getPropertyValue('--e-metal').trim(), 水: cs.getPropertyValue('--e-water').trim() };
    order.forEach((pl, i) => { const bx = x0 + i * (bw + gap), by = 630; x.fillStyle = 'rgba(255,255,255,.06)'; roundRect(x, bx, by, bw, 250, 20); x.fill(); if (pl.name === '일주') { x.strokeStyle = accent; x.lineWidth = 3; roundRect(x, bx, by, bw, 250, 20); x.stroke(); } x.fillStyle = 'rgba(242,236,220,.6)'; x.font = `500 24px ${body}`; x.fillText(pl.name, bx + bw / 2, by + 44); x.font = `700 84px ${disp}`; x.fillStyle = ec[pl.stemElem]; x.fillText(pl.stem, bx + bw / 2, by + 130); x.fillStyle = ec[pl.branchElem]; x.fillText(pl.branch, bx + bw / 2, by + 215); });
    const lines = state.mode === 'mbti' ? (cm ? cm.axes.map(a => `${a.test}→${a.chart} ${a.text.split('.')[0]}.`).slice(0, 3) : []) : rd.lines;
    x.fillStyle = '#f2ecdc'; x.font = `400 32px ${disp}`; x.textAlign = 'left'; let y = 940; lines.forEach((t, i) => { x.fillStyle = accent; x.fillText(String(i + 1), 90, y); x.fillStyle = '#f2ecdc'; y = wrap(x, t, 140, y, W - 230, 46) + 46 + 22; });
    x.textAlign = 'center'; x.fillStyle = 'rgba(242,236,220,.5)'; x.font = `500 26px ${body}`; x.fillText('사주도감 · 캐릭터가 읽는 내 명식', W / 2, H - 60);
    $('#share-img').src = c.toDataURL('image/png'); $('#m-share').hidden = false;
  }
  function roundRect(x, px, py, w, h, r) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }
  function wrap(x, text, px, py, maxW, lh) { let line = '', y = py; for (const ch of Array.from(text)) { const t = line + ch; if (x.measureText(t).width > maxW && line) { x.fillText(line, px, y); line = ch; y += lh; } else line = t; } if (line) x.fillText(line, px, y); return y; }

  // ───── 흐름 연결 ─────
  function compute(input) {
    state.input = input; state.report = null; state.est = null; state.cmp = null; state.adv = null; state.compat = null; state.parent = null; state.compatIn = null; state.parentIn = null; state.concern = null; state.concernLabel = null; state.situation = null; state.situationLabel = null; state.qsel = []; state.qinitialized = false; state.qall = false; state.qfacts = null;
    try { state.result = S.compute(input); } catch (err) { $('#form-error').textContent = '계산에 실패했습니다: ' + err.message; $('#form-error').hidden = false; return false; }
    state.reading = state.mode === 'persona' ? P.generateReading(state.result, state.persona, { name: input.name || '당신' }) : null;
    return true;
  }
  function start() {
    stars(); renderHome(); show('home');
    const pb = $('#btn-plain'); const syncPlain = () => { if (pb) { pb.textContent = PL() && PL().on ? '쉬운 말' : '전문 용어'; pb.classList.toggle('on', !!(PL() && PL().on)); } }; syncPlain();
    if (pb) pb.addEventListener('click', () => { if (!PL()) return; PL().set(!PL().on); syncPlain(); if (!$('#s-result').hidden && state.result) { const wasUnlocked = state.unlocked; renderResult(); if (wasUnlocked) renderReport(); } });
    $('#mbti-pick').innerHTML = mbtiPickHTML('mbti'); $('#goal-pick').innerHTML = mbtiPickHTML('goal');
    $$('.mbti-pick .mbti-clear').forEach(b => b.addEventListener('click', () => setMBTI($('#birth'), b.dataset.prefix, null)));
    $('#btn-love-product').addEventListener('click', () => { state.mode = 'persona'; setPersona('flame'); if (window.SajuVN) { window.SajuVN.start('flame', { concern: 'match' }); return; } renderPersonaIntro(); show('persona'); });
    $('#btn-pair-product').addEventListener('click', () => { state.mode = 'persona'; setPersona('sage'); if (window.SajuVN) { window.SajuVN.start('sage', { concern: 'pair' }); return; } renderPersonaIntro(); show('persona'); });
    $('#birth').addEventListener('submit', e => { e.preventDefault(); const input = readForm(); if (!input || !compute(input)) return; show('reading'); runReading(() => { show('result'); renderResult(); }); });
    $('#hourUnknown').addEventListener('change', e => { ['#time', '#bh', '#bmi'].forEach(id => { $(id).disabled = e.target.checked; }); });
    bindYMD($('#birth')); bindEntryToggle($('#birth'));
    $('#btn-fill-sample').addEventListener('click', fillSample);
    $('#btn-pay').addEventListener('click', () => { const rep = state.report || (state.report = buildReport()); const price = state.mode === 'mbti' ? MBTI_PRODUCT.price : state.persona.report.price; $('#pay-title').textContent = rep.title; $('#pay-what').textContent = isExpert() ? `정통 질문 30개 전부 + 연인·재물·이직 60개 답 + 근거 카드 + 결론·7장·근거(추가 결제 없음)` : `고른 질문 ${state.qsel.length}개 답 + 결론 화면 + 근거`; $('#pay-price').textContent = won(price); $('#pay-size').textContent = `핵심 ${rep.chars.toLocaleString()}자 · 모바일 약 ${rep.screens}화면`; $('#m-pay').hidden = false; });
    $('#btn-pay-confirm').addEventListener('click', () => { $('#m-pay').hidden = true; renderReport(); });
    $('#btn-unlock-confirm').addEventListener('click', () => { $('#m-unlock').hidden = true; state.qall = true; renderReport(); setTimeout(() => { const t = $('#sec-qa .qrest'); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }, 50); });
    $('#btn-share').addEventListener('click', () => { state.shareBg = null; if (state.mode !== 'mbti' && state.persona) { const im = new Image(); im.onload = () => { state.shareBg = im; shareCard(); }; im.onerror = () => shareCard(); im.src = `${ART}${state.persona.id}/bg_card.png`; } else shareCard(); });
    $$('[data-close]').forEach(b => b.addEventListener('click', () => { $('#' + b.dataset.close).hidden = true; }));
    $('#btn-cross').addEventListener('click', () => { setMode('mbti'); if (window.SajuVN) { window.SajuVN.start('mbti'); return; } if (state.input.mbti) { compute(state.input); show('reading'); runReading(() => { show('result'); renderResult(); }); } else { renderMbtiIntro(); prepForm(); show('form'); } });
    $('#btn-again').addEventListener('click', () => { if (state.mode === 'mbti') { state.mode = 'persona'; document.documentElement.dataset.persona = ''; $('#app').dataset.persona = ''; } show('home'); });
    $('#btn-restart').addEventListener('click', () => { Object.assign(state, { mode: 'persona', persona: null, input: null, result: null, reading: null, report: null, est: null, cmp: null, adv: null, compat: null, parent: null, qsel: [], qinitialized: false, qfacts: null, qall: false, unlocked: false }); document.documentElement.dataset.persona = ''; $('#app').dataset.persona = ''; show('home'); });
  }
  // 미연시 연출 레이어(vn.js)가 쓰는 공개 API
  window.SajuApp = { state, setPersona, setMode, compute, show, renderResult, renderPersonaIntro, pillarsHTML, radarSVG, statsHTML, artHTML, won, birthFields };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
