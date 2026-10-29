/* app.js — 화면 흐름(콘티)과 렌더링. 계산 Saju, 캐릭터 SajuPersonas, MBTI SajuMBTI, 장문 풀이 SajuReport. */
(function () {
  'use strict';
  const S = window.Saju, P = window.SajuPersonas, M = window.SajuMBTI, R = window.SajuReport;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ART = 'assets/characters/';
  const SCREENS = ['home', 'persona', 'form', 'reading', 'result'];
  const STEPS = { persona: ['시작', '캐릭터', '정보', '리딩', '시트'], mbti: ['시작', 'MBTI 사주', '정보', '리딩', '결과'] };
  const MBTI_PRODUCT = { title: 'MBTI 사주 심층', price: 9900, chapters: ['네 축 심층: 명식이 그렇게 기운 이유', '검사와 명식의 간격 읽기', '일간·오행·십신으로 보는 기질', '환경 vs 기질 4주 실험'] };
  const state = { mode: 'persona', persona: null, input: null, result: null, reading: null, unlocked: false, est: null, cmp: null, report: null };
  const won = n => '₩' + n.toLocaleString();

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
    $('#steps').innerHTML = STEPS[state.mode].map((t, i) => `<li class="${i === idx ? 'on' : i < idx ? 'done' : ''}">${t}</li>`).join('');
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
    const ids = Object.keys(P.personas);
    $('#roster').innerHTML = ids.map(id => { const p = P.personas[id]; const expert = p.tier === 'expert'; return `
      <button type="button" class="pcard ${expert ? 'expert' : ''}" data-id="${id}" style="--pc:${p.palette.accent}">
        ${expert ? '<span class="ribbon">전문가</span>' : ''}
        <div class="art-wrap">${artHTML(p, 'full')}</div>
        <div class="pbody">
          <div class="pname">${p.name}</div>
          <div class="prole">${p.role}${p.org ? ' · ' + p.org : ''}</div>
          <div class="ptag">${p.tagline}</div>
          <div class="pprice">무료 3줄 · 심층 <b>${won(p.report.price)}</b></div>
          ${p.consentNote ? `<span class="consent">${p.consentNote}</span>` : ''}
        </div>
      </button>`; }).join('');
    $$('#roster .pcard').forEach(b => b.addEventListener('click', () => { state.mode = 'persona'; setPersona(b.dataset.id); if (window.SajuVN) { window.SajuVN.start(b.dataset.id); return; } renderPersonaIntro(); show('persona'); }));
    // MBTI 상품 글자 플립
    const types = ['ENFP', 'INTJ', 'ISFJ', 'ESTP', 'INFJ', 'ENTJ', 'ISTP', 'ESFJ'];
    let ti = 0; const spans = $$('#mbti-letters span');
    if (!reduced) setInterval(() => { ti = (ti + 1) % types.length; spans.forEach((sp, i) => { sp.classList.remove('flip'); void sp.offsetWidth; sp.classList.add('flip'); setTimeout(() => { sp.textContent = types[ti][i]; }, 280); }); }, 2200);
  }

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
          <div class="pricebox"><div>무료 · 3줄 결과 + 캐릭터 시트 + 오행·십신</div><div>심층 · ${P.fill(p.report.title, { seunNext: new Date().getFullYear() + 1 })} <b>${won(p.report.price)}</b> · 모바일 15화면 이상</div></div>
          ${p.consentNote ? `<p class="note">${p.consentNote}</p>` : ''}
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
          <p class="hero tagline" style="padding:0">내가 아는 나(검사)와 타고난 나(명식)를 네 축으로 나란히 놓습니다.</p>
          <h3>이 상품이 보는 것</h3>
          <ul><li>명식(십신·오행 비율)이 가리키는 성향 네 글자와 축별 강도</li><li>검사 결과와 축별 일치·불일치, 그 간격의 의미</li><li>환경이 만든 모습과 기질을 구분하는 4주 실험</li></ul>
          <div class="pricebox"><div>무료 · 축별 비교 카드 + 명식 추정 근거</div><div>심층 · ${MBTI_PRODUCT.title} <b>${won(MBTI_PRODUCT.price)}</b></div></div>
          <p class="note">사주와 MBTI 사이에 검증된 대응 관계는 없습니다. 오행·십신 비율을 네 축에 매핑한 공개 규칙으로 자기 인식과 기질을 나란히 보는 도구입니다.</p>
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
    $('#mbti-field').hidden = !mb;
    $('#form-eyebrow').textContent = mb ? 'MBTI 사주 · 정보' : `${state.persona.name} · 정보`;
    $('#form-title').textContent = mb ? '생년월일시와 평소 MBTI를 알려 주세요' : '생년월일시를 알려 주세요';
    $('#mbti-field-label').textContent = '평소 검사에서 나오는 MBTI (필수)';
    $('#btn-submit').textContent = mb ? '명식과 비교하기' : '명식 펼치기';
    $('#form-error').hidden = true;
  }
  function readForm() {
    const f = $('#birth'); const err = (m) => { $('#form-error').textContent = m; $('#form-error').hidden = false; return null; };
    const date = f.date.value; if (!date) { f.date.focus(); return err('생년월일을 입력해 주세요.'); }
    const [y, m, d] = date.split('-').map(Number);
    const hourUnknown = f.hourUnknown.checked; let hour = 12, minute = 0;
    if (!hourUnknown) { if (!f.time.value) { f.time.focus(); return err('출생 시각을 입력하거나 "시간을 모릅니다"를 선택해 주세요.'); } [hour, minute] = f.time.value.split(':').map(Number); }
    const mbti = readMBTI(f, 'mbti');
    if (state.mode === 'mbti' && !mbti) return err('MBTI 네 축을 모두 선택해 주세요.');
    $('#form-error').hidden = true;
    return { name: f.name.value.trim(), year: y, month: m, day: d, hour, minute, hourUnknown, gender: f.gender.value, solarCorrectionMin: f.solar.checked ? -30 : 0, mbti };
  }
  function fillSample() { const f = $('#birth'); f.name.value = '지민'; f.date.value = '1991-11-03'; f.time.value = '06:20'; f.hourUnknown.checked = false; f.time.disabled = false; $$('input[name=gender]', f).forEach(r => r.checked = r.value === 'F'); f.solar.checked = true; setMBTI(f, 'mbti', 'INFJ'); }

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
    const godOf = (p, where) => { const g = r.tenGods.find(t => t.at === p.name + ' ' + where); return g ? g.name : (p.name === '일주' && where === '천간' ? '일간(나)' : ''); };
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
    $('#kv').innerHTML = `<dt>사주 연도</dt><dd>${r.sajuYear}년 ${r.year.ko}년 (${r.year.animal})</dd><dt>가장 강한 기운</dt><dd>${r.strongestGroup} · ${P.groupDesc[r.strongestGroup]}</dd><dt>가장 약한 기운</dt><dd>${r.weakestGroup} · ${P.groupDesc[r.weakestGroup]}</dd><dt>보정</dt><dd>${r.notes.length ? r.notes.join(' / ') : '없음'}</dd>`;
    $('#gods').innerHTML = `<table class="gods"><thead><tr><th>자리</th><th>글자</th><th>십신</th><th>그룹</th></tr></thead><tbody>${r.tenGods.map(t => `<tr><td>${t.at}</td><td class="el-${S.STEM_ELEM[S.STEMS.indexOf(t.char)] || S.BRANCH_ELEM[S.BRANCHES.indexOf(t.char)]}">${t.char}</td><td>${t.name}</td><td>${t.group}</td></tr>`).join('')}</tbody></table>`;
  }
  function birthString() { const i = state.input; return `${i.year}.${String(i.month).padStart(2, '0')}.${String(i.day).padStart(2, '0')} ${i.hourUnknown ? '시간 모름' : String(i.hour).padStart(2, '0') + ':' + String(i.minute).padStart(2, '0')} · ${i.gender === 'M' ? '남' : '여'}`; }

  // ───── 4-A. 캐릭터 시트 ─────
  function renderResult() {
    const r = state.result; state.unlocked = false; $('#report').hidden = true; $('#teaser').hidden = false; $('#report').innerHTML = '';
    $('#pillars').innerHTML = pillarsHTML(r, false); $('#radar').innerHTML = radarSVG(r); $('#stats').innerHTML = statsHTML(r); evidence(r);
    requestAnimationFrame(() => setTimeout(() => $$('#stats .bar i').forEach(i => i.style.width = i.dataset.w + '%'), 60));
    if (state.mode === 'mbti') return renderMbtiResult();
    const p = state.persona, rd = state.reading, cls = P.classNames[r.day.stem];
    $('#result-eyebrow').textContent = '캐릭터 시트'; $('#mbti-card').hidden = true; $('#lines-card').hidden = false; $('#btn-cross').hidden = false; $('#btn-again').textContent = '다른 캐릭터로 같은 명식 보기';
    $('#sheet-head').innerHTML = `<img class="head-bg" src="${ART}${p.id}/bg_header.png" alt="" onerror="this.remove()"><div class="portrait" id="portrait">${artHTML(p, 'face')}</div><div><div class="who">${p.name} · ${state.input.name || '당신'}의 명식</div><div class="cls">${cls}</div><div class="sub">${r.day.stemKo}${r.dayMaster.elementKo}(${r.day.stem}) 일간 · ${r.dayMaster.polarity}${S.ELEM_KO[r.dayMaster.element]} · ${P.elementWords[r.dayMaster.element]}</div></div><div class="bubble" id="bubble"></div>`;
    const lines = $('#lines'); lines.innerHTML = '';
    const title = P.fill(p.report.title, { seunNext: r.seun[1].year });
    $('#teaser-title').textContent = title; $('#teaser-meta').textContent = `${p.name}의 ${p.tier === 'expert' ? '전문가 종합' : '고민 특화'} 풀이 · 17장 · 모바일 15화면 이상`;
    $('#price').innerHTML = `${won(p.report.price)}<small>1회 · 즉시 발행</small>`;
    $('#chapters').innerHTML = p.report.chapters.map(c => `<li>${P.fill(c, { seunNext: r.seun[1].year })}</li>`).join('');
    const faces = ['neutral', 'smile', 'serious'];
    typewrite($('#bubble'), rd.greeting, () => { rd.lines.forEach((t, i) => setTimeout(() => { setFace(faces[i]); const d = document.createElement('div'); d.className = 'line appear'; d.innerHTML = `<span class="n">${i + 1}</span><span>${t}</span>`; lines.appendChild(d); if (i === rd.lines.length - 1) setTimeout(() => { const d2 = document.createElement('p'); d2.className = 'muted'; d2.textContent = rd.close; lines.appendChild(d2); setFace('neutral'); }, reduced ? 0 : 500); }, reduced ? 0 : 420 * (i + 1))); });
  }

  // ───── 4-B. MBTI 사주 결과 ─────
  function mbtiCardHTML(est, cmp, test) {
    const letters = (type, other) => type.split('').map((ch, i) => `<span class="${other && other[i] !== ch ? 'miss' : ''}">${ch}</span>`).join('');
    const axisRow = (a, i) => { const t = test ? test[i] : null; const w = Math.abs(a.pct - 50); const fill = a.pct >= 50 ? `left:${50 - w}%;width:${w}%` : `left:50%;width:${w}%`; return `<div class="axis"><div class="l ${a.letter === a.left ? 'on' : ''}">${a.left}<small>${a.leftKo}</small></div><div class="track"><div class="fill" style="${fill}"></div>${t ? `<div class="test" style="left:${t === a.left ? '5%' : '95%'}" title="검사 ${t}">${t}</div>` : ''}</div><div class="r ${a.letter === a.right ? 'on' : ''}">${a.right}<small>${a.rightKo}</small></div><div class="meta"><span>명식 <b>${a.letter}</b> ${a.letterPct}%${a.letterPct < 56 ? ' · 경계' : ''}</span>${t ? `<span class="${t === a.letter ? 'ok' : 'ng'}">검사 ${t} · ${t === a.letter ? '일치' : '불일치'}</span>` : ''}</div></div>`; };
    return `<div class="eyebrow">네 축 비교</div><div class="mbti-head"><div class="mbti-type">${letters(est.letters, test)}<small>명식 추정 성향</small></div>${test ? `<div class="mbti-vs">vs</div><div class="mbti-type">${letters(test, est.letters)}<small>평소 검사 결과</small></div><div class="chip accent">4축 중 ${cmp.matches}축 일치</div>` : ''}</div><div class="axes">${est.axes.map(axisRow).join('')}</div>${cmp ? `<div class="mbti-lines"><p><b>${cmp.summary}</b></p>${cmp.axes.map(x => `<p><b>${x.test}→${x.chart}</b> ${x.text}</p>`).join('')}</div>` : ''}<details class="why"><summary>추정 근거 보기</summary><ul>${est.axes.map(a => `<li><b>${a.left}/${a.right}</b> → ${a.letter} ${a.letterPct}%. ${a.factors.map(f => `${f.label}→${f.v > 0 ? a.left : a.right}`).join(', ')}. <span class="muted">${a.note}</span></li>`).join('')}</ul><p class="muted">사주와 MBTI 사이에 검증된 대응 관계는 없습니다. 위 규칙은 오행·십신 비율을 네 축에 매핑한 공개 휴리스틱(mbti.js)이며, 검사(자기 인식)와 명식(기질)을 나란히 놓고 보는 도구입니다.</p></details>`;
  }
  function renderMbtiResult() {
    const r = state.result; const est = M.estimate(r); const cmp = M.compare(state.input.mbti, est); state.est = est; state.cmp = cmp;
    $('#result-eyebrow').textContent = 'MBTI 사주 · 결과'; $('#lines-card').hidden = true; $('#btn-cross').hidden = true; $('#btn-again').textContent = '캐릭터에게 같은 명식 보이기';
    $('#sheet-head').innerHTML = `<div class="mbti-hero"><div class="mbti-type" style="font-size:40px">${est.letters}<small>명식이 가리키는 성향</small></div><div class="mbti-vs">vs</div><div class="mbti-type" style="font-size:40px">${cmp.test}<small>평소 검사 결과</small></div><div class="chip accent">4축 중 ${cmp.matches}축 일치</div></div><div class="bubble" id="bubble">${cmp.summary}</div>`;
    $('#mbti-card').hidden = false; $('#mbti-card').innerHTML = mbtiCardHTML(est, cmp, cmp.test);
    $('#teaser-title').textContent = MBTI_PRODUCT.title; $('#teaser-meta').textContent = '축별 심층 + 일간·오행·십신 + 4주 실험 · 11장';
    $('#price').innerHTML = `${won(MBTI_PRODUCT.price)}<small>1회 · 즉시 발행</small>`; $('#chapters').innerHTML = MBTI_PRODUCT.chapters.map(c => `<li>${c}</li>`).join('');
  }

  // ───── 5. 심층 리포트(장문) ─────
  function buildReport() {
    const r = state.result, name = state.input.name || '당신';
    if (state.mode === 'mbti') {
      const mb = M.buildSections(r, state.est, state.cmp, { name });
      const gen = R.build(r, null, { name }).sections.filter(s => ['daymaster', 'elements', 'tengods', 'strength'].includes(s.id));
      const sections = mb.head.concat(gen, mb.tail);
      const chars = sections.map(s => s.title + ' ' + s.html.replace(/<[^>]+>/g, ' ')).join(' ').replace(/\s/g, '').length;
      return { title: MBTI_PRODUCT.title, sections, chars, screens: Math.round(chars / 450) };
    }
    const p = state.persona; const rep = R.build(r, p, { name, className: P.classNames[r.day.stem] });
    rep.title = P.fill(p.report.title, { seunNext: r.seun[1].year }); return rep;
  }
  function renderReport() {
    const rep = state.report || (state.report = buildReport()); const p = state.persona; const total = rep.sections.length;
    const nn = i => String(i + 1).padStart(2, '0');
    $('#report').innerHTML = `
      <div class="rtop">
        ${p ? `<img class="head-bg" src="${ART}${p.id}/bg_header.png" alt="" onerror="this.remove()">` : ''}
        <div class="row"><span class="chip accent">${state.mode === 'mbti' ? 'MBTI 사주' : p.name}</span><span class="chip">총 ${rep.chars.toLocaleString()}자 · 모바일 약 ${rep.screens}화면 · ${total}장</span>${p && p.consentNote ? '<span class="chip dev">본인 감수 전 템플릿</span>' : ''}</div>
        <h3 class="rtitle">${rep.title}</h3>
        <p class="muted">${state.input.name || '당신'} · ${birthString()} · ${state.result.pillars.map(x => x.ko).join(' ')}</p>
        <ol class="toc">${rep.sections.map((s, i) => `<li><a data-to="rs-${s.id}"><span class="n">${nn(i)}</span><span>${s.title}</span></a></li>`).join('')}</ol>
        <p class="muted" style="margin:0"><span class="chip dev">MVP: 데이터 기반 템플릿 · 운영: 같은 골격을 ${state.mode === 'mbti' ? '분석' : p.name} 말투로 LLM 생성</span></p>
      </div>
      <div class="rprogress" id="rprogress"><span class="idx" id="rp-idx">01/${total}</span><span class="t" id="rp-title">${rep.sections[0].title}</span><i id="rp-bar"></i></div>
      ${rep.sections.map((s, i) => `<section class="rsec" id="rs-${s.id}" data-n="${i + 1}"><div class="rhead"><span class="rnum">${nn(i)}</span><h4>${s.title}</h4></div><div class="rbody">${s.html}</div></section>`).join('')}`;
    if (p) $$('#report .lead-in').forEach(el => { const chip = document.createElement('span'); chip.className = 'face-chip'; chip.innerHTML = artHTML(p, 'face'); el.prepend(chip); });
    $$('#report .toc a').forEach(a => a.addEventListener('click', () => { const t = $('#' + a.dataset.to); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }));
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { const n = +e.target.dataset.n; $('#rp-idx').textContent = `${nn(n - 1)}/${total}`; $('#rp-title').textContent = e.target.querySelector('h4').textContent; $('#rp-bar').style.width = Math.round(n / total * 100) + '%'; } }); }, { rootMargin: '-40% 0px -55% 0px' }); $$('#report .rsec').forEach(s => io.observe(s)); }
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
    x.fillStyle = accent; x.font = `600 28px ${body}`; x.fillText(`명식 성향 ${est.letters}` + (cm ? `  ·  검사 ${cm.test}  ·  ${cm.matches}/4 일치` : ''), W / 2, 594);
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
    state.input = input; state.report = null; state.est = null; state.cmp = null;
    try { state.result = S.compute(input); } catch (err) { $('#form-error').textContent = '계산에 실패했습니다: ' + err.message; $('#form-error').hidden = false; return false; }
    state.reading = state.mode === 'persona' ? P.generateReading(state.result, state.persona, { name: input.name || '당신' }) : null;
    return true;
  }
  function start() {
    stars(); renderHome(); show('home');
    $('#mbti-pick').innerHTML = mbtiPickHTML('mbti');
    $$('#mbti-pick .mbti-clear').forEach(b => b.addEventListener('click', () => setMBTI($('#birth'), 'mbti', null)));
    $('#btn-mbti-product').addEventListener('click', () => { setMode('mbti'); renderMbtiIntro(); show('persona'); });
    $('#btn-sample').addEventListener('click', () => { state.mode = 'persona'; setPersona('master'); prepForm(); fillSample(); show('form'); });
    $('#birth').addEventListener('submit', e => { e.preventDefault(); const input = readForm(); if (!input || !compute(input)) return; show('reading'); runReading(() => { show('result'); renderResult(); }); });
    $('#hourUnknown').addEventListener('change', e => { $('#time').disabled = e.target.checked; });
    $('#btn-fill-sample').addEventListener('click', fillSample);
    $('#btn-pay').addEventListener('click', () => { const rep = state.report || (state.report = buildReport()); const price = state.mode === 'mbti' ? MBTI_PRODUCT.price : state.persona.report.price; $('#pay-title').textContent = rep.title; $('#pay-what').textContent = `${rep.sections.length}장 심층 리포트 1회`; $('#pay-price').textContent = won(price); $('#pay-size').textContent = `약 ${rep.chars.toLocaleString()}자 · 모바일 ${rep.screens}화면`; $('#m-pay').hidden = false; });
    $('#btn-pay-confirm').addEventListener('click', () => { $('#m-pay').hidden = true; renderReport(); });
    $('#btn-share').addEventListener('click', () => { state.shareBg = null; if (state.mode !== 'mbti' && state.persona) { const im = new Image(); im.onload = () => { state.shareBg = im; shareCard(); }; im.onerror = () => shareCard(); im.src = `${ART}${state.persona.id}/bg_card.png`; } else shareCard(); });
    $$('[data-close]').forEach(b => b.addEventListener('click', () => { $('#' + b.dataset.close).hidden = true; }));
    $('#btn-cross').addEventListener('click', () => { setMode('mbti'); if (state.input.mbti) { compute(state.input); show('reading'); runReading(() => { show('result'); renderResult(); }); } else { renderMbtiIntro(); prepForm(); show('form'); } });
    $('#btn-again').addEventListener('click', () => { if (state.mode === 'mbti') { state.mode = 'persona'; document.documentElement.dataset.persona = ''; $('#app').dataset.persona = ''; } show('home'); });
    $('#btn-restart').addEventListener('click', () => { state.mode = 'persona'; state.persona = null; document.documentElement.dataset.persona = ''; $('#app').dataset.persona = ''; show('home'); });
  }
  // 미연시 연출 레이어(vn.js)가 쓰는 공개 API
  window.SajuApp = { state, setPersona, setMode, compute, show, renderResult, renderPersonaIntro, pillarsHTML, radarSVG, statsHTML, artHTML, won };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
