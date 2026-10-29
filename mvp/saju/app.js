/* app.js — 화면 흐름(콘티)과 렌더링. 계산은 Saju, 문장은 SajuPersonas. */
(function () {
  'use strict';
  const S = window.Saju, P = window.SajuPersonas;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEPS = ['intro', 'concern', 'persona', 'form', 'reading', 'result'];
  const state = { concern: null, persona: null, input: null, result: null, reading: null, unlocked: false, mbti: null };

  // ───── 화면 전환 ─────
  function show(id) {
    STEPS.forEach(s => { const el = $('#s-' + s); if (el) el.hidden = s !== id; });
    const idx = STEPS.indexOf(id);
    $$('#steps li').forEach((li, i) => { li.classList.toggle('on', i === idx); li.classList.toggle('done', i < idx); });
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }
  function setPersona(id) {
    state.persona = id ? P.personas[id] : null;
    document.documentElement.dataset.persona = id || '';
    $('#app').dataset.persona = id || '';
  }

  // ───── 배경 별가루 ─────
  function stars() {
    const c = $('#stars'); if (!c) return;
    const ctx = c.getContext('2d'); let w, h, pts = [];
    function size() { w = c.width = innerWidth * devicePixelRatio; h = c.height = innerHeight * devicePixelRatio; pts = Array.from({ length: 70 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.2 + .3) * devicePixelRatio, v: (Math.random() * .15 + .05) * devicePixelRatio, a: Math.random() })); }
    size(); addEventListener('resize', size);
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--p-accent').trim() || '#d8b45f';
      pts.forEach(p => { p.y -= p.v; p.a += .01; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } ctx.globalAlpha = .35 + .35 * Math.sin(p.a); ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
      if (!reduced) requestAnimationFrame(draw);
    }
    draw();
  }

  // ───── 1. 고민 ─────
  function renderConcerns() {
    $('#concerns').innerHTML = P.concerns.map(c => `
      <button type="button" class="concern" data-id="${c.id}">
        <span class="glyph">${c.glyph}</span>
        <span><b>${c.label}</b><small>${c.q}</small></span>
        <span class="arrow">→</span>
      </button>`).join('');
    $$('#concerns .concern').forEach(b => b.addEventListener('click', () => {
      state.concern = P.concerns.find(c => c.id === b.dataset.id);
      renderRoster(); setPersona(state.concern.persona); selectCard(state.concern.persona); show('persona');
    }));
  }

  // ───── 2. 캐릭터 ─────
  function renderRoster() {
    const rec = state.concern ? state.concern.persona : null;
    const order = Object.keys(P.personas).sort((a, b) => (a === rec ? -1 : b === rec ? 1 : 0));
    $('#roster').innerHTML = order.map(id => { const p = P.personas[id]; return `
      <button type="button" class="pcard" data-id="${id}" style="--pc:${p.palette.accent}">
        ${id === rec ? '<span class="ribbon">추천</span>' : ''}
        <div class="emblem">${p.emblem}</div>
        <div class="pname">${p.name}</div>
        <div class="prole">${p.role}</div>
        <div class="ptag">${p.tagline}</div>
        <div class="pvoice">${p.voice}</div>
      </button>`; }).join('');
    $$('#roster .pcard').forEach(b => b.addEventListener('click', () => { setPersona(b.dataset.id); selectCard(b.dataset.id); b.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); }));
  }
  function selectCard(id) {
    $$('#roster .pcard').forEach(b => b.classList.toggle('selected', b.dataset.id === id));
    const p = P.personas[id];
    $('#pdetail').innerHTML = `
      <div class="row"><span class="chip accent">${p.name}</span><span class="chip">${p.role}</span></div>
      <h3>이 캐릭터가 보는 것</h3>
      <ul>${p.sees.map(s => `<li>${s}</li>`).join('')}</ul>
      <p class="muted">무료: 3줄 결과 + 캐릭터 시트 · 유료: ${p.report.title} ₩${p.report.price.toLocaleString()}</p>`;
    $('#btn-persona-next').textContent = `${p.name}에게 보이기`;
  }

  // ───── 3. 입력 ─────
  function readForm() {
    const f = $('#birth');
    const date = f.date.value; if (!date) { f.date.focus(); return null; }
    const [y, m, d] = date.split('-').map(Number);
    const hourUnknown = f.hourUnknown.checked;
    let hour = 12, minute = 0;
    if (!hourUnknown) { if (!f.time.value) { f.time.focus(); return null; } [hour, minute] = f.time.value.split(':').map(Number); }
    return { name: f.name.value.trim(), year: y, month: m, day: d, hour, minute, hourUnknown, gender: f.gender.value, solarCorrectionMin: f.solar.checked ? -30 : 0, mbti: readMBTI(f, 'mbti') };
  }
  // ───── MBTI 선택 UI(폼·결과 카드 공용) ─────
  const M = () => window.SajuMBTI;
  function mbtiPickHTML(prefix) {
    return M().AXES.map(a => `<div class="seg mini">
      <label><input type="radio" name="${prefix}_${a.id}" value="${a.left}"><span>${a.left} <small>${a.leftKo}</small></span></label>
      <label><input type="radio" name="${prefix}_${a.id}" value="${a.right}"><span>${a.right} <small>${a.rightKo}</small></span></label></div>`).join('') +
      `<button type="button" class="btn ghost mbti-clear" data-prefix="${prefix}">선택 지우기</button>`;
  }
  function readMBTI(scope, prefix) {
    const letters = M().AXES.map(a => { const el = scope.querySelector(`input[name="${prefix}_${a.id}"]:checked`); return el ? el.value : ''; }).join('');
    return letters.length === 4 ? letters : null;
  }
  function setMBTI(scope, prefix, letters) {
    M().AXES.forEach((a, i) => $$(`input[name="${prefix}_${a.id}"]`, scope).forEach(r => { r.checked = !!letters && r.value === letters[i]; }));
  }
  function fillSample() {
    const f = $('#birth'); f.name.value = '지민'; f.date.value = '1991-11-03'; f.time.value = '06:20'; f.hourUnknown.checked = false; f.time.disabled = false; $$('input[name=gender]', f).forEach(r => r.checked = r.value === 'F'); f.solar.checked = true; setMBTI(f, 'mbti', 'INFJ');
  }

  // ───── 4. 리딩 애니메이션 ─────
  function runReading(done) {
    const phases = ['만세력으로 년·월·일·시주를 세우는 중', '오행과 십신의 균형을 재는 중', '대운과 세운의 흐름을 겹치는 중', `${state.persona.name}이(가) 해석을 고르는 중`];
    const list = $('#phases'); list.innerHTML = phases.map(p => `<div>${p}</div>`).join('');
    $('#summon-emblem').innerHTML = state.persona.emblem;
    const items = $$('#phases div'); let i = 0;
    const step = () => {
      items.forEach((el, k) => { el.classList.toggle('on', k === i); el.classList.toggle('done', k < i); });
      $('#phase').textContent = phases[i];
      i++;
      if (i < phases.length) setTimeout(step, reduced ? 10 : 750); else setTimeout(done, reduced ? 10 : 800);
    };
    step();
  }

  // ───── 5. 시트 ─────
  function pillarsHTML(r, compact) {
    const order = [r.hour, r.day, r.month, r.year].filter(Boolean);
    const godOf = (p, where) => { const g = r.tenGods.find(t => t.at === p.name + ' ' + where); return g ? g.name : (p.name === '일주' && where === '천간' ? '일간(나)' : ''); };
    return `<div class="pillars ${order.length === 3 ? 'three' : ''}">${order.map(p => `
      <div class="pillar ${p.name === '일주' ? 'me' : ''}">
        <div class="pn">${p.name}</div>
        ${compact ? '' : `<div class="god">${godOf(p, '천간')}</div>`}
        <div class="hz el-${p.stemElem}">${p.stem}</div>
        <div class="hz el-${p.branchElem}">${p.branch}</div>
        ${compact ? '' : `<div class="god">${godOf(p, '지지')}</div>`}
        <div class="ko">${p.ko}</div>
      </div>`).join('')}</div>`;
  }
  function radarSVG(r) {
    const cx = 130, cy = 132, R = 92, n = 5;
    const max = Math.max(3, ...S.ELEMENTS.map(e => r.elements[e]));
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
    const pt = (i, k) => [cx + R * k * Math.cos(ang(i)), cy + R * k * Math.sin(ang(i))];
    const ring = k => S.ELEMENTS.map((_, i) => pt(i, k).map(v => v.toFixed(1)).join(',')).join(' ');
    const vals = S.ELEMENTS.map(e => r.elements[e] / max);
    const poly = S.ELEMENTS.map((_, i) => pt(i, vals[i]).map(v => v.toFixed(1)).join(',')).join(' ');
    const top = r.sortedElems[0];
    return `<svg class="radar" viewBox="0 0 260 264" role="img" aria-label="오행 분포">
      ${[.25, .5, .75, 1].map(k => `<polygon class="grid" points="${ring(k)}"/>`).join('')}
      ${S.ELEMENTS.map((_, i) => { const [x, y] = pt(i, 1); return `<line class="axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('')}
      <polygon class="area" points="${poly}"/>
      ${S.ELEMENTS.map((e, i) => { const [x, y] = pt(i, vals[i]); return `<circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"><title>${e} ${S.ELEM_KO[e]}: ${r.elements[e]}/${r.totalChars}</title></circle>`; }).join('')}
      ${S.ELEMENTS.map((e, i) => { const [x, y] = pt(i, 1.24); const dy = i === 0 ? -4 : 4; return `<text class="lbl hz" x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="middle">${e}</text><text class="lbl" x="${x.toFixed(1)}" y="${(y + dy + 13).toFixed(1)}" text-anchor="middle">${S.ELEM_KO[e]} ${P.elementWords[e].split('·')[0]}</text>`; }).join('')}
      ${(() => { const i = S.ELEMENTS.indexOf(top); const [x, y] = pt(i, vals[i]); return `<text class="val" x="${(x + 8).toFixed(1)}" y="${(y - 6).toFixed(1)}">${r.elements[top]}</text>`; })()}
    </svg>`;
  }
  function statsHTML(r) {
    const tot = r.tenGods.length || 1;
    return `<div class="stats">${S.TEN_GOD_GROUPS.map(g => `
      <div class="stat"><div class="nm"><b>${P.groupStats[g]}</b><small>${g}</small></div>
      <div class="bar"><i data-w="${Math.round(r.groups[g] / tot * 100)}"></i></div>
      <div class="v">${r.groups[g]}</div></div>`).join('')}</div>`;
  }
  function typewrite(el, text, done) {
    if (reduced) { el.textContent = text; done && done(); return; }
    el.innerHTML = '<span></span><i class="caret"></i>'; const span = el.firstChild; let i = 0;
    const tick = () => { span.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 28); else { el.querySelector('.caret').remove(); done && done(); } };
    tick();
  }
  function renderResult() {
    const r = state.result, p = state.persona, rd = state.reading;
    const cls = P.classNames[r.day.stem];
    $('#sheet-head').innerHTML = `
      <div class="emblem">${p.emblem}</div>
      <div>
        <div class="who">${p.name} · ${state.input.name || '당신'}의 명식</div>
        <div class="cls">${cls}</div>
        <div class="sub">${r.day.stemKo}${r.dayMaster.elementKo}(${r.day.stem}) 일간 · ${r.dayMaster.polarity}${S.ELEM_KO[r.dayMaster.element]} · ${P.elementWords[r.dayMaster.element]}</div>
      </div>
      <div class="bubble" id="bubble" style="grid-column:1/-1"></div>`;
    $('#pillars').innerHTML = pillarsHTML(r, false);
    $('#radar').innerHTML = radarSVG(r);
    $('#stats').innerHTML = statsHTML(r);
    $('#kv').innerHTML = `
      <dt>사주 연도</dt><dd>${r.sajuYear}년 ${r.year.ko}년 (${r.year.animal})</dd>
      <dt>가장 강한 기운</dt><dd>${r.strongestGroup} · ${P.groupDesc[r.strongestGroup]}</dd>
      <dt>가장 약한 기운</dt><dd>${r.weakestGroup} · ${P.groupDesc[r.weakestGroup]}</dd>
      <dt>보정</dt><dd>${r.notes.length ? r.notes.join(' / ') : '없음'}</dd>`;
    $('#gods').innerHTML = `<table class="gods"><thead><tr><th>자리</th><th>글자</th><th>십신</th><th>그룹</th></tr></thead><tbody>${r.tenGods.map(t => `<tr><td>${t.at}</td><td class="el-${S.STEM_ELEM[S.STEMS.indexOf(t.char)] || S.BRANCH_ELEM[S.BRANCHES.indexOf(t.char)]}">${t.char}</td><td>${t.name}</td><td>${t.group}</td></tr>`).join('')}</tbody></table>`;
    renderMBTI();
    const lines = $('#lines'); lines.innerHTML = '';
    $('#teaser-title').textContent = p.report.title;
    $('#price').innerHTML = `₩${p.report.price.toLocaleString()}<small>1회 · 즉시 발행</small>`;
    $('#chapters').innerHTML = p.report.chapters.map(c => `<li>${P.fill(c, { seunNext: r.seun[1].year })}</li>`).join('');
    $('#report').hidden = true; $('#teaser').hidden = false; state.unlocked = false;

    typewrite($('#bubble'), rd.greeting, () => {
      rd.lines.forEach((t, i) => setTimeout(() => {
        const d = document.createElement('div'); d.className = 'line appear'; d.innerHTML = `<span class="n">${i + 1}</span><span>${t}</span>`; lines.appendChild(d);
        if (i === rd.lines.length - 1) setTimeout(() => { const d2 = document.createElement('p'); d2.className = 'muted'; d2.textContent = rd.close; lines.appendChild(d2); }, reduced ? 0 : 400);
      }, reduced ? 0 : 350 * (i + 1)));
    });
    requestAnimationFrame(() => setTimeout(() => $$('#stats .bar i').forEach(i => i.style.width = i.dataset.w + '%'), 60));
  }

  // ───── 5-2. MBTI 교차 분석 ─────
  function renderMBTI() {
    const r = state.result, p = state.persona;
    const est = M().estimate(r); state.mbti = est;
    const test = state.input.mbti; const cmp = test ? M().compare(test, est) : null;
    const letters = (type, other) => type.split('').map((ch, i) => `<span class="${other && other[i] !== ch ? 'miss' : ''}">${ch}</span>`).join('');
    const axisRow = (a, i) => {
      const t = test ? test[i] : null; const w = Math.abs(a.pct - 50);
      const fill = a.pct >= 50 ? `left:${50 - w}%;width:${w}%` : `left:50%;width:${w}%`;
      return `<div class="axis">
        <div class="l ${a.letter === a.left ? 'on' : ''}">${a.left}<small>${a.leftKo}</small></div>
        <div class="track"><div class="fill" style="${fill}"></div>${t ? `<div class="test" style="left:${t === a.left ? '5%' : '95%'}" title="검사 ${t}">${t}</div>` : ''}</div>
        <div class="r ${a.letter === a.right ? 'on' : ''}">${a.right}<small>${a.rightKo}</small></div>
        <div class="meta"><span>명식 <b>${a.letter}</b> ${a.letterPct}%</span>${t ? `<span class="${t === a.letter ? 'ok' : 'ng'}">검사 ${t} · ${t === a.letter ? '일치' : '불일치'}</span>` : '<span class="muted">검사 미입력</span>'}</div>
      </div>`;
    };
    $('#mbti').innerHTML = `
      <div class="eyebrow">MBTI × 명식 교차 분석</div>
      <p class="pintro">${p.mbtiIntro}</p>
      <div class="mbti-head">
        <div class="mbti-type">${letters(est.letters, test)}<small>명식 추정 성향</small></div>
        ${test ? `<div class="mbti-vs">vs</div><div class="mbti-type">${letters(test, est.letters)}<small>평소 검사 결과</small></div><div class="chip accent">4축 중 ${cmp.matches}축 일치</div>` : ''}
      </div>
      <div class="axes">${est.axes.map(axisRow).join('')}</div>
      ${cmp ? `<div class="mbti-lines"><p><b>${cmp.summary}</b></p>${cmp.axes.map(x => `<p><b>${x.test}→${x.chart}</b> ${x.text}</p>`).join('')}</div>`
            : `<div class="mbti-add"><p class="muted">평소 검사에서 나오는 MBTI를 넣으면 축별로 비교합니다.</p><div class="mbti-pick" id="mbti-inline">${mbtiPickHTML('imbti')}</div><button type="button" class="btn block" id="btn-mbti-compare">비교하기</button></div>`}
      <details class="why"><summary>추정 근거 보기</summary>
        <ul>${est.axes.map(a => `<li><b>${a.left}/${a.right}</b> → ${a.letter} ${a.letterPct}%. ${a.factors.map(f => `${f.label}→${f.v > 0 ? a.left : a.right}`).join(', ')}. <span class="muted">${a.note}</span></li>`).join('')}</ul>
        <p class="muted">사주와 MBTI 사이에 검증된 대응 관계는 없습니다. 위 규칙은 오행·십신 비율을 네 축에 매핑한 공개 휴리스틱(mbti.js)이며, 검사(자기 인식)와 명식(기질)을 나란히 놓고 보는 도구입니다.</p>
      </details>`;
    const addBtn = $('#btn-mbti-compare');
    if (addBtn) addBtn.addEventListener('click', () => { const v = readMBTI($('#mbti-inline'), 'imbti'); if (!v) { addBtn.textContent = '네 축을 모두 선택해 주세요'; return; } state.input.mbti = v; renderMBTI(); if (state.unlocked) renderReport(); });
    $$('#mbti .mbti-clear').forEach(b => b.addEventListener('click', () => setMBTI($('#mbti'), b.dataset.prefix, null)));
  }

  // ───── 6. 심층 리포트(결제 시뮬레이션 뒤) ─────
  function renderReport() {
    const r = state.result, p = state.persona; const nx = r.seun[1];
    const cur = r.daeun && r.daeun.current; const nextD = r.daeun && cur ? r.daeun.list[r.daeun.list.indexOf(cur) + 1] : null;
    const luck = (pl) => `<div class="luck"><div class="hz"><span class="el-${pl.stemElem}">${pl.stem}</span><span class="el-${pl.branchElem}">${pl.branch}</span><small>${pl.ko}</small></div><div><b>${pl.tenGod.name}·${pl.branchTenGod.name}</b> <span class="muted">(천간·지지)</span><p>${P.luckByGroup[pl.tenGod.group]}</p></div></div>`;
    $('#report').innerHTML = `
      <div class="row"><span class="chip accent">${p.report.title}</span><span class="chip dev">MVP: 데이터 기반 공통 4섹션 · 운영: ${p.name} 말투로 LLM 생성</span></div>
      <p class="muted">운영 목차(약속한 상품): ${p.report.chapters.map(c => P.fill(c, { seunNext: nx.year })).join(' / ')}. 상대방 정보가 필요한 챕터(궁합·부모 일주)는 운영에서 추가 입력을 받는다.</p>
      <div class="sec"><h4>1. 원국 해부: 일간과 오행·십신의 균형</h4>
        <p>일간 ${r.day.stemKo}${r.dayMaster.elementKo}(${r.day.stem})를 중심으로 ${r.totalChars}글자 중 ${r.sortedElems[0]}(${S.ELEM_KO[r.sortedElems[0]]})이 ${r.elements[r.sortedElems[0]]}개로 가장 많고, ${r.sortedElems[4]}(${S.ELEM_KO[r.sortedElems[4]]})이 ${r.elements[r.sortedElems[4]]}개로 가장 적다. 십신으로는 ${r.strongestGroup}(${P.groupStats[r.strongestGroup]})이 두드러지고 ${r.weakestGroup}(${P.groupStats[r.weakestGroup]})이 비어 있다.</p>
        ${pillarsHTML(r, true)}</div>
      <div class="sec"><h4>2. 지금의 계절: 현재 대운과 다음 대운</h4>
        ${cur ? `<p class="muted">현재 대운 (만 ${cur.fromAge}~${cur.toAge}세, ${r.daeun.forward ? '순행' : '역행'}, 대운수 ${r.daeun.startAge})</p>${luck(cur)}` : `<p class="muted">대운 진입 전(만 ${r.daeun ? r.daeun.ageYears : '-'}세). 첫 대운은 만 ${r.daeun ? r.daeun.startAge : '-'}세부터.</p>`}
        ${nextD ? `<p class="muted">다음 대운 (만 ${nextD.fromAge}~${nextD.toAge}세)</p>${luck(nextD)}` : ''}</div>
      <div class="sec"><h4>3. ${nx.year}년과 ${r.seun[0].year}년 세운이 들어오는 자리</h4>
        <p class="muted">${nx.year}년 세운</p>${luck(nx)}
        <p class="muted">${r.seun[0].year}년 세운</p>${luck(r.seun[0])}</div>
      <div class="sec"><h4>4. 약한 자리를 메우는 if-then 3개</h4>
        <p>가장 약한 ${r.weakestGroup}(${P.groupStats[r.weakestGroup]})을 보완하는 if-then 계획:</p>
        <ol class="ifthen">${P.ifThenByWeak[r.weakestGroup].map(s => `<li>${s}</li>`).join('')}</ol></div>
      ${(() => { const est = state.mbti || M().estimate(r); const t = state.input.mbti; const c = t ? M().compare(t, est) : null; return `<div class="sec"><h4>5. MBTI × 명식: 자기 인식과 기질의 간격</h4>
        ${c ? `<p>검사 <b>${c.test}</b> · 명식 추정 <b>${c.chart}</b> · 4축 중 ${c.matches}축 일치. ${c.summary}</p>${c.axes.map(x => `<p><b>${x.test}→${x.chart}</b> ${x.text}</p>`).join('')}` : `<p>명식 추정 성향 <b>${est.letters}</b>. 검사 MBTI를 입력하면 축별 비교가 추가됩니다.</p>`}
        <p class="muted">사주와 MBTI 사이에 검증된 대응은 없습니다. 공개 규칙 기반 추정.</p></div>`; })()}
      <div class="sec"><p class="muted">절입 기준: 이전 ${fmt(r.terms.prev)} · 다음 ${fmt(r.terms.next)} (KST). 황경 ${r.lambda}°. 이 리포트는 참고용 콘텐츠이며 의학·법률·금융 조언이 아닙니다.</p></div>`;
    $('#teaser').hidden = true; $('#report').hidden = false; state.unlocked = true;
    $('#report').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  function fmt(iso) { if (!iso) return '-'; const d = new Date(Date.parse(iso) + 9 * 3600000); return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; }

  // ───── 공유 카드(캔버스) ─────
  function shareCard() {
    const r = state.result, p = state.persona, rd = state.reading;
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const cs = getComputedStyle(document.documentElement);
    const accent = p.palette.accent, accent2 = p.palette.accent2;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, accent2); g.addColorStop(.55, '#0b0e18'); g.addColorStop(1, '#0b0e18'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalAlpha = .12; for (let i = 0; i < 90; i++) { x.fillStyle = accent; x.beginPath(); x.arc(Math.random() * W, Math.random() * H, Math.random() * 3 + 1, 0, 7); x.fill(); } x.globalAlpha = 1;
    const disp = `'Gowun Batang', 'Noto Serif KR', serif`, body = `'IBM Plex Sans KR', 'Noto Sans KR', sans-serif`;
    x.textAlign = 'center'; x.fillStyle = 'rgba(242,236,220,.75)'; x.font = `500 30px ${body}`; x.fillText(`${p.name}이(가) 읽은 ${state.input.name || '당신'}의 명식`, W / 2, 110);
    x.fillStyle = accent; x.font = `700 300px ${disp}`; x.fillText(r.day.stem, W / 2, 400);
    x.fillStyle = '#f2ecdc'; x.font = `700 72px ${disp}`; x.fillText(P.classNames[r.day.stem], W / 2, 500);
    x.fillStyle = 'rgba(242,236,220,.7)'; x.font = `400 30px ${body}`; x.fillText(`${r.day.stemKo}${r.dayMaster.elementKo} 일간 · ${P.elementWords[r.dayMaster.element]}`, W / 2, 550);
    const est = state.mbti || M().estimate(r); const tm = state.input.mbti; const cm = tm ? M().compare(tm, est) : null;
    x.fillStyle = accent; x.font = `600 28px ${body}`; x.fillText(`명식 성향 ${est.letters}` + (cm ? `  ·  검사 ${cm.test}  ·  ${cm.matches}/4 일치` : ''), W / 2, 594);
    const order = [r.hour, r.day, r.month, r.year].filter(Boolean); const bw = 190, gap = 24, total = order.length * bw + (order.length - 1) * gap, x0 = (W - total) / 2;
    const ec = { 木: cs.getPropertyValue('--e-wood').trim(), 火: cs.getPropertyValue('--e-fire').trim(), 土: cs.getPropertyValue('--e-earth').trim(), 金: cs.getPropertyValue('--e-metal').trim(), 水: cs.getPropertyValue('--e-water').trim() };
    order.forEach((pl, i) => { const bx = x0 + i * (bw + gap), by = 630; x.fillStyle = 'rgba(255,255,255,.06)'; roundRect(x, bx, by, bw, 250, 20); x.fill(); if (pl.name === '일주') { x.strokeStyle = accent; x.lineWidth = 3; roundRect(x, bx, by, bw, 250, 20); x.stroke(); }
      x.fillStyle = 'rgba(242,236,220,.6)'; x.font = `500 24px ${body}`; x.fillText(pl.name, bx + bw / 2, by + 44);
      x.font = `700 84px ${disp}`; x.fillStyle = ec[pl.stemElem]; x.fillText(pl.stem, bx + bw / 2, by + 130); x.fillStyle = ec[pl.branchElem]; x.fillText(pl.branch, bx + bw / 2, by + 215); });
    x.fillStyle = '#f2ecdc'; x.font = `400 32px ${disp}`; x.textAlign = 'left'; let y = 940; rd.lines.forEach((t, i) => { x.fillStyle = accent; x.fillText(String(i + 1), 90, y); x.fillStyle = '#f2ecdc'; y = wrap(x, t, 140, y, W - 230, 46) + 46 + 22; });
    x.textAlign = 'center'; x.fillStyle = 'rgba(242,236,220,.5)'; x.font = `500 26px ${body}`; x.fillText('사주도감 · 캐릭터가 읽는 내 명식', W / 2, H - 60);
    const img = $('#share-img'); img.src = c.toDataURL('image/png'); $('#m-share').hidden = false;
  }
  function roundRect(x, px, py, w, h, r) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }
  function wrap(x, text, px, py, maxW, lh) { const chars = Array.from(text); let line = '', y = py; for (const ch of chars) { const t = line + ch; if (x.measureText(t).width > maxW && line) { x.fillText(line, px, y); line = ch; y += lh; } else line = t; } if (line) x.fillText(line, px, y); return y; }

  // ───── 인트로 샘플 ─────
  function renderIntroPreview() {
    const r = S.compute({ year: 1991, month: 11, day: 3, hour: 6, minute: 20, gender: 'F' });
    $('#preview-pillars').innerHTML = pillarsHTML(r, true);
    $('#preview-class').textContent = P.classNames[r.day.stem];
    $('#preview-sub').textContent = `${r.day.stemKo}${r.dayMaster.elementKo} 일간 · ${r.strongestGroup} 강 · ${r.weakestGroup} 약`;
  }

  // ───── 흐름 연결 ─────
  function start() {
    stars(); renderConcerns(); renderIntroPreview();
    $('#btn-start').addEventListener('click', () => show('concern'));
    $('#btn-sample').addEventListener('click', () => { state.concern = P.concerns[2]; renderRoster(); setPersona('granny'); selectCard('granny'); fillSample(); show('form'); });
    $('#btn-persona-next').addEventListener('click', () => show('form'));
    $$('[data-back]').forEach(b => b.addEventListener('click', () => show(b.dataset.back)));
    $('#birth').addEventListener('submit', e => {
      e.preventDefault(); const input = readForm(); if (!input) return;
      state.input = input;
      try { state.result = S.compute(input); } catch (err) { $('#form-error').textContent = '계산에 실패했습니다: ' + err.message; $('#form-error').hidden = false; return; }
      $('#form-error').hidden = true;
      state.reading = P.generateReading(state.result, state.persona, { name: input.name || '당신' });
      show('reading'); runReading(() => { show('result'); renderResult(); });
    });
    $('#mbti-pick').innerHTML = mbtiPickHTML('mbti');
    $$('#mbti-pick .mbti-clear').forEach(b => b.addEventListener('click', () => setMBTI($('#birth'), 'mbti', null)));
    $('#hourUnknown').addEventListener('change', e => { $('#time').disabled = e.target.checked; });
    $('#btn-fill-sample').addEventListener('click', fillSample);
    $('#btn-pay').addEventListener('click', () => { $('#pay-title').textContent = state.persona.report.title; $('#pay-price').textContent = '₩' + state.persona.report.price.toLocaleString(); $('#m-pay').hidden = false; });
    $('#btn-pay-confirm').addEventListener('click', () => { $('#m-pay').hidden = true; renderReport(); });
    $('#btn-share').addEventListener('click', shareCard);
    $$('[data-close]').forEach(b => b.addEventListener('click', () => { $('#' + b.dataset.close).hidden = true; }));
    $('#btn-again').addEventListener('click', () => { renderRoster(); selectCard(state.persona.id); show('persona'); });
    $('#btn-restart').addEventListener('click', () => { setPersona(null); state.concern = null; show('intro'); });
    show('intro');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
