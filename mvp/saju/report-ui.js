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
  const calendarLabel = (c, rep) => c.yearLabel && c.yearLabel !== rep.nextY ? `${c.yearLabel}년 ${c.label}` : c.label;
  const calendarPeriod = rep => `${rep.nextY}년 2월~${rep.nextY + 1}년 1월`;
  const sents = t => String(t).split(/(?<=[.!?])\s+/).filter(Boolean);
  const paras = arr => { const out = []; for (let i = 0; i < arr.length; i += 3) out.push(`<p>${arr.slice(i, i + 3).map(esc).join(' ')}</p>`); return out.join(''); };

  function identityHTML(rep, compact) {
    const id = rep.L1.identity; const [head, tail] = id.line.split(' — ');
    const letters = id.letters ? `<div class="id-letters">${id.letters.test ? `<span><b>${esc(id.letters.test)}</b><small>검사</small></span>` : ''}<span class="chart"><b>${esc(id.letters.chart)}</b><small>타고난 결</small></span>${id.letters.goal ? `<span><b>${esc(id.letters.goal)}</b><small>추구</small></span>` : ''}${id.letters.rec ? `<span class="rec"><b>${esc(id.letters.rec)}</b><small>권하는 흐름</small></span>` : ''}</div>` : '';
    return `<div class="idcard el-${id.elem}"><div class="id-icon">${ICON[id.elem]}</div><div class="id-body"><div class="id-head">${esc(head)}</div><div class="id-tail">${esc(tail)}</div><div class="id-meta"><span class="chip">${esc(id.seasonBadge)}</span><span class="chip">${esc(id.name)}의 타고난 판</span></div>${compact ? '' : letters}</div></div>`;
  }
  function calendarHTML(rep, locked) {
    return `<div class="cal12 ${locked ? 'locked' : ''}">${rep.L1.calendar.map((c, i) => `<button type="button" class="cell g-${c.grade}" data-cal="${i}" ${locked ? 'disabled' : ''}><b>${esc(c.label)}</b><small>${c.yearLabel && c.yearLabel !== rep.nextY ? `'${String(c.yearLabel).slice(2)} ` : ''}${esc(c.range)}</small></button>`).join('')}</div><div class="cal-legend"><span class="g-추진">추진</span><span class="g-보통">보통</span><span class="g-주의">주의</span></div><div class="cal-tip" id="cal-tip" hidden></div>`;
  }
  function trioHTML(rep, locked, showWhy) {
    return `<div class="trio">${rep.L1.trio.map((t, i) => { const lock = locked && i > 0; return `<div class="tcard ${lock ? 'lock' : ''}"><div class="tnum">${i + 1}</div><div class="tbody"><div class="tsrc">${t.src === 'seun' ? rep.nextY + '년 흐름' : SRC_KO[t.src]}</div><div class="tavoid">${lock ? esc(t.avoid.slice(0, 10)) + '…' : esc(t.avoid)}</div>${!lock && showWhy ? `<div class="twhy">${esc(t.why)} <a class="why-link" data-l3="${t.whyId}">왜?</a></div>` : ''}</div>${lock ? '<div class="tlock" aria-label="잠김">🔒</div>' : ''}</div>`; }).join('')}</div>`;
  }
  /** 결제 전: 정체성 + 제목 + 1번 공개 + 2·3번 블러 + 달력 블러 */
  function teaserHTML(rep) {
    return `<div class="l1 teaser-l1">${identityHTML(rep, true)}<h3 class="l1-title">${esc(rep.L1.avoidTitle)}</h3>${trioHTML(rep, true, false)}<div class="l1-sub">${esc(calendarPeriod(rep))} 미니맵</div>${calendarHTML(rep, true)}<div class="l1-entries locked">${rep.L1.entries.map(e => `<span class="chip">${esc(e.label)}</span>`).join('')}<span class="chip">왜 그런가요? 근거</span></div></div>`;
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
  function compatVizHTML(v) {
    return `<div class="cviz"><div class="cscore" style="--p:${v.score}"><b>${v.score}</b><small>${esc(v.label)}</small></div><div class="cpair"><span><small>${esc(v.a.name)}</small><b>${esc(v.a.ko)}</b></span><i>×</i><span><small>${esc(v.b.name)}</small><b>${esc(v.b.ko)}</b></span></div><div class="ctags">${(v.tags.length ? v.tags : ['특별한 합·충 없음']).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div><div class="cmonths">둘 다 좋은 달 <b>${esc(v.good.join('·') || '없음')}</b>${v.shaky.length ? ` · 흔들리는 달 <b>${esc(v.shaky.join('·'))}</b>` : ''}</div></div>`;
  }
  function vizHTML(s, rep) {
    const v = s.viz; if (!v) return '';
    if (v.type === 'compat') return compatVizHTML(v);
    if (v.type === 'bars') return barsHTML(v); if (v.type === 'timeline') return timelineHTML(v); if (v.type === 'calendar') return calendarHTML(rep, false); if (v.type === 'years') return yearsHTML(v); if (v.type === 'axes') return axesHTML(v);
    return '';
  }
  function pairHTML(avoid, instead) { return `<div class="pair"><div class="p-avoid"><span class="plabel">피할 것</span><p>${esc(avoid)}</p></div><div class="p-instead"><span class="plabel">대신 이렇게</span>${sents(instead).map(x => `<p>${esc(x)}</p>`).join('')}</div></div>`; }
  function sectionHTML(s, i, rep, personaFace) {
    return `<section class="l2sec ${s.focus ? 'focus' : ''}" id="sec-${s.id}" data-n="${i + 1}"><div class="l2head"><span class="l2num">${String(i + 1).padStart(2, '0')}</span><h4>${esc(s.title)}</h4>${s.focus ? '<span class="chip accent">이 캐릭터의 전문</span>' : ''}</div><p class="l2concl">${esc(s.conclusion)}</p>${s.memo ? `<div class="memo">${personaFace || ''}<q>${esc(s.memo)}</q></div>` : ''}<div class="l2body">${paras(s.body)}</div>${vizHTML(s, rep)}${pairHTML(s.avoid, s.instead)}</section>`;
  }
  function endHTML(rep, planKey) {
    return `<section class="l2end" id="sec-end"><div class="l2head"><span class="l2num">✓</span><h4>${esc(rep.end.title)}</h4></div><div class="insteads">${rep.end.insteads.map((x, i) => `<div class="icard ${x.fills ? 'fills' : ''}"><b>${i + 1}</b><p>${esc(x.text)}</p>${x.fills ? '<small>빈 기운 채우기 · 4주 계획과 연결</small>' : ''}</div>`).join('')}</div><div class="plan4"><div class="plan-h">${esc(rep.end.planTitle)}</div>${rep.end.plan.map((p, i) => `<label class="pitem"><input type="checkbox" data-plan="${i}" data-key="${esc(planKey)}"><span>${esc(p)}</span></label>`).join('')}</div><div class="todo"><div class="plan-h">오늘 할 일 하나 → 내 메모</div><label class="pitem"><input type="checkbox" data-todo data-key="${esc(planKey)}"><span>${esc((rep.end.plan[0] || '').replace(/^\d주:\s*/, ''))}</span></label><textarea data-note rows="2" maxlength="200" placeholder="해 보고 느낀 것 한 줄. 다음에 보관함에서 이어 볼 수 있어요."></textarea><div class="todo-meta" data-todo-meta></div></div><div class="closing">${rep.end.closing.map(c => `<p>${esc(c)}</p>`).join('')}</div></section>`;
  }
  function l3HTML(rep) {
    return `<div class="l3"><div class="l3-h">왜 이렇게 나왔나요? <small>근거 · 전문용어는 여기서만</small></div>${rep.L3.map(s => `<details class="l3d" id="${s.id}"><summary>${esc(s.title)}</summary><div class="l3b">${s.html}</div></details>`).join('')}<details class="l3d" id="l3-glossary"><summary>용어집</summary><div class="l3b"><dl class="gloss">${rep.glossary.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></div></details></div>`;
  }
  /** 결제 후 전체 */
  function qaCard(a, badge) { return `<div class="qa" id="qa-${esc(a.id)}">${badge ? `<span class="first-badge">${badge}</span>` : ''}<div class="qq"><span class="qn">Q${String(a.n).padStart(2, '0')}</span><b>${esc(a.q.replace(/^★\s*/, ''))}</b></div><div class="qa-a">${(a.text.match(/[^.!?]+[.!?]?/g) || [a.text]).map(x => `<p>${esc(x.trim())}</p>`).join('')}</div></div>`; }
  /** 결제한 답(고른 질문)만. 나머지·추가 판매는 qaRestHTML 로 맨 뒤에. */
  function qaHTML(qa) {
    if (!qa) return '';
    return `<section class="l2sec qa-sec" id="sec-qa"><div class="l2head"><span class="l2num">Q</span><h4>${esc(qa.title)}</h4><span class="chip accent">${qa.expert && qa.all ? `전 문항 ${qa.answers.length + qa.rest.length}` : `${qa.answers.length}문항`}</span></div><p class="l2concl">${esc(qa.lead)}</p>${qa.expert ? `<div class="qtoc"><span>책갈피</span><a class="chip accent" data-go="sec-qa">정통 ${qa.answers.length + qa.rest.length}</a>${(qa.extra || []).map(x => `<a class="chip" data-go="qx-${x.domain}">${esc(x.ko)} ${x.answers.length}</a>`).join('')}${qa.gloss ? '<a class="chip" data-go="qgloss">용어표</a>' : ''}<a class="chip" data-go="sec-end">4주 실행표</a></div>` : ''}${qa.first3 && qa.first3.length ? `<div class="first3"><div class="qev-h">먼저 읽을 답 ${qa.first3.length}</div>${qa.first3.map((a, i) => `<a class="first3-row" data-go="qa-${esc(a.id)}"><b>${i + 1}</b><span>${esc(a.q.replace(/^★\s*/, ''))}</span><small>${esc(a.text.replace(/\. [\s\S]*$/, '.'))}</small></a>`).join('')}</div>` : ''}${qa.evidence || ''}${qa.answers.map((a, i) => qaCard(a, qa.first3 && i < qa.first3.length ? `먼저 읽기 ${i + 1}` : '')).join('')}</section>`;
  }
  function qaRestHTML(qa) {
    if (!qa) return '';
    const lockRow = x => `<div class="qlock ${x.locked ? 'need' : ''}"><span class="qn">Q${String(x.n).padStart(2, '0')}</span><span>${esc(x.q.replace(/^★\s*/, ''))}</span>${x.locked ? `<small>${esc(x.locked)}</small>` : '<small>🔒</small>'}</div>`;
    const openRest = qa.rest.filter(x => !x.locked).length;
    const rest = qa.rest.length ? `<div class="qrest"><div class="qrest-h">${qa.all ? `열린 나머지 문항 ${qa.rest.length}개` : `아직 안 본 질문 ${qa.rest.length}개`}</div>${qa.all ? qa.rest.map(x => qaCard(x)).join('') : qa.rest.map(lockRow).join('') + (openRest ? `<button type="button" class="btn primary block" id="btn-unlock">+₩5,000으로 ${openRest}문항 전부 열기</button>` : '')}</div>` : '';
    const extra = (qa.extra || []).map(x => `<details class="qx" id="qx-${esc(x.domain)}"><summary><b>${esc(x.ko)}</b><span>${x.answers.length}문항 답${x.locked ? ` · 추가 정보 필요 ${x.locked}` : ''}</span></summary>${x.answers.map(y => qaCard(y)).join('')}</details>`).join('');
    const gloss = qa.gloss ? `<details class="qgloss" id="qgloss"><summary><b>전문가 용어표</b><span>${qa.gloss.length}개 · 원어 ↔ 쉬운 말</span></summary><table><tbody>${qa.gloss.map(g => `<tr><th>${esc(g[0])}</th><td>${esc(g[1])}</td><td>${esc(g[2])}</td></tr>`).join('')}</tbody></table></details>` : '';
    if (!rest && !extra && !gloss) return '';
    return `<section class="l2sec qa-sec qa-rest" id="sec-qa-rest"><div class="l2head"><span class="l2num">+</span><h4>${qa.expert ? '함께 열린 답과 용어표' : '더 볼 수 있는 질문'}</h4></div>${rest}${extra}${gloss}</section>`;
  }
  function crossHTML(cross) {
    if (!cross || !cross.length) return '';
    return `<section class="l2sec cross-sec" id="sec-cross"><div class="l2head"><span class="l2num">→</span><h4>같은 명식, 다른 캐릭터는 이렇게 봐요</h4></div><p class="l2concl">입력은 그대로 두고 캐릭터만 바꾸면 돼요.</p><div class="cross-list">${cross.map(c => `<button type="button" class="cross-card" data-vn="${c.id}" style="--pc:${esc(c.accent || '')}"><span class="cross-face">${c.face || ''}</span><span class="cross-body"><b>${esc(c.name)}</b><small>${esc(c.role)}</small><p>${esc(c.text)}</p></span><span class="cross-go">보러 가기</span></button>`).join('')}</div></section>`;
  }
  /** 결제 후 전체 */
  function fullHTML(rep, opts) {
    opts = opts || {}; const face = opts.personaFace || '';
    const l2 = `<div class="l2">${rep.L2.map((s, i) => sectionHTML(s, i, rep, face)).join('')}${endHTML(rep, opts.planKey || 'plan')}</div>`;
    return `<div class="l1">${identityHTML(rep, false)}<h3 class="l1-title">${esc(rep.L1.avoidTitle)}</h3>${trioHTML(rep, false, true)}<div class="l1-sub">${esc(calendarPeriod(rep))} 미니맵</div>${calendarHTML(rep, false)}<div class="l1-entries">${opts.qa ? '<a class="chip accent" data-go="sec-qa">내가 고른 질문</a>' : ''}${rep.L1.entries.map(e => `<a class="chip" data-go="sec-${e.id}">${esc(e.label)}</a>`).join('')}<a class="chip" data-go="l3-top">왜 그런가요?</a></div></div>${qaHTML(opts.qa)}${opts.qa ? `<details class="l2wrap" id="l2wrap" open><summary>전체 흐름 ${rep.L2.length}장 <small>결론 → 쉬운 설명 → 대신 이렇게 → 4주 실행표</small></summary>${l2}</details>` : l2}${qaRestHTML(opts.qa)}${crossHTML(opts.cross)}<div id="l3-top"></div>${l3HTML(rep)}`;
  }
  /** 이벤트: 달력 탭 지침, 진입점 스크롤, 왜? 링크 → L3 펼침, 4주 체크 저장 */
  function bind(rootEl, rep) {
    const tipFor = (cellBtn) => { const i = +cellBtn.dataset.cal; const c = rep.L1.calendar[i]; const sec = rep.L2.find(s => s.viz && s.viz.type === 'calendar'); const tip = sec && sec.viz.cells[i] ? sec.viz.cells[i].tip : ''; const box = cellBtn.closest('.l1, .l2sec, .teaser-l1'); const t = box && box.querySelector('.cal-tip'); if (t) { t.hidden = false; t.textContent = `${calendarLabel(c, rep)}(${c.range}) · ${GRADE_KO[c.grade]} — ${tip}`; } box && box.querySelectorAll('.cell.sel').forEach(x => x.classList.remove('sel')); cellBtn.classList.add('sel'); };
    rootEl.querySelectorAll('.cal12 .cell:not([disabled])').forEach(b => b.addEventListener('click', () => tipFor(b)));
    rootEl.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', () => { const t = rootEl.querySelector('#' + a.dataset.go); if (!t) return; const d = t.closest('details'); if (d) d.open = true; requestAnimationFrame(() => t.scrollIntoView({ behavior: 'smooth', block: 'start' })); }));
    rootEl.querySelectorAll('[data-l3]').forEach(a => a.addEventListener('click', () => { const d = rootEl.querySelector('#' + a.dataset.l3); if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }));
    rootEl.querySelectorAll('input[data-todo]').forEach(cb => { const key = 'saju-note-' + cb.dataset.key; const box = cb.closest('.todo'); const ta = box.querySelector('textarea'); const meta = box.querySelector('[data-todo-meta]'); let saved = {}; try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { saved = {}; } cb.checked = !!saved.done; ta.value = saved.note || ''; const show = () => { meta.textContent = saved.at ? `저장됨 · ${new Date(saved.at).toLocaleDateString('ko-KR')} · 홈 보관함의 이 리포트에 표시돼요` : '체크하거나 한 줄 적으면 이 기기에 저장돼요'; cb.closest('.pitem').classList.toggle('done', cb.checked); }; const save = () => { saved = { done: cb.checked, note: ta.value.trim(), at: Date.now() }; try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) { /* ignore */ } show(); }; cb.addEventListener('change', save); ta.addEventListener('input', () => { clearTimeout(ta._t); ta._t = setTimeout(save, 400); }); show(); });
    rootEl.querySelectorAll('input[data-plan]').forEach(cb => { const key = 'saju-plan-' + cb.dataset.key; let saved = {}; try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { /* ignore */ } cb.checked = !!saved[cb.dataset.plan]; cb.addEventListener('change', () => { saved[cb.dataset.plan] = cb.checked; try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) { /* ignore */ } cb.closest('.pitem').classList.toggle('done', cb.checked); }); cb.closest('.pitem').classList.toggle('done', cb.checked); });
  }
  root.SajuReportUI = { teaserHTML, fullHTML, qaHTML, crossHTML, identityHTML, calendarHTML, trioHTML, pairHTML, compatVizHTML, bind };
})(typeof self !== 'undefined' ? self : this);
