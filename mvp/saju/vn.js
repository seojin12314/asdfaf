/*
 * vn.js — 미연시(비주얼 노벨) 연출 엔진.
 * 캐릭터 카드를 누르면 전체 화면 무대가 열리고, 캐릭터가 말을 걸며 선택지를 주고, 대화로 정보를 받고,
 * 연출과 함께 대사를 읊으며 명식을 분석한다. 끝나면 기존 캐릭터 시트(app.js renderResult)로 넘긴다.
 * 의존: Saju, SajuPersonas, SajuReport, SajuVNScripts, SajuApp(app.js가 노출).
 */
(function (root) {
  'use strict';
  const S = root.Saju, P = root.SajuPersonas;
  const ART = 'assets/characters/';
  const reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const sleep = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const st = { open: false, persona: null, script: null, auto: false, typing: false, skipType: false, tapResolve: null, faces: {}, fx: null, autoTimer: null, closing: false, mood: 'neutral' };
  const el = {};

  // ───── DOM ─────
  function build(p) {
    const root = $('#vn'); root.hidden = false; root.classList.remove('closing');
    root.innerHTML = `
      <div class="vn-frame">
        <div class="vn-stage" id="vn-stage">
          <div class="vn-bg" aria-hidden="true">
            <img class="far" src="${ART}${p.id}/bg_intro_far.png" alt="" onerror="this.remove()">
            <img class="mid" src="${ART}${p.id}/bg_intro_mid.png" alt="" onerror="this.remove()">
            <img class="mid dup" src="${ART}${p.id}/bg_intro_mid.png" alt="" onerror="this.remove()">
            <img class="near" src="${ART}${p.id}/bg_intro_near.png" alt="" onerror="this.remove()">
          </div>
          <canvas class="vn-fx" id="vn-fx" aria-hidden="true"></canvas>
          <div class="vn-halo" aria-hidden="true"></div>
          <div class="vn-rings" id="vn-rings" hidden aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="vn-sprite hidden" id="vn-sprite" aria-hidden="true"><div class="breath"><img src="${ART}${p.id}/full.png" alt="" onerror="this.style.display='none'"></div></div>
          <div class="vn-float" id="vn-float" hidden></div>
          <div class="vn-vignette" aria-hidden="true"></div>
          <div class="vn-flash" id="vn-flash" aria-hidden="true"></div>
        </div>
        <div class="vn-top">
          <div class="vn-name" id="vn-name"><b>${esc(p.name)}</b><small>${esc(p.role)}${p.org ? ' · ' + esc(p.org) : ''}</small></div>
          <div class="vn-ctl"><button type="button" id="vn-auto" title="자동 진행">자동</button><button type="button" id="vn-exit">나가기</button></div>
        </div>
        <div class="vn-choices" id="vn-choices" hidden></div>
        <div class="vn-box" id="vn-box">
          <div class="vn-port" id="vn-port"><img src="${ART}${p.id}/face.png" alt=""></div>
          <div class="vn-body"><div class="vn-who" id="vn-who">${esc(p.name)}</div><div class="vn-text" id="vn-text"></div><div class="vn-next" id="vn-next">▼</div></div>
          <div class="vn-input" id="vn-input" hidden></div>
        </div>
      </div>`;
    ['stage', 'fx', 'rings', 'sprite', 'float', 'flash', 'name', 'auto', 'exit', 'choices', 'box', 'port', 'who', 'text', 'next', 'input'].forEach(k => { el[k] = $('#vn-' + k); });
    el.root = root;
    el.box.addEventListener('click', e => { if (e.target.closest('.vn-input')) return; tap(); });
    el.stage.addEventListener('click', tap);
    el.auto.addEventListener('click', e => { e.stopPropagation(); st.auto = !st.auto; el.auto.classList.toggle('on', st.auto); if (st.auto && st.tapResolve && !st.typing) tap(); });
    el.exit.addEventListener('click', e => { e.stopPropagation(); finish('home'); });
    bindParallax();
    document.addEventListener('keydown', onKey);
  }
  function onKey(e) { if (!st.open) return; if (e.key === ' ' || e.key === 'Enter') { if (e.target && /INPUT|BUTTON|TEXTAREA/.test(e.target.tagName)) return; e.preventDefault(); tap(); } if (e.key === 'Escape') finish('home'); }
  function bindParallax() {
    const near = el.stage.querySelector('.vn-bg .near'); if (!near || reduced) return;
    const move = (dx, dy) => { near.style.transform = `translate(${(dx * 14).toFixed(1)}px, ${(dy * 10).toFixed(1)}px) scale(1.05)`; };
    el.stage.addEventListener('pointermove', e => { const r = el.stage.getBoundingClientRect(); move((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5); });
    el.stage.addEventListener('pointerleave', () => move(0, 0));
    if (root.DeviceOrientationEvent) root.addEventListener('deviceorientation', e => { if (!st.open || e.gamma == null) return; move(Math.max(-.5, Math.min(.5, e.gamma / 60)), Math.max(-.5, Math.min(.5, (e.beta - 45) / 90))); }, { passive: true });
  }

  // ───── 표정·분위기·효과 ─────
  function probe(url) { return new Promise(res => { const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = url; }); }
  async function preloadFaces(p) { st.faces = {}; for (const k of ['face', 'face_smile', 'face_serious', 'face_talk']) st.faces[k] = await probe(`${ART}${p.id}/${k}.png`); }
  function faceUrl(name) { const k = name === 'neutral' ? 'face' : `face_${name}`; return `${ART}${st.persona.id}/${st.faces[k] ? k : 'face'}.png`; }
  function setFace(name) { const im = el.port.querySelector('img'); const u = faceUrl(name); if (im.getAttribute('src') !== u) im.src = u; }
  function setMood(face) { st.mood = face; el.stage.classList.toggle('mood-serious', face === 'serious'); el.stage.classList.toggle('mood-smile', face === 'smile'); setFace(face); }
  function spriteAnim(name) { if (reduced) return; el.sprite.classList.remove('bump', 'nod'); void el.sprite.offsetWidth; el.sprite.classList.add(name); setTimeout(() => el.sprite.classList.remove(name), 700); }
  function fx(name) {
    if (!name || reduced) return;
    if (name === 'flash' || name === 'glow') { el.flash.classList.toggle('white', name === 'flash'); el.flash.classList.remove('on'); void el.flash.offsetWidth; el.flash.classList.add('on'); if (name === 'glow') spriteAnim('bump'); }
    if (name === 'shake') { el.stage.classList.remove('shake'); void el.stage.offsetWidth; el.stage.classList.add('shake'); setTimeout(() => el.stage.classList.remove('shake'), 600); }
    if (name === 'burst' && st.fx) { st.fx.burst(); el.flash.classList.remove('white'); el.flash.classList.remove('on'); void el.flash.offsetWidth; el.flash.classList.add('on'); }
    if (name === 'dim') { el.stage.classList.add('mood-serious'); }
  }

  // ───── 입자 시스템(캐릭터별 질감) ─────
  function particles(canvas, type, color) {
    const ctx = canvas.getContext('2d'); const DPR = Math.min(root.devicePixelRatio || 1, 2); let w = 0, h = 0, ps = [], bursts = [], raf = 0, alive = true;
    function size() { const r = canvas.getBoundingClientRect(); w = canvas.width = Math.max(1, r.width * DPR); h = canvas.height = Math.max(1, r.height * DPR); }
    const N = { ember: 55, coin: 40, moon: 45, petal: 30, grid: 18, star: 60 }[type] || 50;
    function mk(init) {
      const p = { x: Math.random() * w, y: init ? Math.random() * h : h + 10 * DPR, r: (Math.random() * 2 + 1) * DPR, vx: (Math.random() - .5) * .3 * DPR, vy: -(Math.random() * .55 + .25) * DPR, a: Math.random() * Math.PI * 2, s: Math.random() * .04 + .01, rot: Math.random() * Math.PI };
      if (type === 'petal') { p.y = init ? Math.random() * h : -10 * DPR; p.vy = (Math.random() * .45 + .3) * DPR; p.r = (Math.random() * 4 + 3) * DPR; p.vx = (Math.random() - .5) * .4 * DPR; }
      if (type === 'moon' || type === 'star') { p.vy = -(Math.random() * .14 + .04) * DPR; p.r = (Math.random() * 1.6 + .6) * DPR; }
      if (type === 'grid') { p.x = -60 * DPR; p.y = Math.random() * h * .75; p.vx = (Math.random() * 1.4 + .6) * DPR; p.vy = 0; p.len = (Math.random() * 140 + 60) * DPR; p.r = DPR * .8; }
      if (type === 'coin') { p.vy = -(Math.random() * .28 + .08) * DPR; p.r = (Math.random() * 2.2 + 1.2) * DPR; }
      if (type === 'ember') { p.r = (Math.random() * 2.4 + .8) * DPR; p.vy = -(Math.random() * .8 + .3) * DPR; }
      return p;
    }
    function reset() { ps = Array.from({ length: N }, () => mk(true)); }
    function burst() { const cx = w * .5, cy = h * .55; for (let i = 0; i < 46; i++) { const a = Math.random() * Math.PI * 2, v = (Math.random() * 3.2 + 1.2) * DPR; bursts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - DPR, r: (Math.random() * 2.5 + 1) * DPR, life: 1 }); } }
    function draw() {
      if (!alive) return; ctx.clearRect(0, 0, w, h); ctx.fillStyle = color; ctx.strokeStyle = color;
      for (const p of ps) {
        p.a += p.s; p.x += p.vx + (type === 'petal' ? Math.sin(p.a * 3) * .6 * DPR : type === 'ember' ? Math.sin(p.a * 4) * .5 * DPR : 0); p.y += p.vy;
        const tw = .5 + .5 * Math.sin(p.a * 3);
        if (type === 'grid') { ctx.globalAlpha = .18 * tw + .05; ctx.lineWidth = p.r; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.len, p.y); ctx.stroke(); if (p.x > w + 10) Object.assign(p, mk(false)); continue; }
        if (type === 'petal') { ctx.globalAlpha = .55 + .35 * tw; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a * 2); ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); if (p.y > h + 20) Object.assign(p, mk(false)); continue; }
        if (type === 'star') { ctx.globalAlpha = .15 + .75 * tw; const r = p.r * (1 + tw * .6); ctx.beginPath(); ctx.moveTo(p.x, p.y - r * 2); ctx.lineTo(p.x + r * .6, p.y); ctx.lineTo(p.x, p.y + r * 2); ctx.lineTo(p.x - r * .6, p.y); ctx.closePath(); ctx.fill(); }
        else if (type === 'moon') { ctx.globalAlpha = .12 + .45 * tw; ctx.shadowBlur = 10 * DPR; ctx.shadowColor = color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
        else if (type === 'coin') { ctx.globalAlpha = .2 + .7 * tw; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.6 + tw * .5), 0, 7); ctx.fill(); }
        else { ctx.globalAlpha = .35 + .55 * tw; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.7 + tw * .4), 0, 7); ctx.fill(); }
        if (p.y < -20 || p.x < -20 || p.x > w + 20) Object.assign(p, mk(false));
      }
      bursts = bursts.filter(b => b.life > 0);
      for (const b of bursts) { b.x += b.vx; b.y += b.vy; b.vy += .03 * DPR; b.vx *= .98; b.life -= .022; ctx.globalAlpha = Math.max(0, b.life); ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(.1, b.r * b.life), 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1; raf = requestAnimationFrame(draw);
    }
    function safeDraw() { try { draw(); } catch (e) { console.warn('[vn] particles', e); } }
    size(); reset(); root.addEventListener('resize', size); if (!reduced) safeDraw(); else { ctx.clearRect(0, 0, w, h); }
    return { burst, stop() { alive = false; cancelAnimationFrame(raf); root.removeEventListener('resize', size); } };
  }

  // ───── 대사·입력 ─────
  function tap() { if (st.typing) { st.skipType = true; return; } if (st.tapResolve) { const r = st.tapResolve; st.tapResolve = null; r(); } }
  function waitTap(text) { return new Promise(res => { st.tapResolve = res; el.next.classList.add('on'); if (st.auto) st.autoTimer = setTimeout(() => { if (st.tapResolve === res) tap(); }, 900 + Math.min(2600, (text || '').length * 38)); }).then(() => { el.next.classList.remove('on'); clearTimeout(st.autoTimer); }); }
  function type(text) {
    return new Promise(res => {
      el.text.innerHTML = '<span></span><i class="caret"></i>'; const span = el.text.firstChild; let i = 0, tick = 0; st.typing = true; st.skipType = false; el.port.classList.add('talking');
      const base = st.mood; const chars = Array.from(text);
      const finishT = () => { span.textContent = text; const c = el.text.querySelector('.caret'); if (c) c.remove(); el.port.classList.remove('talking'); setFace(base); st.typing = false; res(); };
      if (reduced) return finishT();
      const step = () => { if (st.skipType || !st.open) return finishT(); span.textContent = chars.slice(0, ++i).join(''); if (i % 5 === 0) setFace((tick++ % 2) ? 'talk' : base); const ch = chars[i - 1]; const d = /[.!?…]/.test(ch) ? 190 : /[,、]/.test(ch) ? 90 : 26; if (i < chars.length) setTimeout(step, d); else finishT(); };
      step();
    });
  }
  async function say(text, o) {
    o = o || {}; if (!st.open) return;
    setMood(o.face || 'neutral'); if (o.fx) fx(o.fx); if (o.sprite) spriteAnim(o.sprite);
    el.who.textContent = st.persona.name; el.box.classList.remove('input-mode'); el.input.hidden = true;
    await type(text); if (!st.open) return; await waitTap(text);
  }
  async function choose(prompt, options) {
    if (!st.open) return null;
    setMood('neutral'); el.box.classList.remove('input-mode'); el.input.hidden = true;
    await type(prompt); if (!st.open) return null;
    return new Promise(res => {
      el.choices.innerHTML = options.map((o, i) => `<button type="button" data-i="${i}">${esc(o.label)}</button>`).join(''); el.choices.hidden = false;
      el.choices.querySelectorAll('button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const o = options[+b.dataset.i]; el.choices.hidden = true; el.choices.innerHTML = ''; res(o.value); }));
    });
  }
  async function ask(kind, prompt, o) {
    o = o || {}; if (!st.open) return null;
    setMood('neutral'); el.box.classList.add('input-mode'); el.input.hidden = true;
    await type(prompt); if (!st.open) return null;
    const html = kind === 'text' ? `<input type="text" id="vn-f" maxlength="12" placeholder="${esc(o.placeholder || '')}" autocomplete="off"><div class="rowb"><span class="hint">${o.optional ? '비워 두면 "당신"으로 불러요' : ''}</span><button type="button" class="btn primary" id="vn-ok">${esc(o.ok || '이거야')}</button></div>`
      : kind === 'gender' ? `<div class="seg"><label><input type="radio" name="vn-g" value="F" checked><span>여성</span></label><label><input type="radio" name="vn-g" value="M"><span>남성</span></label></div><div class="rowb"><span></span><button type="button" class="btn primary" id="vn-ok">${esc(o.ok || '맞아')}</button></div>`
      : kind === 'date' ? `<input type="date" id="vn-f" min="1900-01-01" max="2030-12-31"><div class="rowb"><span class="hint">양력</span><button type="button" class="btn primary" id="vn-ok">${esc(o.ok || '이 날이야')}</button></div><div class="err" id="vn-err" hidden></div>`
      : `<input type="time" id="vn-f"><div class="rowb"><button type="button" class="btn ghost" id="vn-unk">몰라요</button><button type="button" class="btn primary" id="vn-ok">${esc(o.ok || '이 시각이야')}</button></div><div class="err" id="vn-err" hidden></div>`;
    el.input.innerHTML = html; el.input.hidden = false;
    const f = $('#vn-f', el.input); if (f) setTimeout(() => f.focus(), 50);
    return new Promise(res => {
      const done = v => { el.input.hidden = true; el.input.innerHTML = ''; el.box.classList.remove('input-mode'); res(v); };
      const err = m => { const e = $('#vn-err', el.input); if (e) { e.textContent = m; e.hidden = false; } };
      $('#vn-ok', el.input).addEventListener('click', e => {
        e.stopPropagation();
        if (kind === 'text') return done(f.value.trim());
        if (kind === 'gender') return done(el.input.querySelector('input[name="vn-g"]:checked').value);
        if (kind === 'date') { if (!f.value) return err('날짜를 골라 줘.'); const [y, m, d] = f.value.split('-').map(Number); return done({ year: y, month: m, day: d }); }
        if (!f.value) return err('시각을 넣거나 "몰라요"를 눌러 줘.'); const [hh, mm] = f.value.split(':').map(Number); return done({ hour: hh, minute: mm });
      });
      const unk = $('#vn-unk', el.input); if (unk) unk.addEventListener('click', e => { e.stopPropagation(); done(null); });
      if (f) f.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#vn-ok', el.input).click(); } });
    });
  }

  // ───── 떠 있는 분석 비주얼 ─────
  function visual(v, c) {
    const A = root.SajuApp; const cur = el.float.firstElementChild;
    const swap = html => { if (cur) { cur.classList.add('out'); setTimeout(() => cur.remove(), 300); } if (!html) { setTimeout(() => { if (!el.float.firstElementChild) el.float.hidden = true; }, 320); el.stage.classList.remove('has-float'); return; } const d = document.createElement('div'); d.className = 'vn-panel'; d.innerHTML = html; el.float.hidden = false; el.float.appendChild(d); el.stage.classList.add('has-float'); return d; };
    if (!v) return swap(null);
    const r = c.r;
    if (v.type === 'pillars') return swap(`<div class="eyebrow">사주 원국</div>${A.pillarsHTML(r, true)}`);
    if (v.type === 'radar') return swap(`<div class="eyebrow">오행 분포</div>${A.radarSVG(r)}`);
    if (v.type === 'stats') { const d = swap(`<div class="eyebrow">십신 스탯</div>${A.statsHTML(r)}`); setTimeout(() => d && d.querySelectorAll('.bar i').forEach(i => i.style.width = i.dataset.w + '%'), 80); return d; }
    if (v.type === 'glyph') return swap(`<div class="vn-glyph"><div class="big ${String(v.big).length > 2 ? 'sm' : ''}">${esc(v.big)}</div><div class="t"><b>${esc(v.title)}</b><span>${esc(v.sub || '')}</span></div></div>`);
    if (v.type === 'pair') return swap(`<div class="eyebrow">${esc(v.title)}</div><div class="vn-glyph"><div class="pair"><div class="big sm">${esc(v.a.big)}</div><span class="vs">VS</span><div class="big sm">${esc(v.b.big)}</div></div><div class="t"><b>${esc(v.a.label)} · ${esc(v.b.label)}</b><span>${esc(v.sub || '')}</span></div></div>`);
    if (v.type === 'months') return swap(`<div class="eyebrow">${esc(v.title)}</div><div class="vn-months">${v.months.map((m, i) => `<div class="${v.focus.has(m.idx) ? 'focus' : ''} ${v.caution.has(m.idx) ? 'caution' : ''}" style="animation-delay:${i * 45}ms"><b>${esc(m.pillar.branch)}</b>${esc(m.pillar.branchKo)}월</div>`).join('')}<div class="legend"><span class="f"><i></i>들어오는 달</span><span class="c"><i></i>충·주의</span></div></div>`);
  }

  // ───── 흐름 ─────
  async function enter(kind) {
    el.sprite.classList.remove('hidden'); el.sprite.classList.add('enter-' + kind);
    if (kind === 'flame' || kind === 'hunter') fx('flash'); if (kind === 'master' || kind === 'child') fx('burst');
    await sleep(kind === 'sage' ? 1500 : kind === 'master' ? 1300 : 1000); el.name.classList.add('on'); await sleep(350);
  }
  async function summon(lines) {
    el.sprite.classList.add('wake'); el.rings.hidden = false; fx('flash');
    for (const l of lines) await say(l.t, Object.assign({ face: 'neutral' }, l));
    el.rings.hidden = true; el.sprite.classList.remove('wake');
  }
  function finish(mode) {
    if (!st.open || st.closing) return; st.closing = true; st.open = false; st.typing = false; st.tapResolve = null; clearTimeout(st.autoTimer);
    document.removeEventListener('keydown', onKey);
    const A = root.SajuApp;
    if (mode === 'sheet') { A.show('result'); A.renderResult(); } else { A.state.mode = 'persona'; A.show('home'); }
    el.root.classList.add('closing');
    setTimeout(() => { if (st.fx) { st.fx.stop(); st.fx = null; } el.root.hidden = true; el.root.innerHTML = ''; st.closing = false; }, reduced ? 0 : 450);
  }

  async function run(id) {
    const A = root.SajuApp, SC = root.SajuVNScripts; const p = P.personas[id], sc = SC && SC.SCRIPTS[id];
    if (!p || !sc || !A) return false;
    if (st.open) finish('home');
    st.open = true; st.closing = false; st.persona = p; st.script = sc; st.auto = false;
    A.setPersona(id); A.state.mode = 'persona';
    build(p); await preloadFaces(p);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--p-accent').trim() || p.palette.accent;
    st.fx = particles(el.fx, sc.particles, accent);
    await sleep(250);
    await enter(sc.entrance); if (!st.open) return;
    for (const l of sc.intro) { await say(l.t, l); if (!st.open) return; }
    const concern = await choose(sc.concern.prompt, sc.concern.options.map(o => ({ label: o.label, value: o.value }))); if (!st.open) return;
    const opt = sc.concern.options.find(o => o.value === concern);
    for (const l of opt.reply) { await say(l.t, l); if (!st.open) return; }

    // 정보 받기(대화형)
    let input = null; const prev = A.state.input;
    if (prev) { const k = await choose(sc.ask.reuse.prompt, [{ label: sc.ask.reuse.keep, value: 'keep' }, { label: sc.ask.reuse.fresh, value: 'fresh' }]); if (!st.open) return; if (k === 'keep') input = Object.assign({}, prev); }
    if (!input) {
      for (const l of sc.ask.lead) { await say(l.t, l); if (!st.open) return; }
      const name = await ask('text', sc.ask.name, { optional: true, placeholder: '이름 또는 별칭' }); if (!st.open) return;
      const gender = await ask('gender', sc.ask.gender); if (!st.open) return;
      const d = await ask('date', sc.ask.date); if (!st.open) return;
      const t = await ask('time', sc.ask.time); if (!st.open) return;
      input = { name, year: d.year, month: d.month, day: d.day, hour: t ? t.hour : 12, minute: t ? t.minute : 0, hourUnknown: !t, gender, solarCorrectionMin: -30, mbti: prev && prev.mbti ? prev.mbti : null };
    }
    const name = input.name || '당신';
    let pr = null;
    if (sc.ask.partner && (sc.partnerFor || []).includes(concern)) {
      const y = await choose(sc.ask.partner.prompt, [{ label: sc.ask.partner.yes, value: 'y' }, { label: sc.ask.partner.no, value: 'n' }]); if (!st.open) return;
      if (y === 'y') {
        const g = await ask('gender', sc.ask.partner.gender); if (!st.open) return;
        const d = await ask('date', sc.ask.partner.date); if (!st.open) return;
        try { pr = S.compute({ year: d.year, month: d.month, day: d.day, hour: 12, minute: 0, hourUnknown: true, gender: g, solarCorrectionMin: 0 }); } catch (e) { pr = null; }
        await say(sc.ask.partner.got, { face: 'smile', fx: 'glow' });
      } else await say(sc.ask.partner.skip, { face: 'neutral' });
      if (!st.open) return;
    }
    for (const l of sc.ask.done) { await say(P.fill(l.t, { name }), l); if (!st.open) return; }

    if (!A.compute(input)) { await say('계산에 실패했어요. 날짜를 다시 확인해 주세요.', { face: 'serious' }); return finish('home'); }
    const r = A.state.result;
    await summon(sc.summon); if (!st.open) return;
    const c = { name, r, p, pr, concern, dayKo: r.day.stemKo + r.dayMaster.elementKo, className: P.classNames[r.day.stem], strong: r.strongestGroup, weak: r.weakestGroup, seunNext: r.seun[1].year, year: r.seun[0].year };
    const beats = sc.beats(c);
    for (const b of beats) { if ('visual' in b) visual(b.visual, c); await say(P.fill(b.t, c), b); if (!st.open) return; }
    visual(null, c);
    for (const l of sc.ending.lines) { await say(P.fill(l.t, c), l); if (!st.open) return; }
    const end = await choose(sc.ending.prompt, [{ label: sc.ending.sheet, value: 'sheet' }, { label: sc.ending.again, value: 'home' }]); if (!st.open) return;
    finish(end);
    return true;
  }

  root.SajuVN = { start: id => { run(id).catch(err => { console.error('[vn]', err); finish('home'); }); }, close: () => finish('home'), get open() { return st.open; } };
})(typeof self !== 'undefined' ? self : this);
