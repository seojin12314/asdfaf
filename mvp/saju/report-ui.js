/*
 * report-ui.js — report2 결과를 모바일 컴포넌트로 그린다(390px 기준).
 *  L1: 정체성 카드 · 피할 것 3카드(결제 전 1번만 공개) · 열두 달 미니맵 · 진입점 3개
 *  L2: 섹션(결론 → 캐릭터 한마디 → 본문 ≤3문장 단락 → 시각화 → 피할 것(위)/대신(아래))
 *  끝: 대신 3개 모음 + 4주 체크(저장) + 맺음 · L3: 접힌 아코디언 + 용어집
 */
(function (root) {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = {
    木: '<svg viewBox="0 0 48 48"><path d="M24 44V26M24 26 12 16M24 26l12-10M24 26l-7-16M24 26l7-16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="24" cy="10" r="4" fill="currentColor"/></svg>',
    火: '<svg viewBox="0 0 48 48"><path d="M24 4c2 8 10 11 10 22a10 10 0 0 1-20 0c0-5 2-8 4-11 0 4 2 6 4 6 0-7 0-12 2-17z" fill="currentColor"/></svg>',
    土: '<svg viewBox="0 0 48 48"><path d="M4 40 18 14l8 12 6-8 12 22z" fill="currentColor"/></svg>',
    金: '<svg viewBox="0 0 48 48"><path d="M24 4 44 20 24 44 4 20z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M4 20h40M24 4l-8 16 8 24 8-24z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    水: '<svg viewBox="0 0 48 48"><path d="M24 4c8 12 14 19 14 27a14 14 0 0 1-28 0c0-8 6-15 14-27z" fill="currentColor"/></svg>',
  };
  const SRC_KO = { natal: '타고난 자리', seun: '올해 날씨', month: '멈출 달' };
  const GRADE_KO = { 추진: '추진', 보통: '보통', 주의: '주의' };
  const sents = t => String(t).split(/(?<=[.!?])\s+/).filter(Boolean);
  const paras = arr => { const out = []; for (let i = 0; i < arr.length; i += 3) out.push(`<p>${arr.slice(i, i + 3).map(esc).join(' ')}</p>`); return out.join(''); };

  function identityHTML(rep, compact) {
    const id = rep.L1.identity; const [head, tail] = id.line.split(' — ');
    const letters = id.letters ? `<div class="id-letters">${id.letters.test ? `<span><b>${esc(id.letters.test)}</b><small>검사</small></span>` : ''}<span class="chart"><b>${esc(id.letters.chart)}</b><small>타고난 결</small></span>${id.letters.goal ? `<span><b>${esc(id.letters.goal)}</b><small>추구</small></span>` : ''}${id.letters.rec ? `<span class="rec"><b>${esc(id.letters.rec)}</b><small>권하는 흐름</small></span>` : ''}</div>` : '';
    return `<div class="idcard el-${id.elem}"><div class="id-icon">${ICON[id.elem]}</div><div class="id-body"><div class="id-head">${esc(head)}</div><div class="id-tail">${esc(tail)}</div><div class="id-meta"><span class="chip">${esc(id.seasonBadge)}</span><span class="chip">${esc(id.name)}의 타고난 판</span></div>${compact ? '' : letters}</div></div>`;
  }
  function calendarHTML(rep, locked) {
    return `<div class="cal12 ${locked ? 'locked' : ''}">${rep.L1.calendar.map((c, i) => `<button type="button" class="cell g-${c.grade}" data-cal="${i}" ${locked ? 'disabled' : ''}><b>${esc(c.label)}</b><small>${esc(c.range)}</small></button>`).join('')}</div><div class="cal-legend"><span class="g-추진">추진</span><span class="g-보통">보통</span><span class="g-주의">주의</span></div><div class="cal-tip" id="cal-tip" hidden></div>`;
  }
  function trioHTML(rep, locked, showWhy) {
    return `<div class="trio">${rep.L1.trio.map((t, i) => { const lock = locked && i > 0; return `<div class="tcard ${lock ? 'lock' : ''}"><div class="tnum">${i + 1}</div><div class="tbody"><div class="tsrc">${SRC_KO[t.src]}</div><div class="tavoid">${lock ? esc(t.avoid.slice(0, 10)) + '…' : esc(t.avoid)}</div>${!lock && showWhy ? `<div class="twhy">${esc(t.why)} <a class="why-link" data-l3="${t.whyId}">왜?</a></div>` : ''}</div>${lock ? '<div class="tlock" aria-label="잠김">🔒</div>' : ''}</div>`; }).join('')}</div>`;
  }
  /** 결제 전: 정체성 + 제목 + 1번 공개 + 2·3번 블러 + 달력 블러 */
  function teaserHTML(rep) {
    return `<div class="l1 teaser-l1">${identityHTML(rep, true)}<h3 class="l1-title">${esc(rep.L1.avoidTitle)}</h3>${trioHTML(rep, true, false)}<div class="l1-sub">${esc(rep.nextY)}년 열두 달 미니맵</div>${calendarHTML(rep, true)}<div class="l1-entries locked">${rep.L1.entries.map(e => `<span class="chip">${esc(e.label)}</span>`).join('')}<span class="chip">왜 그런가요? 근거</span></div></div>`;
  }
  function barsHTML(viz) {
    const row = x => `<div class="brow lv-${x.level}"><span class="bname">${esc(x.name)}</span><span class="bar"><i style="width:${Math.round(x.n / x.tot * 100)}%"></i>${x.n === 0 ? '<em class="empty"></em>' : ''}</span><span class="blv">${esc(x.level)}</span></div>`;
    return `<div class="bars"><div class="bars-h">다섯 힘</div>${viz.groups.map(row).join('')}<div class="bars-h">다섯 기운</div>${viz.elems.map(row).join('')}</div>`;
  }
  function timelineHTML(viz) {
    if (!viz.list.length) return '';
    return `<div class="tl"><div class="tl-track">${viz.list.map(d => `<div class="tl-seg ${d.now ? 'now' : ''} ${d.clash ? 'clash' : ''}"><b>${d.from}</b><small>${esc(d.theme).replace('의 10년', '')}</small></div>`).join('')}</div>${viz.edge ? '<div class="tl-note">빗금 구간은 원국과 부딪히는 10년, 지금은 계절이 바뀌는 경계예요.</div>' : '<div class="tl-note">진한 칸이 지금 10년, 빗금은 원국과 부딪히는 10년이에요.</div>'}</div>`;
  }
  function yearsHTML(viz) { return `<div class="years">${viz.years.map(y => `<div class="ycard"><b>${y.year}</b><div class="yimg">${esc(y.image)}</div><div class="yflow"><span>${esc(y.stem)}</span><i>→</i><span>${esc(y.branch)}</span></div></div>`).join('')}</div>`; }
  function axesHTML(viz) {
    const L = viz.letters;
    return `<div class="ax3">${L.test ? `<span><b>${esc(L.test)}</b><small>검사</small></span>` : ''}<span class="chart"><b>${esc(L.chart)}</b><small>타고난 결</small></span>${L.goal ? `<span><b>${esc(L.goal)}</b><small>추구</small></span>` : ''}${L.rec ? `<span class="rec"><b>${esc(L.rec)}</b><small>권하는 흐름</small></span>` : ''}</div><div class="axes">${viz.axes.map(a => { const w = Math.abs(a.pct - 50); const fill = a.pct >= 50 ? `left:${50 - w}%;width:${w}%` : `left:50%;width:${w}%`; return `<div class="axis"><div class="l ${a.letter === a.left ? 'on' : ''}">${a.left}</div><div class="track"><div class="fill" style="${fill}"></div>${a.test ? `<div class="test" style="left:${a.test === a.left ? '5%' : '95%'}">${a.test}</div>` : ''}${a.goal ? `<div class="goal" style="left:${a.goal === a.left ? '18%' : '82%'}">★</div>` : ''}</div><div class="r ${a.letter === a.right ? 'on' : ''}">${a.right}</div></div>`; }).join('')}</div>`;
  }
  function vizHTML(s, rep) {
    const v = s.viz; if (!v) return '';
    if (v.type === 'bars') return barsHTML(v); if (v.type === 'timeline') return timelineHTML(v); if (v.type === 'calendar') return calendarHTML(rep, false); if (v.type === 'years') return yearsHTML(v); if (v.type === 'axes') return axesHTML(v);
    return '';
  }
  function pairHTML(avoid, instead) { return `<div class="pair"><div class="p-avoid"><span class="plabel">피할 것</span><p>${esc(avoid)}</p></div><div class="p-instead"><span class="plabel">대신 이렇게</span>${sents(instead).map(x => `<p>${esc(x)}</p>`).join('')}</div></div>`; }
  function sectionHTML(s, i, rep, personaFace) {
    return `<section class="l2sec ${s.focus ? 'focus' : ''}" id="sec-${s.id}" data-n="${i + 1}"><div class="l2head"><span class="l2num">${String(i + 1).padStart(2, '0')}</span><h4>${esc(s.title)}</h4>${s.focus ? '<span class="chip accent">이 캐릭터의 전문</span>' : ''}</div><p class="l2concl">${esc(s.conclusion)}</p>${s.memo ? `<div class="memo">${personaFace || ''}<q>${esc(s.memo)}</q></div>` : ''}<div class="l2body">${paras(s.body)}</div>${vizHTML(s, rep)}${pairHTML(s.avoid, s.instead)}</section>`;
  }
  function endHTML(rep, planKey) {
    return `<section class="l2end" id="sec-end"><div class="l2head"><span class="l2num">✓</span><h4>${esc(rep.end.title)}</h4></div><div class="insteads">${rep.end.insteads.map((x, i) => `<div class="icard ${x.fills ? 'fills' : ''}"><b>${i + 1}</b><p>${esc(x.text)}</p>${x.fills ? '<small>빈 기운 채우기 · 4주 계획과 연결</small>' : ''}</div>`).join('')}</div><div class="plan4"><div class="plan-h">${esc(rep.end.planTitle)}</div>${rep.end.plan.map((p, i) => `<label class="pitem"><input type="checkbox" data-plan="${i}" data-key="${esc(planKey)}"><span>${esc(p)}</span></label>`).join('')}</div><div class="closing">${rep.end.closing.map(c => `<p>${esc(c)}</p>`).join('')}</div></section>`;
  }
  function l3HTML(rep) {
    return `<div class="l3"><div class="l3-h">왜 이렇게 나왔나요? <small>근거 · 전문용어는 여기서만</small></div>${rep.L3.map(s => `<details class="l3d" id="${s.id}"><summary>${esc(s.title)}</summary><div class="l3b">${s.html}</div></details>`).join('')}<details class="l3d" id="l3-glossary"><summary>용어집</summary><div class="l3b"><dl class="gloss">${rep.glossary.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></div></details></div>`;
  }
  /** 결제 후 전체 */
  function fullHTML(rep, opts) {
    opts = opts || {}; const face = opts.personaFace || '';
    return `<div class="l1">${identityHTML(rep, false)}<h3 class="l1-title">${esc(rep.L1.avoidTitle)}</h3>${trioHTML(rep, false, true)}<div class="l1-sub">${esc(rep.nextY)}년 열두 달 미니맵</div>${calendarHTML(rep, false)}<div class="l1-entries">${rep.L1.entries.map(e => `<a class="chip" data-go="sec-${e.id}">${esc(e.label)}</a>`).join('')}<a class="chip" data-go="l3-top">왜 그런가요?</a></div></div><div class="l2">${rep.L2.map((s, i) => sectionHTML(s, i, rep, face)).join('')}${endHTML(rep, opts.planKey || 'plan')}</div><div id="l3-top"></div>${l3HTML(rep)}`;
  }
  /** 이벤트: 달력 탭 지침, 진입점 스크롤, 왜? 링크 → L3 펼침, 4주 체크 저장 */
  function bind(rootEl, rep) {
    const tipFor = (cellBtn) => { const i = +cellBtn.dataset.cal; const c = rep.L1.calendar[i]; const sec = rep.L2.find(s => s.viz && s.viz.type === 'calendar'); const tip = sec && sec.viz.cells[i] ? sec.viz.cells[i].tip : ''; const box = cellBtn.closest('.l1, .l2sec, .teaser-l1'); const t = box && box.querySelector('.cal-tip'); if (t) { t.hidden = false; t.textContent = `${c.label}(${c.range}) · ${GRADE_KO[c.grade]} — ${tip}`; } box && box.querySelectorAll('.cell.sel').forEach(x => x.classList.remove('sel')); cellBtn.classList.add('sel'); };
    rootEl.querySelectorAll('.cal12 .cell:not([disabled])').forEach(b => b.addEventListener('click', () => tipFor(b)));
    rootEl.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', () => { const t = rootEl.querySelector('#' + a.dataset.go); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    rootEl.querySelectorAll('[data-l3]').forEach(a => a.addEventListener('click', () => { const d = rootEl.querySelector('#' + a.dataset.l3); if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }));
    rootEl.querySelectorAll('input[data-plan]').forEach(cb => { const key = 'saju-plan-' + cb.dataset.key; let saved = {}; try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { /* ignore */ } cb.checked = !!saved[cb.dataset.plan]; cb.addEventListener('change', () => { saved[cb.dataset.plan] = cb.checked; try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) { /* ignore */ } cb.closest('.pitem').classList.toggle('done', cb.checked); }); cb.closest('.pitem').classList.toggle('done', cb.checked); });
  }
  root.SajuReportUI = { teaserHTML, fullHTML, identityHTML, calendarHTML, trioHTML, bind };
})(typeof self !== 'undefined' ? self : this);
