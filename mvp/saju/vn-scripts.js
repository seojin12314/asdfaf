/*
 * vn-scripts.js — 미연시 연출용 캐릭터 대본.
 * 캐릭터마다: 등장 연출(entrance)·입자(particles)·도입 대사(intro)·고민 선택지(concern)·정보 요청 대사(ask)·
 * 소환 대사(summon)·분석 비트(beats: 대사 + 표정 + 효과 + 떠 있는 비주얼)·맺음(ending).
 * 풀이의 "초점"은 캐릭터별로 고정한다: 홍염=연애·궁합, 도사=재물, 할머니=한 해 흐름, 동자=아이 기질, 헤드헌터=이직, 정경진=전체.
 * 운영 전환 시 beats()의 문장 자리에 LLM 생성을 넣고, 비주얼·표정·효과 지시는 그대로 유지한다.
 */
(function (root) {
  'use strict';
  const S = root.Saju, P = root.SajuPersonas, R = root.SajuReport;
  const GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const OVER = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const KO = S.ELEM_KO;
  const SG = r => (r.input.gender === 'M' ? '재성' : '관성'); // 배우자성
  const CG = r => (r.input.gender === 'M' ? '관성' : '식상'); // 자녀성

  // ───── 공통 사실 추출 ─────
  function spouseInfo(r) {
    const sg = SG(r); const list = r.tenGods.filter(t => t.group === sg);
    const db = r.tenGods.find(t => t.at === '일주 지지');
    return { sg, count: list.length, list, where: list.map(t => t.at).join(' · '), glyph: list[0] ? list[0].char : r.day.branch, dayGod: db ? db.name : '일지', dayGroup: db ? db.group : null };
  }
  function monthsInfo(r, persona) {
    const nextY = r.seun[1].year; const months = R.monthTable(r, nextY);
    const focus = months.filter(m => persona.special.focus(r, m)); const caution = months.filter(m => m.grade === '주의'); const push = months.filter(m => m.grade === '추진');
    const names = ms => (ms.length ? ms.map(m => m.pillar.branchKo + '월').join('·') : '없음');
    return { nextY, months, focus, caution, push, names };
  }
  function monthsVisual(mo, title, focusList) {
    return { type: 'months', title, months: mo.months, focus: new Set((focusList || mo.focus).map(m => m.idx)), caution: new Set(mo.caution.map(m => m.idx)) };
  }
  function compat(me, pr) {
    const out = []; let score = 0;
    const hap = R.STEM_HAP[me.day.stem] === pr.day.stem, clash = R.CLASH[me.day.branch] === pr.day.branch, sameB = me.day.branch === pr.day.branch;
    const myE = me.dayMaster.element, prE = pr.dayMaster.element;
    if (hap) { score += 2; out.push({ t: `둘의 일간이 ${me.day.stem}·${pr.day.stem}, 천간합이야. 처음부터 끌렸을 거야. 끌림은 확실해. 그게 오래가는 건 다른 문제지만.`, face: 'smile', fx: 'glow' }); }
    else if (myE === prE) { score += 1; out.push({ t: `둘 다 ${KO[myE]} 일간. 거울 같은 사이야. 편한데, 서로의 단점도 똑같이 가지고 있어.`, face: 'neutral' }); }
    else if (GEN[myE] === prE) { score += 1; out.push({ t: `네가 ${KO[myE]}, 그 사람이 ${KO[prE]}. 네가 그 사람을 생해. 주는 쪽이 늘 너였지? 지치는 이유가 여기 있어.`, face: 'serious' }); }
    else if (GEN[prE] === myE) { score += 2; out.push({ t: `그 사람이 ${KO[prE]}, 네가 ${KO[myE]}. 그 사람이 널 생하는 쪽이야. 받는 데 익숙하지 않은 네가 자꾸 밀어낸 건 아니고?`, face: 'smile' }); }
    else if (OVER[myE] === prE) { out.push({ t: `네가 ${KO[myE]}, 그 사람이 ${KO[prE]}. 네가 그 사람을 극하는 모양. 네가 주도권을 쥐고, 그 사람은 맞춰 왔을 거야.`, face: 'neutral' }); }
    else { score -= 1; out.push({ t: `그 사람이 ${KO[prE]}, 네가 ${KO[myE]}. 그 사람이 널 극하는 모양이야. 네가 작아지는 느낌을 받았다면, 기분 탓이 아니야.`, face: 'serious', fx: 'dim' }); }
    if (clash) { score -= 2; out.push({ t: `그리고 일지가 ${me.day.branch}·${pr.day.branch}, 충이야. 옆자리끼리 부딪혀. 큰일이 아니라 사소한 데서 싸우는 조합. 같이 살면 더 그래.`, face: 'serious', fx: 'shake' }); }
    else if (sameB) { score += 1; out.push({ t: `일지가 둘 다 ${me.day.branch}. 같은 결의 사람이야. 말 안 해도 통하는데, 그래서 설렘이 빨리 식어.`, face: 'neutral' }); }
    const myWeak = me.sortedElems[4], prTop = pr.sortedElems[0];
    if (prTop === myWeak) { score += 2; out.push({ t: `그 사람한테 제일 많은 기운이 ${KO[prTop]}인데, 그게 네가 제일 비어 있는 자리야. 네가 못 하는 걸 그 사람이 해. 이건 보완이야.`, face: 'smile', fx: 'glow' }); }
    else if (me.sortedElems[0] === prTop) { score -= 1; out.push({ t: `둘 다 ${KO[prTop]}이 넘쳐. 같은 데서 세고 같은 데서 비어. 좋을 땐 최고, 나쁠 땐 같이 무너지는 조합.`, face: 'serious' }); }
    const verdict = score >= 3 ? '맞붙여 보니 모양이 좋아. 꼬인 건 궁합이 아니라 타이밍이었어.' : score >= 1 ? '나쁘지 않아. 다만 둘 중 하나는 먼저 숙여야 돌아가는 모양이야.' : '솔직히 말할게. 쉬운 조합은 아니야. 그래도 모양을 알면 피할 수 있어.';
    out.push({ t: verdict, face: score >= 1 ? 'smile' : 'serious' });
    return { lines: out, score, visual: { type: 'pair', title: '두 일주를 맞붙이면', a: { big: me.day.stem + me.day.branch, label: '나' }, b: { big: pr.day.stem + pr.day.branch, label: '그 사람' }, sub: [hap ? '천간합' : '', clash ? '일지충' : '', sameB ? '같은 일지' : '', prTop === myWeak ? '오행 보완' : ''].filter(Boolean).join(' · ') || '특별한 합·충 없음' } };
  }
  const glyph = (big, title, sub, sm) => ({ type: 'glyph', big, title, sub, sm });
  // ───── 궁합(두 명식 맞대기) 대사: 엔진(compat.js)의 사실을 캐릭터 말투로 ─────
  const VOICE = {
    flame: {
      stem: { hap: '둘의 일간부터 천간합이야. 처음부터 끌렸을 거야. 끌림은 확실해.', clash: '일간끼리 정면으로 부딪혀. 좋아하는데도 말이 자꾸 세게 나가는 조합이야.', same: '둘 다 같은 기운. 거울 같은 사이야. 편한데 단점도 똑같아.', aGen: '네가 그 사람을 키워 주는 쪽이야. 주는 쪽이 늘 너였지?', bGen: '그 사람이 널 키워 주는 쪽이야. 받는 데 익숙하지 않은 네가 밀어낸 건 아니고?', aOver: '네가 그 사람을 누르는 모양. 주도권은 너한테 있어.', bOver: '그 사람이 널 누르는 모양이야. 네가 작아지는 느낌, 기분 탓 아니야.' },
      branch: { hap: '{posA}랑 {posB} 글자가 끌림으로 묶여 있어. 붙는 건 금방이야.', tri: '{posA}랑 {posB}가 같은 편으로 모여. 뜻이 잘 맞아.', clash: '{posA}랑 {posB} 글자가 부딪혀. 큰일이 아니라 사소한 데서 싸우는 자리야.', hyeong: '{posA}랑 {posB}에 마찰이 있어. 서로 깎아 가며 맞추는 사이.', hae: '{posA}랑 {posB}가 어긋나. 말 안 한 게 오해로 쌓이는 자리야.', none: '여덟 글자 사이에 큰 끌림도 부딪힘도 없어. 잔잔해. 불은 네가 붙여야 해.' },
      supply: { both: '서로 비어 있는 기운을 채워 줘. 이건 보완이야. 흔치 않아.', aOnly: '그 사람이 네 빈자리를 채워 줘. 네가 못 하는 걸 그 사람이 해.', bOnly: '네가 그 사람의 빈자리를 채워 주는 쪽이야. 고마운 줄 아는지는 봐야지.', none: '둘 다 같은 데가 비어 있어. 서로 못 채워 주니까 밖에서 채워야 해.' },
      balance: { strongStrong: '둘 다 힘이 세. 주도권 싸움이 나는 조합이야.', weakWeak: '둘 다 짐이 많은 편. 서로 기대다 같이 지쳐.', comp: '한쪽이 세고 한쪽이 받쳐 줘. 균형은 좋아.', mid: '한쪽이 중간이라 흐름 따라 맞춰져. 나쁘지 않아.' },
      role: { mutual: '서로가 서로의 짝 기운이야. 인연 모양이 분명해.', aSees: '그 사람은 네 짝 기운이야. 네 마음이 먼저 움직이는 쪽.', bSees: '넌 그 사람의 짝 기운이야. 그 사람이 먼저 다가와.', none: '짝 기운으로 묶인 사이는 아니야. 친구처럼 시작하는 인연이지.' },
      months: '{nextY}년 둘 다 좋은 달은 {good}. {shaky} 고백도 결정도 좋은 달에 해.', shakyOn: '흔들리는 달은 {shaky}.', shakyOff: '흔들리는 달은 없어.',
      verdict: { 4: '맞붙여 보니 모양이 좋아. 꼬인 건 궁합이 아니라 타이밍이었어.', 3: '나쁘지 않아. 둘 중 하나가 먼저 숙이면 돌아가는 모양이야.', 2: '규칙이 필요한 사이야. 규칙만 있으면 괜찮아.', 1: '솔직히 말할게. 쉬운 조합은 아니야. 그래도 모양을 알면 피할 수 있어.' },
    },
    sage: {
      stem: { hap: '둘의 일간이 천간합이로구나. 처음부터 손이 맞는 사이다.', clash: '일간끼리 정면으로 부딪친다. 뜻은 같아도 말이 먼저 깨지는 조합이다.', same: '둘 다 같은 기운이라 거울 같다. 편하되 같은 구멍이 있다.', aGen: '네가 상대를 키우는 쪽이다. 주는 쪽이 늘 너였을 게다.', bGen: '상대가 너를 키우는 쪽이다. 받을 복이 있구나.', aOver: '네가 상대를 누르는 모양. 판은 네가 쥔다.', bOver: '상대가 너를 누르는 모양이다. 네 몫이 작아지기 쉬우니 먼저 정해 두거라.' },
      branch: { hap: '{posA}와 {posB} 글자가 끌림으로 묶였다. 손발이 빨리 맞는다.', tri: '{posA}와 {posB}가 같은 편으로 모인다. 뜻이 맞는 자리다.', clash: '{posA}와 {posB} 글자가 부딪친다. 큰일보다 잔돈에서 싸우는 자리니라.', hyeong: '{posA}와 {posB}에 마찰이 있다. 서로 깎이며 맞춰 가는 사이다.', hae: '{posA}와 {posB}가 어긋난다. 말하지 않은 것이 오해로 쌓인다.', none: '여덟 글자 사이에 큰 합도 충도 없다. 잔잔하니 규칙으로 엮어라.' },
      supply: { both: '서로의 빈 기운을 채워 준다. 보기 드문 보완이다.', aOnly: '상대가 네 빈자리를 채워 준다. 네가 못 하는 것을 상대가 한다.', bOnly: '네가 상대의 빈자리를 채우는 쪽이다. 그 값을 몫에 넣어라.', none: '둘 다 같은 데가 비었다. 셋째 사람이 필요한 모양이다.' },
      balance: { strongStrong: '둘 다 힘이 세다. 대표가 둘이면 배가 산으로 간다.', weakWeak: '둘 다 짐이 많은 편이라 결정이 늦어진다.', comp: '한쪽이 세고 한쪽이 받친다. 역할만 정하면 좋은 균형이다.', mid: '한쪽이 중간이라 흐름 따라 맞춰진다.' },
      role: { 비겁: '동등한 공동대표 구도다. 몫을 문서로 나누지 않으면 반드시 흔들린다.', 식상: '네가 만들고 상대가 배우며 받는 구도다. 기여를 기록해 두어라.', 인성: '상대가 너를 받쳐 주는 후원자 구도다. 네가 결과를 내야 오래간다.', 재성: '네가 판을 쥐고 상대가 실행한다. 상대의 몫을 먼저 정하거라.', 관성: '상대가 기준을 쥐고 네가 실행한다. 네 재량을 미리 정해 두어라.' },
      roleFriend: { 비겁: '같은 눈높이의 벗이다. 경쟁이 붙거든 돈 거래만 피하거라.', 식상: '네가 베풀고 상대가 받는 벗이다. 한쪽만 주면 서운함이 쌓인다.', 인성: '상대가 챙기고 네가 받는 벗이다. 돌려주는 날을 정해 두거라.', 재성: '네가 이끌고 상대가 따른다. 부탁이 한쪽으로 몰린다.', 관성: '상대가 이끌고 네가 따른다. 싫은 건 싫다 해야 오래간다.' },
      months: '{nextY}년 둘 다 좋은 달은 {good}. {shaky} 서명과 송금은 좋은 달에 하거라.', shakyOn: '흔들리는 달은 {shaky}.', shakyOff: '흔들리는 달은 없다.',
      verdict: { 4: '맞대어 보니 역할이 맞물린다. 문서 한 장이면 오래간다.', 3: '문서만 있으면 굴러가는 사이다.', 2: '권한부터 나누어야 하는 사이다. 그 뒤에 돈을 섞어라.', 1: '솔직히 말하마. 돈을 섞기엔 조심스러운 사이다. 벗으로는 괜찮다.' },
    },
  };
  const POSV = { 년주: '집안 자리', 월주: '일터 자리', 일주: '가장 가까운 자리', 시주: '말년 자리' };
  function compatBeats(voiceId, cp) {
    const V = VOICE[voiceId] || VOICE.sage; const b = []; const band = cp.score >= 75 ? 4 : cp.score >= 55 ? 3 : cp.score >= 40 ? 2 : 1;
    const tone = key => (cp.facts.find(f => f.key === key) || {}).tone;
    const face = t => t === 'good' ? 'smile' : t === 'bad' ? 'serious' : 'neutral';
    b.push({ t: V.stem[cp.stem], face: face(tone('stem')), fx: cp.stem === 'hap' ? 'glow' : cp.stem === 'clash' ? 'shake' : null });
    const br = cp.main ? V.branch[cp.main.rel].replace('{posA}', POSV[cp.main.pa]).replace('{posB}', POSV[cp.main.pb]) : V.branch.none;
    b.push({ t: br, face: face(tone('branch')), fx: cp.main && cp.main.rel === 'clash' ? 'shake' : null });
    b.push({ t: V.supply[cp.supply], face: face(tone('supply')), fx: cp.supply === 'both' ? 'glow' : cp.supply === 'none' ? 'dim' : null });
    b.push({ t: V.balance[cp.balance], face: face(tone('balance')) });
    const roleT = cp.kind === 'love' ? V.role[cp.role] : cp.kind === 'friend' && V.roleFriend ? V.roleFriend[cp.tgAB] : V.role[cp.tgAB];
    if (roleT) b.push({ t: roleT, face: face(tone('role')) });
    const shaky = cp.shaky.length ? V.shakyOn.replace('{shaky}', cp.shaky.slice(0, 2).map(x => x.label).join('·')) : V.shakyOff;
    b.push({ t: V.months.replace('{nextY}', cp.nextY).replace('{good}', cp.good.slice(0, 2).join('·') || '뚜렷하지 않아').replace('{shaky}', shaky), face: 'neutral', visual: { type: 'pair', title: `${cp.kindKo} · ${cp.score}점 ${cp.label}`, a: { big: cp.A === '나' ? cp.section.viz.a.hanja : cp.section.viz.a.hanja, label: cp.A }, b: { big: cp.section.viz.b.hanja, label: cp.B }, sub: (cp.tags.join(' · ') || '특별한 합·충 없음') } });
    b.push({ t: V.verdict[band], face: band >= 3 ? 'smile' : 'serious', fx: band >= 3 ? 'glow' : 'dim' });
    return b;
  }


  // ───── 캐릭터 대본 ─────
  const SCRIPTS = {
    // ─────────────────────────── 홍염의 여신 · 연애·재회·궁합 ───────────────────────────
    flame: {
      entrance: 'flame', particles: 'ember',
      intro: [
        { t: '…왔네. 불씨가 흔들리는 걸 보니, 마음에 걸린 사람이 있구나.', face: 'smile', fx: 'flash' },
        { t: '난 윤슬. 인연의 실이 어디서 꼬였는지, 어디서 끊어야 하는지만 봐. 돈? 일? 그런 건 다른 애들한테 가.', face: 'neutral' },
        { t: '돌려 말하지 않을 거야. 듣기 싫은 말도 할 거고. 그래도 괜찮아?', face: 'serious', sprite: 'bump' },
      ],
      concern: {
        prompt: '그래서, 뭘 보러 왔어?',
        options: [
          { value: 'match', label: '그 사람과 궁합이 맞을까', reply: [{ t: '궁합이구나. 둘의 여덟 글자를 전부 맞붙여야 해. 끌림, 부딪힘, 서로 채워 주는지, 누가 주도하는지까지.', face: 'smile', fx: 'glow' }] },
          { value: 'reunion', label: '그 사람이랑 다시 될까', reply: [{ t: '재회라… 실은 네가 제일 먼저 답을 알고 있어. 그래도 명식은 거짓말을 안 하니까, 같이 보자.', face: 'serious' }] },
          { value: 'new', label: '새 인연은 언제 와', reply: [{ t: '좋아. 기다리는 사람한테 인연이 오는 달은 정해져 있어. 네 명식에서 그 달을 찾아 줄게.', face: 'smile', fx: 'glow' }] },
          { value: 'pattern', label: '왜 매번 같은 데서 꼬일까', reply: [{ t: '그 질문을 하는 사람은 이미 반은 왔어. 패턴은 운이 아니라 모양이야. 모양은 명식에 있어.', face: 'neutral' }] },
        ],
      },
      partnerFor: ['reunion', 'match'], compatKind: 'love',
      ask: {
        lead: [{ t: '그럼 네 걸 보여 줘. 태어난 날과 시각. 그게 네 인연의 지도야.', face: 'neutral' }],
        name: '먼저, 널 뭐라고 부를까?', gender: '성별은? 배우자성이 어느 글자인지가 여기서 갈려.', date: '태어난 날. 양력으로.', time: '태어난 시각은? 모르면 모른다고 해. 시주 없이도 볼 수 있어.',
        reuse: { prompt: '아까 펼친 명식이 있네. 그대로 볼까, 다시 받을까?', keep: '그대로 봐 줘', fresh: '다시 입력할게' },
        partner: { prompt: '그 사람 생년월일, 알아? 둘을 맞붙여야 궁합이 보여.', yes: '알아', no: '몰라', who: '그 사람', name: '그 사람을 뭐라고 부를까? 안 적어도 돼.', gender: '그 사람 성별은?', date: '그 사람이 태어난 날. 시간은 몰라도 돼.', got: '…받았어. 두 명식을 겹쳐 볼게.', skip: '괜찮아. 네 명식만으로도 그 사람이 어떤 자리에 있는지는 보여.' },
        done: [{ t: '{name}. 받았어. 눈 감지 마. 지금부터 네 명식이 타오를 거야.', face: 'smile', fx: 'burst' }],
      },
      summon: [{ t: '년, 월, 일, 시… 네 글자가 불 속에서 떠오른다.' }],
      beats(c) {
        const r = c.r, p = c.p, sp = spouseInfo(r), mo = monthsInfo(r, p), top = r.sortedElems[0];
        const temp = { 火: '뜨겁게 시작하고 금방 식는다는 말, 들어 봤지? 그게 너야. 식은 게 아니라 다른 데를 비추고 있을 뿐인데, 상대는 몰라.', 水: '먼저 식어서 먼저 떠나는 쪽은 늘 너였을 거야. 상대 기분을 물처럼 읽다가 네가 먼저 지치거든.', 木: '한 번 뿌리내리면 못 빠져나오는 사랑이야. 끝난 자리를 오래 붙드는 것도 그래서고.', 土: '묵묵히 지키다 서운함을 쌓는 사랑. 상대는 네가 괜찮은 줄 알아. 괜찮지 않은데.', 金: '기준이 분명해서 아무나 못 들어오는 사랑. 들어오면 끝까지 가는데, 실망하면 문이 닫혀.' };
        const seat = { 비겁: '옆자리에 나와 같은 기운. 친구 같은 연인, 아니면 경쟁자 같은 연인을 끌어들이는 모양이야.', 식상: '옆자리가 표현의 기운. 사랑을 말로 주고받아야 사는 사람. 과묵한 상대랑은 굶어.', 재성: '옆자리가 현실의 기운. 같이 살 수 있는 사람인지를 먼저 보는 눈이 있어.', 관성: '옆자리가 책임의 기운. 가볍게 못 만나고, 만나면 끝까지 가려 해. 그래서 가벼운 사람들 사이에서 네가 무거워 보여.', 인성: '옆자리가 품는 기운. 상대를 돌보다가 네가 먼저 지치는 자리야.' };
        const spouseLine = sp.count === 0 ? `배우자성 ${sp.sg}이 원국에 없어. 인연이 없다는 게 아니라, 네가 직접 찾아 나서야 보이는 모양이야. 기다리면 안 와.` : sp.count === 1 ? `배우자성 ${sp.list[0].name}이 ${sp.where}에 하나. 깔끔해. 한 사람에게 오래 머무는 모양이야.` : `배우자성이 ${sp.count}개. ${sp.where}. 선택지가 많은 게 아니라, 마음이 자주 흔들리는 모양이야. 그래서 매번 다른 사람인데 매번 같은 결말이지.`;
        const b = [
          { t: P.fill(p.open[r.dayMaster.element], c), face: 'neutral', visual: { type: 'pillars' } },
          { t: spouseLine, face: sp.count === 0 ? 'serious' : 'smile', fx: sp.count === 0 ? 'dim' : 'glow', visual: glyph(sp.glyph, `배우자성 ${sp.sg} · ${sp.count}개`, sp.count ? sp.where : '원국에 없음') },
          { t: `그리고 네 일지. 네 옆자리에 앉은 글자는 ${r.day.branch}, ${sp.dayGod}이야. ${seat[sp.dayGroup] || ''}`, face: 'neutral', visual: glyph(r.day.branch, `일지 · ${sp.dayGod}`, '내 옆자리에 누가 앉는지') },
          { t: `오행은 네 사랑의 온도야. ${top}(${KO[top]})이 제일 많아. ${temp[top]}`, face: top === '火' || top === '木' ? 'smile' : 'serious', visual: { type: 'radar' } },
          { t: P.fill(p.strong[r.strongestGroup], c), face: 'neutral', visual: { type: 'stats' } },
          { t: P.fill(p.weak[r.weakestGroup], c), face: 'serious', fx: 'dim', sprite: 'nod' },
        ];
        if (c.pr && root.SajuCompat) { const cp = root.SajuCompat.analyze(r, c.pr, { kind: 'love', nameA: c.name, nameB: c.prName || '그 사람' }); b.push({ t: '이제 그 사람. 둘의 여덟 글자를 전부 맞붙여 볼게.', face: 'neutral', fx: 'flash', visual: { type: 'pair', title: '두 일주를 맞붙이면', a: { big: r.day.hanja, label: c.name }, b: { big: c.pr.day.hanja, label: cp.B }, sub: cp.tags.join(' · ') || '특별한 합·충 없음' } }); compatBeats('flame', cp).forEach(l => b.push(l)); }
        b.push({ t: `${mo.nextY}년, 인연이 움직이는 달은 ${mo.names(mo.focus)}. ${c.concern === 'new' ? '이 달에 만난 사람은 가볍게 보지 마.' : c.concern === 'reunion' ? '그 사람이 움직인다면 이 달이야. 네가 먼저 연락하는 건 그다음 얘기고.' : '패턴을 끊고 싶으면 이 달에 시작하는 관계부터 다르게 해 봐.'}`, face: 'smile', visual: monthsVisual(mo, `${mo.nextY}년 · 배우자성이 들어오는 달`) });
        if (mo.caution.length) b.push({ t: `반대로 ${mo.names(mo.caution)}엔 고백도 결정도 하지 마. 충이 들어오는 달이야. 그 달에 끝난 관계는 네 탓이 아니었어.`, face: 'serious', fx: 'shake' });
        b.push({ t: '여기까지가 무료야. 네 연애가 꼬이는 자리는 운이 아니라 모양이야. 그리고 모양은, 바꿀 수 있어.', face: 'smile', fx: 'glow', visual: null });
        return b;
      },
      ending: { lines: [{ t: '시트에 전부 적어 뒀어. 더 깊이 보고 싶으면 심층으로 와. 배우자성이 앉은 자리랑 네 일지를 맞붙여서, 그 사람이 돌아올 달까지 짚어 줄 테니까.', face: 'smile' }], prompt: '어떻게 할래?', sheet: '내 캐릭터 시트 펼쳐 봐', again: '다른 캐릭터한테도 보일래' },
    },

    // ─────────────────────────── 도사님 · 돈·사업·직업 ───────────────────────────
    sage: {
      entrance: 'sage', particles: 'coin',
      intro: [
        { t: '허허… 안개 걷히는 소리에 눈을 떴더니, 손님이 와 있구나.', face: 'smile' },
        { t: '백운이라 하네. 사람들은 도사라 부르지. 산에서 엽전 소리만 듣고 산 지 오래라, 돈이 들어오는 길과 새는 구멍은 눈 감고도 본다.', face: 'neutral' },
        { t: '연애나 아이 얘기는 아랫마을 아이들에게 가거라. 여기서는 재물 얘기만 한다. 그래도 좋으냐?', face: 'serious', sprite: 'nod' },
      ],
      concern: {
        prompt: '무엇이 궁금해서 산을 올랐느냐?',
        options: [
          { value: 'business', label: '사업을 해도 될까요', reply: [{ t: '사업이라… 벌 재주와 지킬 재주는 다른 것이니라. 네 명에 둘 중 무엇이 있는지부터 보자.', face: 'neutral' }] },
          { value: 'invest', label: '투자가 자꾸 어긋나요', reply: [{ t: '허허, 남 따라 들어간 자리에서 다친 게로구나. 네 돈이 어디서 움직이고 어디서 멈추는지 명이 말해 줄 것이다.', face: 'serious' }] },
          { value: 'save', label: '버는데 왜 안 모일까요', reply: [{ t: '그것이 가장 흔한 병이다. 들어오는 문은 있는데 나가는 구멍이 더 크지. 구멍은 늘 같은 자리에 있느니라.', face: 'smile' }] },
          { value: 'pair', label: '동업·지인 궁합을 보고 싶어요', reply: [{ t: '허허, 돈을 섞기 전에 명식부터 맞대 보겠다니 영리하구나. 둘의 여덟 글자를 전부 맞대어 끌림과 부딪힘, 누가 판을 쥐는지 보마.', face: 'smile', fx: 'glow' }] },
        ],
      },
      partnerFor: ['pair'], compatKind: 'biz',
      ask: {
        lead: [{ t: '그럼 네 명식을 펼쳐야겠다. 태어난 날과 시각을 말해 보거라.', face: 'neutral' }],
        name: '이름이 무엇이냐? 부르기 편한 대로.', gender: '남자냐, 여자냐? 대운이 어느 쪽으로 흐르는지가 여기서 갈린다.', date: '태어난 날은? 양력으로 말하거라.', time: '태어난 시각은 아느냐? 모르면 모른다 해도 된다. 시주 없이도 재물 그릇은 보인다.',
        reuse: { prompt: '허허, 이미 펼친 명식이 있구나. 그대로 볼까, 다시 받을까?', keep: '그대로 봐 주세요', fresh: '다시 입력할게요' },
        partner: { kinds: { prompt: '그 사람은 어떤 사이냐?', options: [{ label: '동업·사업 파트너', value: 'biz' }, { label: '친구·지인', value: 'friend' }] }, prompt: '상대의 생년월일을 아느냐? 둘을 맞대야 보이는 법이다.', yes: '알아요', no: '몰라요', who: '상대', name: '상대를 뭐라 부를까? 안 적어도 된다.', gender: '상대는 남자냐, 여자냐?', date: '상대가 태어난 날은? 시간은 몰라도 된다.', got: '받았다. 두 명식을 맞대어 보마.', skip: '그러면 네 명식만 보자. 상대 것은 알게 되거든 다시 오너라.' },
        done: [{ t: '{name}이라… 받았다. 엽전을 던져 보마. 네 글자가 떨어지는 자리를 보거라.', face: 'smile', fx: 'burst' }],
      },
      summon: [{ t: '쩔렁… 년주, 월주, 일주, 시주. 네 기둥이 안개 위로 선다.' }],
      beats(c) {
        const r = c.r, p = c.p, g = r.groups, mo = monthsInfo(r, p), top = r.sortedElems[0];
        const n재 = g['재성'], n식 = g['식상'], n관 = g['관성'];
        const hole = n식 === 0 ? '벌 재주(식상)가 비었다. 좋은 것을 들고도 팔지를 못하는 구멍이다.' : n재 === 0 ? '재성이 비었다. 돈 냄새를 못 맡으니 가격을 못 매기고 받을 돈을 못 받는 구멍이다.' : n관 === 0 ? '지킬 울타리(관성)가 비었다. 번 돈이 그대로 흘러나가는 구멍이다.' : '셋이 다 있구나. 그러면 구멍은 비율에 있다. 넘치는 쪽이 모자란 쪽을 삼키는 것이지.';
        const spend = { 木: '목이 많으니 벌이는 데 쓴다. 새 일, 새 가지. 정산이 늦다.', 火: '화가 많으니 사람과 경험에 쓴다. 보기엔 좋은데 재만 남기 쉽다.', 土: '토가 많으니 쌓는다. 묻어 두고 안 움직이니 손실도 수익도 작다.', 金: '금이 많으니 자르고 정리하며 번다. 모르는 데 손대면 크게 다친다.', 水: '수가 많으니 정보와 유통으로 번다. 모이자마자 흩어지는 게 흠이다.' };
        const cur = r.daeun && r.daeun.current;
        const b = [
          { t: P.fill(p.open[r.dayMaster.element], c), face: 'neutral', visual: { type: 'pillars' } },
          { t: `재물의 셈을 해 보자. 재성 ${n재}개, 벌 재주인 식상 ${n식}개, 지킬 울타리인 관성 ${n관}개. ${hole}`, face: (n재 && n식 && n관) ? 'smile' : 'serious', fx: (n재 && n식 && n관) ? 'glow' : 'dim', visual: glyph(n재 ? (r.tenGods.find(t => t.group === '재성') || {}).char : '財', `재성 ${n재} · 식상 ${n식} · 관성 ${n관}`, '벌 재주 · 돈 · 지킬 울타리') },
          { t: `오행의 치우침은 소비의 치우침이다. ${top}(${KO[top]})이 가장 많으니, ${spend[top]}`, face: 'neutral', visual: { type: 'radar' } },
          { t: P.fill(p.strong[r.strongestGroup], c), face: 'neutral', visual: { type: 'stats' } },
          { t: P.fill(p.weak[r.weakestGroup], c), face: 'serious', sprite: 'nod' },
        ];
        if (cur) b.push({ t: `지금 네 대운은 ${cur.stem}${cur.branch}, ${cur.tenGod.group} 운이다. ${P.luckByGroup[cur.tenGod.group]} 큰돈은 대운이 가져오는 법이니, 이 10년의 성격을 알고 움직여라.`, face: cur.tenGod.group === '재성' || cur.tenGod.group === '식상' ? 'smile' : 'neutral', fx: 'flash', visual: glyph(cur.stem + cur.branch, `현재 대운 · ${cur.tenGod.group}`, `${cur.fromAge}~${cur.toAge}세`) });
        b.push({ t: `${mo.nextY}년에 재성이 들어오는 달은 ${mo.names(mo.focus)}. ${c.concern === 'business' ? '시작과 계약은 이 달에 밀어라.' : c.concern === 'invest' ? '들어갈 거면 이 달에 들어가고, 모르는 것엔 그래도 손대지 마라.' : '수입을 늘릴 궁리는 이 달에 하거라.'}`, face: 'smile', visual: monthsVisual(mo, `${mo.nextY}년 · 재성이 들어오는 달`) });
        if (mo.caution.length) b.push({ t: `${mo.names(mo.caution)}은 충이 드는 달이다. 큰 지출, 보증, 동업 서명은 피하고, 피할 수 없으면 계약서를 두 번 읽어라.`, face: 'serious', fx: 'shake' });
        if (c.pr && root.SajuCompat) { const cp = root.SajuCompat.analyze(r, c.pr, { kind: c.kind === 'friend' ? 'friend' : 'biz', nameA: c.name, nameB: c.prName || '상대' }); b.push({ t: `이제 ${cp.B}. 두 명식을 맞대어 보자.`, face: 'neutral', fx: 'flash', visual: { type: 'pair', title: `${cp.kindKo}`, a: { big: r.day.hanja, label: c.name }, b: { big: c.pr.day.hanja, label: cp.B }, sub: cp.tags.join(' · ') || '특별한 합·충 없음' } }); compatBeats('sage', cp).forEach(l => b.push(l)); }
        b.push({ t: '허허, 여기까지가 무료다. 새는 구멍은 보통 하나다. 그 하나를 막으면 나머지는 저절로 고이느니라.', face: 'smile', fx: 'glow', visual: null });
        return b;
      },
      ending: { lines: [{ t: '시트에 적어 두었다. 심층에서는 네 대운이 재성을 만나는 해와, 돈이 새는 자리 세 곳을 짚어 주마. 동업자나 투자처의 명식이 있으면 그것도 가져오너라.', face: 'smile' }], prompt: '어찌하겠느냐?', sheet: '제 시트를 펼쳐 주세요', again: '다른 분께도 여쭤볼게요' },
    },

    // ─────────────────────────── 할머니 · 한 해·가족·인생 흐름 ───────────────────────────
    granny: {
      entrance: 'granny', particles: 'moon',
      intro: [
        { t: '아이고, 얘야. 문 열고 들어오느라 추웠지? 이리 와서 앉아.', face: 'smile' },
        { t: '할머니는 거창한 건 몰라. 그냥 올해 네가 왜 힘들었는지, 내년엔 어디를 조심하면 되는지, 그것만 봐.', face: 'neutral' },
        { t: '돈 벌 궁리, 연애 궁리는 젊은 애들한테 가고. 할머니한텐 네 한 해 얘기만 하자. 응?', face: 'smile', sprite: 'nod' },
      ],
      concern: {
        prompt: '그래, 뭐가 제일 마음에 걸려?',
        options: [
          { value: 'year', label: '올해 너무 힘들었어요', reply: [{ t: '그랬구나. 아이고… 네 탓 아니야. 계절이 그랬던 거야. 명식 보면 왜 그랬는지 다 나와.', face: 'serious' }] },
          { value: 'family', label: '가족 일이 마음에 걸려요', reply: [{ t: '식구 일이 제일 무겁지. 명식에는 식구 자리가 다 있어. 누가 네 편이고 누가 네 짐인지 할머니가 봐 줄게.', face: 'neutral' }] },
          { value: 'next', label: '내년이 걱정돼요', reply: [{ t: '걱정은 미리 하는 게 아니라 달력에 적어 두는 거야. 조심할 달 몇 개만 알면 돼. 겁먹지 마.', face: 'smile' }] },
        ],
      },
      ask: {
        lead: [{ t: '어디 손 좀 줘 봐라. 아니, 손 말고 생일. 태어난 날이랑 시간을 말해 줘.', face: 'smile' }],
        name: '우리 애기 이름이 뭐야? 할머니가 부를 이름.', gender: '남자아이야, 여자아이야? 대운이 어느 쪽으로 도는지 봐야 해서.', date: '태어난 날은? 양력으로.', time: '태어난 시간은 알아? 모르면 괜찮아. 할머니는 시간 몰라도 봐.',
        reuse: { prompt: '아까 본 명식이 있네. 그걸로 볼까, 다시 적을까?', keep: '그걸로 봐 주세요', fresh: '다시 적을게요' },
        done: [{ t: '{name}이, 그래. 다 받았다. 달이 밝으니 잘 보이겠구나.', face: 'smile', fx: 'glow' }],
      },
      summon: [{ t: '달빛 아래 네 기둥이 하나씩… 조상 자리, 부모 자리, 네 자리, 자식 자리.' }],
      beats(c) {
        const r = c.r, p = c.p, mo = monthsInfo(r, p), st = R.strengthJudge(r), now = r.seun[0], nx = r.seun[1], cur = r.daeun && r.daeun.current;
        const turning = cur && (r.daeun.ageYears >= cur.toAge - 1 || r.daeun.ageYears <= cur.fromAge + 1);
        const b = [
          { t: P.fill(p.open[r.dayMaster.element], c), face: 'smile', visual: { type: 'pillars' } },
          { t: `올해 ${now.year}년은 ${now.stem}${now.branch}, ${now.tenGod.group} 운이었어. ${P.luckByGroup[now.tenGod.group]} ${c.concern === 'year' ? '그래서 힘들었던 거야. 네가 못나서가 아니라.' : '그 해를 지나온 거야.'}`, face: now.tenGod.group === '관성' || now.tenGod.group === '비겁' ? 'serious' : 'neutral', visual: glyph(now.stem + now.branch, `올해 ${now.year}년 · ${now.tenGod.group}`, P.groupDesc[now.tenGod.group]) },
          { t: `내년 ${nx.year}년은 ${nx.stem}${nx.branch}, ${nx.tenGod.group} 운. ${P.luckByGroup[nx.tenGod.group]} 올해랑은 달라. 봐, 계절이 바뀌잖아.`, face: 'smile', fx: 'flash', visual: glyph(nx.stem + nx.branch, `내년 ${nx.year}년 · ${nx.tenGod.group}`, P.groupDesc[nx.tenGod.group]) },
        ];
        if (cur) b.push({ t: turning ? `그리고 얘야, 지금 네 대운이 바뀌는 길목이야. ${cur.stem}${cur.branch} 대운이 ${cur.fromAge}세부터 ${cur.toAge}세까지인데, 네가 그 끝자락에 있어. 길목에서는 큰일 벌이지 말고 짐 정리만 해.` : `지금 대운은 ${cur.stem}${cur.branch}, ${cur.fromAge}세부터 ${cur.toAge}세까지. 아직 한 계절 안에 있어. 급하게 바꾸려 하지 마.`, face: turning ? 'serious' : 'neutral', visual: glyph(cur.stem + cur.branch, `지금 대운 · ${cur.tenGod.group}`, `${cur.fromAge}~${cur.toAge}세${turning ? ' · 바뀌는 길목' : ''}`) });
        b.push({ t: `네 몸의 계절은 ${st.seasonText.split('.')[0]}. ${st.seasonText.split('.').slice(1).join('.').trim()}`, face: 'neutral', visual: { type: 'radar' } });
        b.push({ t: P.fill(p.strong[r.strongestGroup], c), face: 'neutral', visual: { type: 'stats' } });
        b.push({ t: P.fill(p.weak[r.weakestGroup], c), face: 'serious', sprite: 'nod' });
        b.push({ t: mo.caution.length ? `자, 달력 꺼내. ${mo.nextY}년에 조심할 달은 ${mo.names(mo.caution)}. 이 달엔 이사, 수술, 큰 계약, ${c.concern === 'family' ? '가족 행사' : '큰 결정'}은 피해. 피할 수 없으면 두 번 확인해.` : `${mo.nextY}년엔 충이 드는 달이 없어. 아이고, 다행이다. 그래도 들뜨진 마.`, face: 'serious', fx: mo.caution.length ? 'shake' : 'glow', visual: monthsVisual(mo, `${mo.nextY}년 · 조심할 달과 밀어붙일 달`, mo.push) });
        if (mo.push.length) b.push({ t: `반대로 ${mo.names(mo.push)}은 밀어붙여도 되는 달이야. 미루던 거 있으면 이때 해. 할머니가 허락할게.`, face: 'smile', fx: 'glow' });
        b.push({ t: '아이고, 여기까지가 무료야. 다 기억 안 해도 돼. 조심할 달 세 개만 달력에 적어 둬.', face: 'smile', visual: null });
        return b;
      },
      ending: { lines: [{ t: '시트에 다 적어 뒀어. 심층에서는 열두 달을 하나씩 짚어서, 어느 달에 뭘 하고 뭘 하지 말지 알려 줄게. 힘들 때 또 와. 할머니는 여기 있어.', face: 'smile' }], prompt: '어떻게 할래?', sheet: '제 시트 보여 주세요', again: '다른 분한테도 가 볼게요' },
    },

    // ─────────────────────────── 애기동자 · 자녀·기질 ───────────────────────────
    child: {
      entrance: 'child', particles: 'petal',
      intro: [
        { t: '어? 어! 누가 왔다! 연못에 꽃잎이 떨어지길래 봤더니, 손님이에요!', face: 'smile', fx: 'burst' },
        { t: '저는 초롱 동자예요! 어른 사주는 몰라요. 대신 아이는 다 보여요. 물 같은 아이, 불 같은 아이, 다요!', face: 'smile', sprite: 'bump' },
        { t: '아이는 고치는 게 아니라 읽는 거예요. 읽히는 아이는 편안해져요. 오늘은 아이 얘기만 해요, 네?', face: 'neutral' },
      ],
      concern: {
        prompt: '아이의 뭐가 궁금하세요?',
        options: [
          { value: 'temper', label: '아이 기질이 궁금해요', reply: [{ t: '좋아요! 타고난 기질은 일간이랑 오행에 다 있어요. 왜 그렇게 노는지, 왜 그렇게 우는지 보여요!', face: 'smile' }] },
          { value: 'discipline', label: '혼내도 말을 안 들어요', reply: [{ t: '아, 그건요. 혼내서 듣는 아이가 있고, 칭찬해야 듣는 아이가 있어요. 아이 명식이 어느 쪽인지 동자가 봐 드릴게요!', face: 'serious' }] },
          { value: 'next', label: '내년에 아이한테 뭐가 올까요', reply: [{ t: '내년 달력이요? 동자가 제일 잘하는 거예요! 새로운 거 시작하기 좋은 달, 바꾸면 안 되는 달이 있어요.', face: 'smile' }] },
        ],
      },
      ask: {
        lead: [{ t: '그럼 아이 생일을 알려 주세요! 아이가 태어난 날이랑 시간이요.', face: 'smile' }],
        name: '아이 이름이 뭐예요? 동자가 부를 이름이요!', gender: '남자아이예요, 여자아이예요?', date: '아이가 태어난 날은요? 양력으로요!', time: '태어난 시간은 아세요? 모르면 괜찮아요. 동자는 시간 몰라도 볼 수 있어요!',
        reuse: { prompt: '아까 본 명식이 있어요! 그걸로 볼까요, 새로 받을까요?', keep: '그걸로 봐 줘', fresh: '새로 입력할게' },
        done: [{ t: '{name}! 이름 예쁘다! 다 받았어요. 연꽃이 열릴 거예요, 잘 보세요!', face: 'smile', fx: 'burst' }],
      },
      summon: [{ t: '연꽃이 하나, 둘, 셋, 넷… 아이의 네 기둥이 물 위로 떠올라요!' }],
      beats(c) {
        const r = c.r, p = c.p, mo = monthsInfo(r, p), st = R.strengthJudge(r), top = r.sortedElems[0], sg = r.strongestGroup;
        const temp = { 火: '뜨거운 아이예요! 웃음도 울음도 커요. 감정에 이름을 붙여 주면 금방 꺼져요.', 水: '차분한 물 아이예요. 눈치가 빨라서 어른 기분을 먼저 읽어요. 그래서 속으로 걱정이 많아요.', 木: '쑥쑥 자라는 나무 아이예요! 하고 싶은 게 많아서 가만히 못 있어요. 막으면 휘어요.', 土: '든든한 땅 아이예요. 느린 게 아니라 깊은 거예요. 재촉하면 숨어요.', 金: '반짝이는 쇠 아이예요. 규칙을 좋아하고 불공평한 걸 제일 싫어해요!' };
        const style = sg === '관성' || sg === '인성' ? { t: `${sg}이 제일 커요. 이 아이는 규칙이 통하는 아이예요! 그런데 혼내는 거 말고요. 약속을 어른이 먼저 지키면 제일 말 잘 들어요.`, face: 'neutral' } : sg === '재성' ? { t: '재성이 제일 커요. 이 아이는 목표랑 보상이 통하는 아이예요! 용돈 교육, 스티커판, 다 잘 돼요. 대신 "그냥 하는 것"도 있다고 가르쳐 주세요.', face: 'smile' } : { t: `${sg}이 제일 커요. 이 아이는 칭찬이 통하는 아이예요! 혼내면 더 안 들어요. 잘한 거 하나 찾아서 먼저 말해 주세요.`, face: 'smile' };
        const power = st.label === '신강' ? '아이 힘이 세요! 센 아이는 부딪혀 봐야 배워요. 다 막아 주지 마세요.' : st.label === '신약' ? '아이 힘이 약한 편이에요. 약한 게 나쁜 게 아니에요. 안아 줘야 크는 아이예요.' : '아이 힘이 딱 중간이에요. 밀어도 되고 안아 줘도 돼요. 아이가 원하는 걸 보세요.';
        const b = [
          { t: P.fill(p.open[r.dayMaster.element], c), face: 'smile', visual: { type: 'pillars' } },
          { t: `오행은 아이 몸의 온도예요. ${top}(${KO[top]})이 제일 많아요. ${temp[top]}`, face: 'smile', visual: { type: 'radar' } },
          Object.assign({ visual: { type: 'stats' }, fx: 'glow' }, style),
          { t: P.fill(p.weak[r.weakestGroup], c), face: 'serious', sprite: 'nod' },
          { t: power, face: st.label === '신약' ? 'serious' : 'smile', visual: glyph(st.label, `아이 힘 · ${st.label}`, st.why[0]) },
        ];
        if (c.concern === 'discipline') b.push({ t: `그러니까요, ${c.name} 아이한테는 ${sg === '관성' || sg === '인성' ? '규칙은 세 개만, 대신 어른도 같이 지키는 거요' : sg === '재성' ? '혼내는 대신 작은 목표랑 보상이요' : '혼내기 전에 칭찬 하나 먼저요'}. 그게 이 아이한테 통하는 말이에요!`, face: 'smile', fx: 'flash' });
        b.push({ t: `${mo.nextY}년에 아이한테 새로운 걸 시작하기 좋은 달은 ${mo.names(mo.focus)}이에요! 학원, 새 친구, 새 습관은 이때요.`, face: 'smile', visual: monthsVisual(mo, `${mo.nextY}년 · 아이에게 새 기운이 오는 달`) });
        if (mo.caution.length) b.push({ t: `반대로 ${mo.names(mo.caution)}은 학교나 학원을 바꾸지 마세요. 아이가 흔들리는 달이에요. 대신 더 많이 안아 주세요.`, face: 'serious', fx: 'shake' });
        b.push({ t: '여기까지가 무료예요! 아이는 고치는 게 아니라 읽는 거예요. 오늘 읽은 거 하나만 기억해도 돼요!', face: 'smile', fx: 'burst', visual: null });
        return b;
      },
      ending: { lines: [{ t: '시트에 다 적어 뒀어요! 심층에서는 아이의 열두 달이랑 부모님이 지킬 세 가지를 자세히 봐 드려요. 부모님 생일도 가져오시면 아이랑 얼마나 잘 맞는지도 봐요!', face: 'smile' }], prompt: '어떻게 할까요?', sheet: '아이 시트 보여 줘', again: '다른 캐릭터한테도 가 볼게' },
    },

    // ─────────────────────────── 냉철한 헤드헌터 · 커리어·이직 ───────────────────────────
    hunter: {
      entrance: 'hunter', particles: 'grid',
      intro: [
        { t: '앉으시죠. 시간은 15분입니다.', face: 'neutral', fx: 'flash' },
        { t: '서지안입니다. 헤드헌터죠. 저는 시장이 당신을 어떻게 평가하는지, 그리고 언제 움직여야 하는지만 봅니다. 연애나 가족 문제는 제 분야가 아닙니다.', face: 'neutral' },
        { t: '결론부터 말하는 편입니다. 듣기 좋은 말은 기대하지 마십시오. 진행할까요?', face: 'serious', sprite: 'bump' },
      ],
      concern: {
        prompt: '오늘 안건은 무엇입니까?',
        options: [
          { value: 'move', label: '이직할까 말까 고민입니다', reply: [{ t: '이직은 횟수가 아니라 타이밍입니다. 명식에서 "언제 움직이면 안 되는지"부터 확정하겠습니다.', face: 'neutral' }] },
          { value: 'promo', label: '승진이 막혔습니다', reply: [{ t: '승진 병목은 보통 실력이 아니라 포지셔닝입니다. 당신이 시장에서 어떤 유형으로 읽히는지 보겠습니다.', face: 'serious' }] },
          { value: 'burnout', label: '번아웃입니다', reply: [{ t: '번아웃은 기질과 환경의 간격에서 옵니다. 명식에서 그 간격이 어디인지 짚겠습니다. 이직이 답이 아닐 수도 있습니다.', face: 'serious' }] },
        ],
      },
      ask: {
        lead: [{ t: '기본 정보를 받겠습니다. 생년월일시입니다. 이력서보다 정확한 자료입니다.', face: 'neutral' }],
        name: '성함, 또는 부를 이름을 알려 주십시오.', gender: '성별을 선택해 주십시오. 대운의 방향이 달라집니다.', date: '생년월일입니다. 양력 기준입니다.', time: '출생 시각입니다. 모르시면 "모름"으로 두셔도 됩니다. 시주 없이도 유형 분류는 가능합니다.',
        reuse: { prompt: '이미 입력된 명식이 있습니다. 그대로 진행할까요, 다시 받을까요?', keep: '그대로 진행', fresh: '다시 입력' },
        done: [{ t: '{name} 님, 접수했습니다. 검토를 시작합니다.', face: 'neutral', fx: 'flash' }],
      },
      summon: [{ t: '년주, 월주, 일주, 시주. 네 개의 변수를 테이블에 올립니다.' }],
      beats(c) {
        const r = c.r, p = c.p, mo = monthsInfo(r, p), st = R.strengthJudge(r), nx = r.seun[1], sg = r.strongestGroup;
        const moveType = st.label === '신강' ? '신강입니다. 책임을 늘리는 이직이 맞습니다. 직책과 범위가 커지는 자리로 가십시오. 같은 급은 손해입니다.' : st.label === '신약' ? '신약입니다. 환경을 바꾸는 이직이 맞습니다. 직책보다 조직 문화와 상사를 보십시오. 큰 조직은 적응에 2년을 씁니다.' : '중화에 가깝습니다. 신강·신약으로는 결론이 안 나오니, 타이밍이 전부입니다. 아래 흐름표를 기준으로 하십시오.';
        const yearMeaning = { 관성: '관성 운. 평가·직책·이직의 해입니다. 오퍼가 들어오는 해이고, 동시에 압박도 큽니다.', 식상: '식상 운. 독립·부업·산출물의 해입니다. 조직 안에서는 마찰이 늘고, 밖에서는 기회가 늘어납니다.', 인성: '인성 운. 학습·자격·준비의 해입니다. 이직보다 자격과 멘토를 챙기는 해이며, 실행은 느려집니다.', 재성: '재성 운. 보상 협상의 해입니다. 연봉과 성과급 구조를 바꿀 때입니다.', 비겁: '비겁 운. 경쟁과 독립의 해입니다. 상사와의 마찰이 늘고, 개인 성과가 분리되는 자리가 유리합니다.' };
        const b = [
          { t: P.fill(p.open[r.dayMaster.element], c), face: 'neutral', visual: { type: 'pillars' } },
          { t: `유형 분류입니다. 가장 강한 역량은 ${sg}. 적합 직군은 ${R.CAREER[sg]}. ${P.fill(p.strong[sg], c)}`, face: 'neutral', visual: { type: 'stats' } },
          { t: `외부 조달이 필요한 역량은 ${r.weakestGroup}입니다. ${P.fill(p.weak[r.weakestGroup], c)}`, face: 'serious', fx: 'dim', sprite: 'nod' },
          { t: `신강·신약 판정입니다. ${moveType}`, face: st.label === '신약' ? 'serious' : 'neutral', fx: 'flash', visual: glyph(st.label, `${st.label} · ${st.score}점`, st.why[0]) },
          { t: `${nx.year}년 세운은 ${nx.stem}${nx.branch}, ${yearMeaning[nx.tenGod.group]}`, face: nx.tenGod.group === '관성' || nx.tenGod.group === '식상' ? 'smile' : 'neutral', visual: glyph(nx.stem + nx.branch, `${nx.year}년 · ${nx.tenGod.group} 운`, P.groupDesc[nx.tenGod.group]) },
          { t: `분기별 실행 캘린더입니다. 평가·면접·직책 제안이 들어오는 창은 ${mo.names(mo.focus)}. ${c.concern === 'promo' ? '승진 어필은 이 달에 하십시오.' : c.concern === 'burnout' ? '역할 조정을 요청할 창도 이 달입니다.' : '지원과 오퍼 수락은 이 달에 맞추십시오.'}`, face: 'neutral', visual: monthsVisual(mo, `${mo.nextY}년 · 평가·직책이 들어오는 달`) },
        ];
        if (mo.caution.length) b.push({ t: `${mo.names(mo.caution)}은 충이 드는 달입니다. 퇴사 통보와 오퍼 수락을 이 달에 하지 마십시오. 조건을 두 번 확인하십시오.`, face: 'serious', fx: 'shake' });
        if (c.concern === 'burnout') b.push({ t: `번아웃 진단입니다. 당신의 기질은 ${sg}형인데 비어 있는 ${r.weakestGroup}을 환경이 요구하고 있다면, 그 간격이 소모 지점입니다. 이직 전에 역할 조정을 먼저 시도하십시오.`, face: 'serious' });
        b.push({ t: '결론입니다. 이직은 횟수가 아니라 타이밍이고, 타이밍은 운이 아니라 흐름표입니다. 여기까지가 무료 검토입니다.', face: 'neutral', fx: 'glow', visual: null });
        return b;
      },
      ending: { lines: [{ t: '시트에 정리해 두었습니다. 심층 리포트에서는 현재 대운의 커리어 의미, 분기별 적기·비적기, 적합 직무와 피해야 할 환경을 제시합니다. 다음 검토 시점은 입춘 전후입니다.', face: 'neutral' }], prompt: '다음 단계를 선택하십시오.', sheet: '검토 시트 열기', again: '다른 담당자와 상담' },
    },

    // ─────────────────────────── 정경진 · 전문가 종합 (전체를 본다) ───────────────────────────
    master: {
      entrance: 'master', particles: 'star',
      intro: [
        { t: '어서 오세요. 늦은 시간인데 잘 오셨어요. 별자리 보던 참이었어요.', face: 'smile', fx: 'glow' },
        { t: '정경진입니다. 명리는 어렵지 않아요. 어렵게 말하는 사람이 있을 뿐이죠. 저는 원국부터 내년 열두 달까지, 전부 봅니다.', face: 'neutral' },
        { t: '연애든 돈이든 아이든, 따로 떼지 않고 한 사람의 명식으로 한 번에 봐요. 그게 종합 풀이예요. 시작할까요?', face: 'smile', sprite: 'nod' },
      ],
      concern: {
        prompt: '오늘 가장 궁금한 건 어느 쪽이세요? 어느 쪽이든 전부 보지만, 그쪽부터 말씀드릴게요.',
        options: [
          { value: 'all', label: '전부 다, 제대로 봐 주세요', reply: [{ t: '네, 그게 제일 좋아요. 일간부터 용신, 대운, 세운, 배우자, 직업, 열두 달까지 순서대로 갈게요.', face: 'smile' }] },
          { value: 'why', label: '요즘 왜 이렇게 힘든지 알고 싶어요', reply: [{ t: '그건 대부분 세운과 대운이 설명해요. 사람이 바뀐 게 아니라 무대가 바뀐 거거든요. 전체를 보면서 그 지점을 짚어 드릴게요.', face: 'serious' }] },
          { value: 'who', label: '내가 어떤 사람인지 궁금해요', reply: [{ t: '좋은 질문이에요. 일간과 십신 비율이 그 답이에요. 그래도 사람은 혼자 안 살죠. 배우자 자리와 일의 형태까지 같이 볼게요.', face: 'smile' }] },
        ],
      },
      ask: {
        lead: [{ t: '그럼 명식을 세워 볼게요. 생년월일시를 알려 주세요. 시간까지 있으면 네 기둥이 다 서요.', face: 'neutral' }],
        name: '뭐라고 불러 드릴까요?', gender: '성별을 알려 주세요. 대운 순·역행과 배우자성 판단에 써요.', date: '생년월일이요. 양력 기준으로요.', time: '태어난 시각은요? 모르시면 년·월·일주로만 봐도 돼요. 대신 시주 얘기는 빼고 갈게요.',
        reuse: { prompt: '아까 세운 명식이 있네요. 그대로 볼까요, 다시 받을까요?', keep: '그대로 봐 주세요', fresh: '다시 입력할게요' },
        done: [{ t: '{name} 님, 받았어요. 별자리 선을 따라 네 기둥을 세울게요. 어려운 말 나오면 제가 바로 풀어 드려요.', face: 'smile', fx: 'burst' }],
      },
      summon: [{ t: '년주, 월주, 일주, 시주. 하늘의 글자 넷이 남색 벽 위에 자리를 잡습니다.' }],
      beats(c) {
        const r = c.r, p = c.p, mo = monthsInfo(r, p), st = R.strengthJudge(r), sp = spouseInfo(r), now = r.seun[0], nx = r.seun[1], cur = r.daeun && r.daeun.current, sg = r.strongestGroup, top = r.sortedElems[0], low = r.sortedElems[4];
            const dm = R.DAYMASTER[r.day.stem];
        const b = [
          { t: `${P.fill(p.open[r.dayMaster.element], c)} 쉽게 말해 ${dm.image}예요.`, face: 'smile', visual: { type: 'pillars' } },
          { t: `원국의 힘 분포예요. 가장 강한 기운은 ${sg}, 가장 약한 기운은 ${r.weakestGroup}. ${P.fill(p.strong[sg], c)}`, face: 'neutral', visual: { type: 'stats' } },
          { t: P.fill(p.weak[r.weakestGroup], c), face: 'serious', sprite: 'nod' },
          { t: `오행은 ${top}(${KO[top]})이 가장 많고 ${low}(${KO[low]})이 가장 적어요. 조후로 보면 ${st.seasonText}`, face: 'neutral', visual: { type: 'radar' } },
          { t: `전문가들이 가장 오래 보는 장이에요. 판정은 ${st.label}. ${st.why[0]}. ${st.yongshin.pick ? `용신 후보는 ${st.yongshin.pick}이에요. ${st.yongshin.why}.` : st.yongshin.why + '.'} 간이 판정이지만 근거는 이렇습니다.`, face: 'neutral', fx: 'flash', visual: glyph(st.label, `${st.label} · ${st.score}점`, st.yongshin.pick ? `용신 후보 ${st.yongshin.groups.join('·')}` : '조후 우선') },
        ];
        if (cur) b.push({ t: `대운은 10년 단위의 무대예요. 지금은 ${cur.stem}${cur.branch}, ${cur.tenGod.group} 운이고 ${cur.fromAge}세부터 ${cur.toAge}세까지예요. ${P.luckByGroup[cur.tenGod.group]}`, face: 'neutral', visual: glyph(cur.stem + cur.branch, `현재 대운 · ${cur.tenGod.group}`, `${cur.fromAge}~${cur.toAge}세`) });
        b.push({ t: `세운은 그 해의 날씨예요. 올해 ${now.year}년은 ${now.tenGod.group} 운, 내년 ${nx.year}년은 ${nx.tenGod.group} 운. ${c.concern === 'why' ? `올해가 힘드셨다면 ${now.tenGod.group} 운의 성격 때문이에요. ${P.luckByGroup[now.tenGod.group]}` : P.luckByGroup[nx.tenGod.group]}`, face: c.concern === 'why' ? 'serious' : 'neutral', visual: { type: 'pair', title: '올해와 내년', a: { big: now.stem + now.branch, label: `${now.year} · ${now.tenGod.group}` }, b: { big: nx.stem + nx.branch, label: `${nx.year} · ${nx.tenGod.group}` }, sub: '세운 = 그 해의 날씨' } });
        b.push({ t: `배우자 자리도 볼게요. 배우자성 ${sp.sg}이 ${sp.count === 0 ? '원국에 없어요. 인연이 없다는 뜻이 아니라, 운에서 들어올 때 움직이는 구조예요' : `${sp.count}개, ${sp.where}에 있어요`}. 일지에는 ${r.day.branch}, ${sp.dayGod}이 앉아 있고요. ${P.groupDesc[sp.dayGroup] || ''}`, face: sp.count ? 'smile' : 'neutral', visual: glyph(sp.glyph, `배우자성 ${sp.sg} · ${sp.count}개`, `일지 ${r.day.branch} · ${sp.dayGod}`) });
        b.push({ t: `일의 형태는 십신 비율로 봐요. ${sg}이 강하시니 1순위는 ${R.CAREER[sg]}. 한 가지로 단정하진 않지만, 비어 있는 ${r.weakestGroup}을 요구하는 환경은 오래 못 버티세요.`, face: 'neutral', visual: glyph('業', `적성 · ${sg}형`, R.CAREER[sg]) });
        b.push({ t: `마지막으로 ${mo.nextY}년 열두 달이에요. 추진해도 되는 달이 ${mo.push.length}개, 조심할 달이 ${mo.caution.length}개. 용신 쪽 기운이 들어오는 달은 ${mo.names(mo.focus)}이고, 새 습관·공부·관계 정리는 여기에 두세요.`, face: 'smile', visual: monthsVisual(mo, `${mo.nextY}년 · 용신 쪽 기운이 드는 달`) });
        if (mo.caution.length) b.push({ t: `${mo.names(mo.caution)}은 충이 들어와요. 계약·이사·수술·결혼처럼 날짜가 있는 일은 이 달을 피하시고, 피할 수 없으면 두 번 확인하세요.`, face: 'serious', fx: 'shake' });
        b.push({ t: '여기까지가 무료 종합이에요. 명리는 운명을 정하는 학문이 아니라 "내가 어떤 계절에 서 있는지" 알려 주는 달력이에요. 달력을 아는 사람은 비 오는 날 우산을 챙기죠.', face: 'smile', fx: 'glow', visual: null });
        return b;
      },
      ending: { lines: [{ t: '시트에 전부 정리해 뒀어요. 심층에서는 열일곱 장으로 원국 해부부터 격·용신·조후, 대운·세운·열두 달, 배우자·직업·실행 계획까지 다 풀어 드립니다. 궁금한 점은 언제든 다시 물어보세요.', face: 'smile' }], prompt: '어떻게 할까요?', sheet: '제 시트를 펼쳐 주세요', again: '다른 캐릭터에게도 보일게요' },
    },

    // ─────────────────────────── MBTI 상담사 · 검사·명식·추구 세 글자 (친절한 과외 선생님 톤) ───────────────────────────
    mbti: {
      persona: { id: 'mbti', name: '도윤 선생님', role: 'MBTI 사주 · 성향 상담', tier: 'character', palette: { accent: '#66d6c5', accent2: '#1f4f52', glow: 'rgba(102,214,197,.35)' }, emblem: '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="16" y="16" width="30" height="30" rx="9" fill="currentColor"/><rect x="54" y="16" width="30" height="30" rx="9" fill="currentColor" opacity=".7"/><rect x="16" y="54" width="30" height="30" rx="9" fill="currentColor" opacity=".7"/><rect x="54" y="54" width="30" height="30" rx="9" fill="currentColor"/></svg>' },
      mbti: true, entrance: 'master', particles: 'moon',
      intro: [
        { t: '어서 오세요. 편한 자리에 앉으세요. 오늘은 제가 과외 선생님처럼 옆에 앉아서 같이 볼게요.', face: 'smile' },
        { t: '도윤이에요. MBTI 상담을 맡고 있어요. 보통은 검사 결과 하나만 보는데, 저는 세 글자를 나란히 놓아요. 내가 아는 나, 타고난 나, 되고 싶은 나.', face: 'neutral' },
        { t: '타고난 나는 사주 명식에서 꺼내요. 어려운 말은 제가 다 풀어서 설명할 테니 걱정 마세요. 시작해 볼까요?', face: 'smile', sprite: 'nod' },
      ],
      concern: {
        prompt: '오늘은 어떤 게 제일 궁금하세요?',
        options: [
          { value: 'gap', label: '검사 결과랑 실제 내가 다른 것 같아요', reply: [{ t: '좋은 출발이에요. 그 다름이 어디서 오는지가 오늘의 숙제예요. 환경이 만든 모습인지, 타고난 결인지 같이 가려 볼게요.', face: 'smile' }] },
          { value: 'goal', label: '되고 싶은 유형이 있어요', reply: [{ t: '네, 그게 제일 좋은 질문이에요. 되고 싶은 유형이 타고난 결과 같은지, 거스르는지에 따라 가는 길이 완전히 달라지거든요.', face: 'smile' }] },
          { value: 'who', label: '타고난 성향이 뭔지 알고 싶어요', reply: [{ t: '그럼 명식부터 볼게요. 검사는 지금의 자기 보고고, 명식은 태어난 시각의 구조라서 서로 다른 얘기를 해 줘요.', face: 'neutral' }] },
        ],
      },
      ask: {
        lead: [{ t: '먼저 명식을 세워야 해요. 태어난 날과 시각을 알려 주세요. 그다음에 검사 결과를 받을게요.', face: 'neutral' }],
        name: '제가 뭐라고 부르면 좋을까요?', gender: '성별을 알려 주세요. 큰 흐름의 방향을 계산할 때 써요.', date: '태어난 날이에요. 양력으로요.', time: '태어난 시각은요? 모르시면 "몰라요"를 눌러 주세요. 시각 없이도 성향은 볼 수 있어요.',
        reuse: { prompt: '아까 세운 명식이 있네요. 그대로 쓸까요, 다시 받을까요?', keep: '그대로요', fresh: '다시 입력할게요' },
        mbti: '평소 검사에서 나오는 MBTI를 골라 주세요. 가장 자주 나온 결과면 돼요.',
        goal: { prompt: '되고 싶은, 혹은 끌리는 유형이 있나요? 없어도 괜찮아요.', yes: '있어요', no: '없어요', pick: '그 유형을 골라 주세요.', got: '좋아요. 세 글자가 다 모였어요.', skip: '괜찮아요. 그럼 검사와 명식 두 글자로 볼게요. 결과 화면에서 나중에 추가할 수도 있어요.' },
        done: [{ t: '{name} 님, 고마워요. 이제 명식에서 타고난 성향을 꺼내 볼게요.', face: 'smile', fx: 'glow' }],
      },
      summon: [{ t: '태어난 해, 달, 날, 시각. 네 기둥을 세우고, 거기서 다섯 가지 기운의 비율을 읽어요.' }],
      beats(c) {
        const est = c.est, cmp = c.cmp, adv = c.adv; const AX = { EI: '에너지의 방향', SN: '정보를 받는 방식', TF: '결정하는 방식', JP: '세상을 대하는 자세' };
        const b = [
          { t: '사주판이 섰어요. 여기서 다섯 가지 힘의 비율을 보고 네 축으로 옮겨요. 사주와 MBTI 사이에 증명된 대응은 없지만, 자기 인식과 기질을 나란히 놓는 데는 충분해요.', face: 'neutral', visual: { type: 'pillars' } },
          { t: `타고난 결이 가리키는 성향은 ${est.letters}예요. 검사로 아는 ${cmp.test}${adv ? `, 되고 싶은 ${adv.goal}` : ''}과 나란히 놓을게요. ${cmp.matches === 4 ? '검사와 네 축이 다 같네요. 환경이 기질을 잘 쓰고 있다는 뜻이에요.' : `검사와는 ${cmp.matches}축이 같고 ${4 - cmp.matches}축이 달라요. 다른 축이 평소 이유 없이 피곤한 자리일 가능성이 커요.`}`, face: cmp.matches >= 3 ? 'smile' : 'neutral', fx: 'flash', visual: { type: 'letters', items: [{ label: '내가 아는 나 · 검사', v: cmp.test }, { label: '타고난 나 · 명식', v: est.letters }].concat(adv ? [{ label: '되고 싶은 나 · 추구', v: adv.goal }] : []) } },
        ];
        est.axes.forEach((a, i) => {
          const x = cmp.axes[i];
          b.push({ t: `${a.left}/${a.right}, ${AX[a.id]}이에요. 타고난 결은 ${a.letter}${a.letterPct < 56 ? ', 경계에 있어요' : a.letterPct >= 75 ? ', 뚜렷해요' : '예요'}. ${x.text}`, face: x.match ? 'smile' : 'serious', visual: { type: 'axis', a, test: x.test, goal: adv ? adv.goal[i] : null } });
          if (adv) { const y = adv.axes[i]; b.push({ t: `되고 싶은 ${y.goal} 쪽은요, 한마디로 "${y.verdict}"이에요. ${y.text}`, face: y.kind === 'keep' || y.kind === 'return' ? 'smile' : 'serious', fx: y.kind === 'against' && y.chartPct >= 75 ? 'dim' : null }); }
        });
        if (adv) b.push({ t: adv.summary, face: 'smile', fx: 'glow', visual: { type: 'letters', items: [{ label: '되고 싶은 나', v: adv.goal }, { label: '사주가 권하는 흐름', v: adv.rec }] } });
        b.push({ t: '여기까지가 무료 상담이에요. 기억할 건 하나예요. 검사와 타고난 결 중 무엇이 맞느냐가 아니라, 어느 상황에서 어느 쪽 내가 나오는지예요.', face: 'smile', visual: null });
        return b;
      },
      ending: { lines: [{ t: '결과 화면에 네 축을 전부 정리해 뒀어요. 심층에서는 축마다 왜 그렇게 기울었는지, 되고 싶은 쪽으로 가려면 명식의 어떤 기운을 쓰면 되는지, 4주 실험까지 드려요.', face: 'smile' }], prompt: '어떻게 할까요?', sheet: '결과 화면 보여 주세요', again: '다른 캐릭터에게 가 볼게요' },
    },
  };

  root.SajuVNScripts = { SCRIPTS, spouseInfo, monthsInfo, compat };
})(typeof self !== 'undefined' ? self : this);
