/* home-stage.js — 홈 2.5D 상담자 무대.
   카드가 아니라 캐릭터 전신이 원형 무대 위에서 직접 돈다. 스와이프·화살표·얼굴 칩·키보드로 회전,
   정면 인물에 맞춰 이름/역할/한 줄/강조색/버튼이 바뀐다. 전문가(정경진)는 Premium 연출(오라·광선·천간지지 궤도·불티). */
(function () {
  'use strict';
  const ART = 'assets/characters/';
  const GLYPH = '甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥'.split('');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;

  /** @param {HTMLElement} host  무대를 그릴 컨테이너(#roster)
   *  @param {Array} P  [{id,name,role,tagline,acc,glow,prem,sees,startIndex?}]
   *  @param {(id:string)=>void} onPick  정면 인물 선택 */
  function render(host, P, onPick) {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    const N = P.length, STEP = Math.PI * 2 / N;
    host.className = 'hstage-wrap';
    host.innerHTML = `
      <div class="hstage" id="hstage" aria-roledescription="carousel" aria-label="상담자 선택 무대">
        <div class="hs-bgfar"></div><div class="hs-floor"></div><div class="hs-spot"></div>
        <button type="button" class="hs-arrow l" data-dir="-1" aria-label="이전 상담자">‹</button>
        <button type="button" class="hs-arrow r" data-dir="1" aria-label="다음 상담자">›</button>
      </div>
      <div class="hs-info" id="hs-info" aria-live="polite">
        <div class="hs-name" id="hs-name"></div>
        <div class="hs-role" id="hs-role"></div>
        <div class="hs-tl" id="hs-tl"></div>
        <div class="hs-premline">연애·돈·직업·가족·자녀·MBTI까지, 명식 하나로 전부 풀어 드려요</div>
        <div class="hs-sees" id="hs-sees"></div>
      </div>
      <div class="hs-chips" id="hs-chips"></div>
      <div class="hs-cta"><button type="button" class="btn primary block" id="hs-cta"></button><div class="hs-hint">옆으로 밀거나 얼굴을 눌러 상담자를 바꿀 수 있어요</div></div>`;
    const stage = host.querySelector('#hstage'), info = host.querySelector('#hs-info'), chips = host.querySelector('#hs-chips'), cta = host.querySelector('#hs-cta');
    const els = P.map((p, i) => {
      const d = document.createElement('div'); d.className = 'hs-char' + (p.prem ? ' prem' : ''); d.dataset.i = i;
      const extras = p.prem ? `<div class="hs-aura"></div><div class="hs-rays"></div><div class="hs-orbs">${GLYPH.map(g => `<span class="hs-orb">${g}</span>`).join('')}</div>${Array.from({ length: 9 }, (_, k) => `<span class="hs-spark" style="left:${8 + k * 10}%;bottom:${10 + (k * 37) % 40}%;animation-delay:${(k * 0.31).toFixed(2)}s"></span>`).join('')}` : '';
      d.innerHTML = `<div class="hs-shadow"></div>${extras}<img src="${ART}${p.id}/full.png" alt="${esc(p.name)}" draggable="false" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">${p.prem ? '<span class="hs-tag">✦ PREMIUM</span>' : ''}`;
      d.addEventListener('click', () => { if (Math.abs(dragDx) < 6) { if (i === cur) onPick(p.id); else go(i); } });
      stage.appendChild(d); return d;
    });
    const chipEls = P.map((p, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = p.prem ? 'prem' : ''; b.setAttribute('aria-label', p.name); b.innerHTML = `<img src="${ART}${p.id}/sm_face.png" alt="" decoding="async">`; b.addEventListener('click', () => go(i)); chips.appendChild(b); return b; });
    const orbEls = Array.from(stage.querySelectorAll('.hs-char.prem .hs-orb'));

    let pos = 0, tgt = 0, cur = -1, dragging = false, dragX = 0, dragDx = 0, dragStart = 0, vel = 0, lastT = 0;
    const RX = () => Math.max(60, Math.min(stage.clientWidth * 0.46, 210)); // 무대가 숨겨져 폭이 0이어도 0으로 나누지 않게
    const RY = () => stage.clientHeight * 0.16;
    function layout() {
      const rx = RX(), ry = RY();
      els.forEach((d, i) => {
        let a = (i - pos) * STEP; a = Math.atan2(Math.sin(a), Math.cos(a));
        const depth = (Math.cos(a) + 1) / 2, x = Math.sin(a) * rx, y = -(1 - depth) * ry, s = 0.42 + 0.58 * Math.pow(depth, 1.15);
        d.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
        d.style.zIndex = Math.round(depth * 100) + 1;
        d.style.opacity = (0.28 + 0.72 * depth).toFixed(3);
        d.style.filter = `brightness(${(0.6 + 0.4 * depth).toFixed(3)}) saturate(${(0.65 + 0.35 * depth).toFixed(3)}) blur(${((1 - depth) * 2).toFixed(2)}px)`;
        d.classList.toggle('front', depth > 0.985);
      });
      const nearest = ((Math.round(pos) % N) + N) % N; if (Number.isFinite(nearest) && nearest !== cur) setInfo(nearest);
    }
    function setInfo(i) {
      const p = P[i]; cur = i; info.classList.add('sw');
      setTimeout(() => { host.querySelector('#hs-name').textContent = p.name; host.querySelector('#hs-role').textContent = p.role; host.querySelector('#hs-tl').textContent = p.tagline; info.classList.remove('sw'); }, 160);
      host.style.setProperty('--acc', p.acc); host.style.setProperty('--acc-glow', p.glow);
      chipEls.forEach((b, k) => b.classList.toggle('on', k === i));
      info.classList.toggle('prem', !!p.prem); host.querySelector('#hs-name').classList.toggle('prem', !!p.prem);
      host.querySelector('#hs-sees').innerHTML = (p.sees || []).map(s => `<span>${esc(s)}</span>`).join('');
      cta.classList.toggle('prem', !!p.prem); cta.textContent = p.prem ? `✦ ${p.name}에게 전부 묻기 · Premium` : `${p.name}에게 묻기`;
    }
    function go(i) { const base = Math.round(tgt); let d = ((i - base) % N + N) % N; if (d > N / 2) d -= N; tgt = base + d; }
    function orbit(t) {
      const M = orbEls.length; if (!M) return;
      for (let k = 0; k < M; k++) { const a = t * 0.00045 + k * Math.PI * 2 / M, depth = (Math.cos(a) + 1) / 2; const el = orbEls[k]; el.style.transform = `translate(${Math.sin(a) * 150}px, ${-Math.cos(a) * 26 + Math.sin(k * 1.7) * 90}px) scale(${0.55 + 0.75 * depth})`; el.style.opacity = (0.25 + 0.75 * depth).toFixed(2); el.style.zIndex = depth > 0.5 ? 2 : 0; }
    }
    function tick(t) {
      if (!Number.isFinite(pos) || !Number.isFinite(tgt)) { pos = tgt = Number.isFinite(tgt) ? tgt : 0; }
      if (!dragging) { const diff = tgt - pos; pos += diff * (reduced ? 1 : 0.14); if (Math.abs(diff) < 0.0005) pos = tgt; }
      layout(); if (!reduced) orbit(t); raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    stage.addEventListener('pointerdown', e => { if (e.target.closest('.hs-arrow')) return; dragging = true; dragX = e.clientX; dragDx = 0; dragStart = pos; vel = 0; lastT = performance.now(); stage.classList.add('drag'); stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - dragX, now = performance.now(); vel = (dx - dragDx) / Math.max(1, now - lastT); lastT = now; dragDx = dx; pos = dragStart - dx / (RX() * 1.1); });
    const endDrag = () => { if (!dragging) return; dragging = false; stage.classList.remove('drag'); const fling = (-vel * 160) / (RX() * 1.1); tgt = Math.round(pos + (Number.isFinite(fling) ? Math.max(-2, Math.min(2, fling)) : 0)); if (!Number.isFinite(tgt)) tgt = 0; };
    stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
    host.querySelectorAll('.hs-arrow').forEach(b => b.addEventListener('click', () => { tgt = Math.round(tgt) + Number(b.dataset.dir); }));
    stage.tabIndex = 0;
    stage.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { tgt = Math.round(tgt) - 1; e.preventDefault(); } if (e.key === 'ArrowRight') { tgt = Math.round(tgt) + 1; e.preventDefault(); } if (e.key === 'Enter') onPick(P[cur].id); });
    cta.addEventListener('click', () => onPick(P[cur].id));
    const start = P.findIndex(p => p.startIndex); if (start > 0) { pos = tgt = start; }
    setInfo(((Math.round(pos) % N) + N) % N);
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  window.SajuHomeStage = { render, stop };
})();
