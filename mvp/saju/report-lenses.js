/*
 * report-lenses.js — 캐릭터별 "렌즈". 사람들이 그 캐릭터를 왜 눌렀는지에 맞춰 질문과 답을 그 영역 안에서만 만든다.
 *  sage(백운)=재물 · flame(윤슬)=연애·궁합 · hunter(서지안)=이직 · granny(복순)=한 해·가족·건강. child는 report2의 아이 전용 표, master·mbti는 전체.
 *  각 렌즈: 피할 것 3개 표(weakAvoid/weakInstead/weakRecap · year · monthDomain · monthFallback) · plan(4주) · entries(L1 진입점) · sections(ctx) → L2 7장.
 *  문장 규칙은 report2와 같다(쉬운 말 · 해요체 · 40자 · 단락 3문장 · 피할 것/대신 쌍). report2.lint가 그대로 검사한다.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SajuLenses = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const L = {};

  // ═══════════════ 백운 도사 · 재물 ═══════════════
  const DM_MONEY = { 甲: '크게 벌려 놓고 수금이 늦는 쪽이에요.', 乙: '사람을 통해 벌고 거절을 못 해 새요.', 丙: '사람과 경험에 쓰고 보여 주는 데 써요.', 丁: '깊게 파는 한 분야에서 꾸준히 벌어요.', 戊: '쌓아 두고 안 움직여 기회비용이 커요.', 己: '실속은 챙기지만 남 일에 돈이 새요.', 庚: '벌 땐 크게 벌고 자를 땐 손실도 커요.', 辛: '품질에 쓰고 단가로 벌어야 하는 사람이에요.', 壬: '판이 크고 흐름을 타지만 정산이 늦어요.', 癸: '조용히 모으지만 결정을 미뤄 기회를 놓쳐요.' };
  const MONEY_PRESC = {
    drain: { 식상: { avoid: '아이디어를 돈으로 바꾸지 않은 채 쌓아 두지 마세요', instead: '만든 것 하나에 가격표를 붙여 이번 달 안에 팔아 보세요. 센 힘은 결과로 바꿔야 돈이 돼요.' }, 재성: { avoid: '벌 궁리 없이 힘만 쓰며 버티지 마세요', instead: '이번 달 손에 쥘 금액 하나를 숫자와 날짜로 정하세요. 센 힘은 결과로 바꿔야 몸이 가벼워져요.' }, 관성: { avoid: '관리하는 사람 없이 혼자 돈을 굴리지 마세요', instead: '장부를 봐 주는 사람 하나와 월말 점검 날을 두세요. 센 힘은 울타리 안에서 돈이 돼요.' } },
    fill: { 비겁: { avoid: '내 몫을 말하지 않은 채 돈 거래를 시작하지 마세요', instead: '돈이 걸린 자리에서는 내 몫을 첫 문장으로 말하세요. 힘이 약할수록 내 몫을 먼저 지켜야 남아요.' }, 인성: { avoid: '지친 상태에서 큰돈을 움직이지 마세요', instead: '큰돈 결정은 쉰 다음 날 낮에 하세요. 짐이 많은 명식은 판단이 맑을 때만 돈이 남아요.' }, 식상: { avoid: '만든 것을 공짜로 나눠 주기만 하지 마세요', instead: '매주 하나는 값을 받고 내보내 보세요. 비어 있던 통로에 값이 붙으면 돈이 돌기 시작해요.' }, 재성: { avoid: '통장을 보지 않은 채 한 달을 넘기지 마세요', instead: '매주 한 번 들어온 돈과 나간 돈을 적어 보세요. 손에 쥐는 감각은 세어 보는 데서 자라요.' }, 관성: { avoid: '울타리 없이 들어오는 대로 쓰지 마세요', instead: '월급날 자동이체 하나를 울타리로 세우세요. 틀 하나가 돈을 지켜요.' } },
  };
  const MONEY_LEVEL = {
    재성: { 부족: '돈을 손에 쥐는 감각이 비어 있어 들어와도 남지 않아요.', 적정: '돈 감각은 알맞아 벌고 쓰는 리듬이 있어요.', 과다: '돈 기회는 많은데 몸이 먼저 지치는 구조예요.' },
    비겁: { 부족: '내 몫을 주장하는 힘이 작아 나눌 때 손해를 봐요.', 적정: '내 몫을 지키면서 나눌 줄 알아요.', 과다: '동업과 보증에서 새는 자리가 가장 커요.' },
    식상: { 부족: '파는 통로가 비어 있어 좋은 걸 들고도 못 팔아요.', 적정: '만든 것을 파는 통로가 알맞게 있어요.', 과다: '재주는 많은데 동시에 벌여 정산이 늦어요.' },
    관성: { 부족: '지키는 울타리가 비어 있어 번 돈이 흩어져요.', 적정: '지키는 울타리가 알맞아 큰 구멍은 없어요.', 과다: '책임과 체면에 쓰는 돈이 커요.' },
  };
  const LEAK = {
    비겁: { avoid: '동업·보증·공동 명의에 돈을 넣지 마세요', instead: '같이 하고 싶으면 돈 대신 시간과 일로 참여하세요. 몫은 문서로, 돈은 내 이름으로 두는 게 이 명식의 울타리예요.' },
    재성: { avoid: '가격 없이 일을 시작하지 마세요', instead: '일 받기 전에 금액과 범위를 한 줄로 보내세요. 들어온 돈은 그날 떼어 두면 남기 시작해요.' },
    식상: { avoid: '좋은 것을 만들어 놓고 알리지 않은 채 두지 마세요', instead: '만든 것 하나를 매주 한 사람에게 보여 주세요. 파는 통로는 보여 주는 횟수에서 생겨요.' },
    관성: { avoid: '들어온 돈을 그 주에 다 쓰지 마세요', instead: '월급날 자동이체 하나를 먼저 걸어 두세요. 울타리가 작은 명식은 규칙 하나가 돈을 지켜요.' },
    木: { avoid: '새 일을 벌이며 정산을 미루지 마세요', instead: '한 가지를 끝내고 정산한 뒤 다음을 시작하세요. 자라는 기운은 가지치기할 때 열매가 돼요.' },
    火: { avoid: '사람과 분위기에 지갑을 열지 마세요', instead: '모임 예산을 월초에 정하고 그 안에서 쓰세요. 불은 밝지만 재만 남기 쉬워요.' },
    土: { avoid: '묻어 두기만 하고 굴리지 않은 채 두지 마세요', instead: '쌓인 돈의 일부는 정해진 날에 움직이세요. 흙은 갈아야 농사가 돼요.' },
    金: { avoid: '한 번에 크게 자르듯 손절·전환하지 마세요', instead: '큰 결정은 두 번에 나눠서 하세요. 쇠는 천천히 식혀야 단단해요.' },
    水: { avoid: '생각만 하다가 기회를 흘려보내지 마세요', instead: '정보 수집은 기한을 정하고 끝내세요. 물은 둑이 있어야 농사를 지어요.' },
  };
  const MONEY_DECADE = {
    비겁: { body: ['자립해서 버는 힘이 커지는 10년이에요.', '동업과 돈 거래에서 손실이 나기 쉬워요.'], avoid: '동업·보증으로 돈을 묶지 마세요', instead: '벌 땐 혼자 벌고 쓸 땐 함께 쓰세요. 몸이 자산인 계절이라 건강 관리가 곧 재테크예요.' },
    식상: { body: ['재주가 돈이 되는 10년이에요.', '벌이는 만큼 정산이 늦어져요.'], avoid: '만들기만 하고 가격을 안 붙인 채 넘기지 마세요', instead: '만든 것마다 가격과 마감일을 붙이세요. 꺼내 놓는 만큼 돌아오는 계절이에요.' },
    재성: { body: ['돈이 크게 움직이는 10년이에요.', '들어오는 만큼 나가요.'], avoid: '수입이 늘었다고 고정 지출부터 늘리지 마세요', instead: '수입이 늘면 떼어 두는 비율부터 올리세요. 이 계절의 돈은 남기는 구조가 결정해요.' },
    관성: { body: ['책임과 직책으로 버는 10년이에요.', '체면값이 늘어요.'], avoid: '직함에 맞추려 지출을 키우지 마세요', instead: '직책이 올라도 생활비는 그대로 두세요. 이 계절은 자리가 돈을 가져와요.' },
    인성: { body: ['배우고 준비하며 돈을 늦게 버는 10년이에요.', '안주하기 쉬워요.'], avoid: '자격만 쌓고 수익으로 바꾸길 미루지 마세요', instead: '배운 것을 석 달 안에 돈 받는 자리로 옮기세요. 준비가 길수록 첫 수익을 빨리 만들어야 해요.' },
  };
  const MONEY_YEAR = { 비겁: '경쟁과 동업 제안이 늘어 돈이 새기 쉬운 해예요.', 식상: '새 수입원이 생기지만 말이 앞서는 해예요.', 재성: '돈이 들어오고 나가는 폭이 커지는 해예요.', 관성: '평가와 직책으로 수입이 정해지는 해예요.', 인성: '준비와 문서의 해라 수입은 늦게 와요.' };
  const MONEY_PATH = { 비겁: '혼자 벌고 혼자 지키는 구조가 맞아요.', 식상: '만들어 파는 구조가 맞아요.', 재성: '돈을 굴리고 거래하는 구조가 맞아요.', 관성: '조직 안에서 자리로 버는 구조가 맞아요.', 인성: '자격과 지식으로 버는 구조가 맞아요.' };
  const PATH_PAIR = {
    비겁: { avoid: '남의 사업에 돈만 넣는 투자자로 들어가지 마세요', instead: '내 이름으로 작게 시작하세요. 혼자 책임지는 구조에서 이 명식의 돈이 자라요.' },
    식상: { avoid: '만든 것을 남에게 넘겨 팔게 하지 마세요', instead: '파는 것까지 내 손으로 하세요. 가격을 매기는 순간부터 재주가 돈이 돼요.' },
    재성: { avoid: '한 번에 큰 금액을 한 곳에 넣지 마세요', instead: '나눠서 넣고 나눠서 빼세요. 굴리는 재주가 있는 사람은 분산이 수익이에요.' },
    관성: { avoid: '조직을 급하게 떠나 독립하지 마세요', instead: '자리에서 버는 동안 부업으로 시험하세요. 이 명식은 직함이 신용이고 신용이 돈이에요.' },
    인성: { avoid: '공부만 하고 돈 받는 자리를 미루지 마세요', instead: '자격 하나를 수익으로 바꾸는 기한을 정하세요. 배움은 써먹을 때 돈이 돼요.' },
  };
  const MONEY_REL = {
    비겁: { body: '가장 가까운 사람과 돈 주도권을 다투기 쉬워요.', avoid: '가까운 사람과 통장을 하나로 합치지 마세요', instead: '생활비 통장만 공동으로 두고 나머지는 따로 두세요. 같은 힘끼리는 영역이 나뉠 때 돈도 관계도 남아요.' },
    식상: { body: '가까운 사람에게 베푸느라 돈이 나가요.', avoid: '선물과 한턱으로 마음을 증명하려 하지 마세요', instead: '베푸는 예산을 월초에 정하고 그 안에서 주세요. 마음은 횟수가 아니라 꾸준함으로 전해져요.' },
    재성: { body: '가까운 사람이 실속 있고 돈이 함께 와요.', avoid: '돈 이야기를 피한 채 큰 약속을 하지 마세요', instead: '돈 계획을 먼저 꺼내는 쪽이 되세요. 숫자를 나누는 대화가 이 자리의 신뢰예요.' },
    관성: { body: '가까운 사람이 돈의 울타리가 돼요.', avoid: '가까운 사람 몰래 큰 지출을 하지 마세요', instead: '큰 지출은 먼저 말하고 하세요. 울타리가 되는 사람에겐 공유가 곧 안정이에요.' },
    인성: { body: '가까운 사람이 나를 받쳐 주는 자리예요.', avoid: '받는 데 익숙해져 돈 관리를 맡겨 두지 마세요', instead: '한 달에 한 번은 내가 가계부를 보세요. 받는 자리일수록 세어 봐야 오래가요.' },
  };
  L.sage = {
    weakAvoid: { 비겁: '내 몫 없는 돈 거래는 하지 마세요', 식상: '팔 계획 없이 재고를 들이지 마세요', 재성: '가격 없이 일을 시작하지 마세요', 관성: '상한 없이 투자·지출을 하지 마세요', 인성: '지친 날 밤에 큰돈을 움직이지 마세요' },
    weakInstead: { 비겁: '돈이 걸린 자리에선 내 몫을 첫 문장으로 분명히 말하세요. 거절이 어렵다면 내일 답하겠다는 말로 하루를 버는 것부터 시작하면 돼요.', 식상: '들이기 전에 누구에게 어떻게 팔지 한 줄로 먼저 적으세요. 파는 그림이 먼저 그려져야 쌓인 재고가 돈으로 바뀌어요.', 재성: '일을 받기 전에 가격과 범위를 한 줄로 적어 보내세요. 들어온 돈은 그날 두 갈래로 나누고 한쪽은 손대지 않는 계좌로 보내세요.', 관성: '투자와 큰 지출은 금액 상한을 먼저 종이에 적으세요. 상한 하나가 울타리가 되고 그 안에서는 마음껏 움직여도 돼요.', 인성: '큰돈은 쉰 다음 날 낮에, 믿는 한 사람에게 말한 뒤에 움직이세요. 일주일에 하루는 돈 생각을 끄는 날로 비워 두면 판단이 맑아져요.' },
    weakRecap: { 비겁: '돈 거래 전 내 몫 한 줄 먼저.', 식상: '들이기 전 파는 그림 한 줄.', 재성: '일 받기 전 가격 한 줄, 들어온 돈은 두 갈래로.', 관성: '투자·지출은 상한부터.', 인성: '큰돈은 쉰 다음 날 낮에.' },
    monthDomain: { 일주: '집 관련 큰 지출', 월주: '직장·사업 계약', 년주: '집안 돈거래·보증', 시주: '빌려주는 돈' }, monthFallback: '큰 지출·투자',
    plan: { 비겁: ['1주: 돈 얽힌 부탁 하나를 거절해요', '2주: 내 몫을 적은 메모를 한 사람에게 보내요', '3주: 공동 명의·보증 목록을 정리해요', '4주: 내 이름으로 번 돈을 따로 적어요'], 식상: ['1주: 만든 것 하나에 가격을 붙여요', '2주: 한 사람에게 보여 주고 반응을 적어요', '3주: 값을 받고 하나를 내보내요', '4주: 판 기록을 한 장으로 정리해요'], 재성: ['1주: 들어오는 돈의 일부를 자동 이체로 떼어 둬요', '2주: 일주일 지출을 적고 새는 항목 하나를 지워요', '3주: 내가 주는 것의 가격을 정하고 한 번 말해요', '4주: 한 달 수입과 지출을 한 장으로 봐요'], 관성: ['1주: 월급날 자동이체 하나를 걸어요', '2주: 지출 상한을 항목별로 적어요', '3주: 장부 봐 줄 사람과 점검 날을 정해요', '4주: 한 달 울타리가 지켜졌는지 봐요'], 인성: ['1주: 돈 생각 끄는 날 하루를 비워요', '2주: 큰돈 결정을 한 사람에게 먼저 말해요', '3주: 배운 것으로 돈 받을 자리를 하나 적어요', '4주: 쉰 날과 번 돈을 같이 돌아봐요'] },
    planTitle: g => `${g} 쪽으로 돈을 남기는 4주`,
    entries: [{ id: 'who', label: '내 돈 그릇' }, { id: 'year', label: '올해 돈 흐름' }, { id: 'work', label: '내 길' }],
    sections(c) {
      const { r, j, G, EP, lvG, lvE, strong, weak, pickG, rx, dm, cur, nextD, nextY, nowY, sy, cal, push, caution, bestM, prevOfBest, goodM, dayG, top, viz, SP, POS_KO } = c;
      const S = [];
      // 1 돈 그릇
      S.push({ id: 'who', title: '내 돈 그릇', conclusion: c.identityLine, body: [dm.body[0], DM_MONEY[r.day.stem], `전체로는 ${SP[rx.label]}이라 돈 체력이 ${rx.label === '신강' ? '좋은 편' : rx.label === '신약' ? '약한 편' : '중간'}이에요.`, c.SEASON_SENT[c.season]], avoid: (MONEY_PRESC[rx.dir === 'drain' ? 'drain' : 'fill'][pickG] || MONEY_PRESC.fill[pickG]).avoid, instead: (MONEY_PRESC[rx.dir === 'drain' ? 'drain' : 'fill'][pickG] || MONEY_PRESC.fill[pickG]).instead, viz: { type: 'identity' } });
      // 2 새는 자리
      const leakKey = lvG['비겁'] === '과다' ? '비겁' : lvG['재성'] === '부족' ? '재성' : lvG['식상'] === '부족' ? '식상' : lvG['관성'] === '부족' ? '관성' : r.sortedElems[0];
      S.push({ id: 'power', title: '돈이 새는 자리', conclusion: `${j(G[strong], '이')} 가장 크고 ${j(G[weak], '이')} 가장 작아요`, body: [MONEY_LEVEL.재성[lvG['재성']], MONEY_LEVEL.비겁[lvG['비겁']], MONEY_LEVEL.식상[lvG['식상']], MONEY_LEVEL.관성[lvG['관성']], `그래서 처방은 ${c.rxPhrase}이에요.`], avoid: LEAK[leakKey].avoid, instead: LEAK[leakKey].instead, viz: viz.bars });
      // 3 벌 때와 지킬 때
      const md = MONEY_DECADE[c.curG], mdn = nextD ? MONEY_DECADE[nextD.tenGod.group] : null;
      S.push({ id: 'decade', title: '벌 때와 지킬 때', conclusion: cur ? `${cur.fromAge}~${cur.toAge}세는 ${md.body[0].replace('이에요.', '')}` : '첫 10년 계절을 기다리는 중', body: [cur ? `지금은 ${cur.fromAge}~${cur.toAge}세예요.` : '아직 첫 10년 계절 전이라 태어난 달의 기운이 대신해요.'].concat(md.body, [nextD ? (mdn === md ? `${nextD.fromAge}세부터도 같은 흐름이 글자만 바꿔 이어져요.` : `${nextD.fromAge}세부터는 ${mdn.body[0]}`) : '', c.edge ? '지금은 계절이 바뀌는 경계라 큰돈은 첫해를 지나 보고 움직여요.' : '']).filter(Boolean).slice(0, 5), avoid: `${cur ? `${cur.fromAge}~${cur.toAge}세 사이에는` : '첫 계절이 오기 전에는'} ${md.avoid}`, instead: md.instead, viz: viz.timeline });
      // 4 올해·내년 돈 흐름
      const yp = c.T.Y[c.yPair.key] || c.T.Y[c.curG];
      S.push({ id: 'year', title: `${nowY}년과 ${nextY}년 돈 흐름`, conclusion: `${nextY}년은 ${MONEY_YEAR[sy.branchTenGod.group].replace('예요.', '')}`, body: [`${nowY}년은 ${MONEY_YEAR[r.seun[0].branchTenGod.group]}`, `${nextY}년은 ${MONEY_YEAR[sy.branchTenGod.group]}`, c.yClash ? `내 ${POS_KO[c.yClashPillar]} 자리와 부딪혀 돈 쓸 일이 몰려요.` : `앞머리엔 ${G[sy.tenGod.group]}, 뒤로 갈수록 ${G[sy.branchTenGod.group]} 주제예요.`, `둘 다 떼어 두는 비율을 먼저 정하면 남는 해가 돼요.`], avoid: `${c.yPair.time}에는 ${yp.avoid}`, instead: yp.instead.replace(/\{good\}/g, goodM), viz: viz.years });
      // 5 거래 달력
      S.push({ id: 'months', title: `${nextY}년 거래 달력`, conclusion: `계약·거래는 ${c.mlist(push.slice(0, 3)) || '보통 달'}, 지갑 닫을 달 ${c.mlist(caution) || '없음'}`, body: ['진한 칸이 거래와 계약을 밀어붙일 달이에요.', `가장 좋은 달은 ${j(c.mlabel(bestM), '이에요')}.`, caution.length ? `지갑을 닫을 달은 ${j(c.mlist(caution), '이에요')}.` : '정면으로 부딪히는 달은 없어요.', '달의 경계는 1일이 아니라 괄호 안 날짜예요.'], avoid: `${nextY}년 ${prevOfBest.label} 말까지 ${bestM.label}에 할 거래 목록을 비워 두지 마세요`, instead: `${prevOfBest.label} 마지막 주에 ${bestM.label}에 할 계약·거래 세 가지를 적어 두세요. 좋은 달은 준비된 사람에게만 좋은 달이에요. 목록 하나가 운을 두 배로 써요.`, viz: viz.calendar });
      // 6 동업·독립·투자
      const coop = lvG['비겁'] === '과다' ? '동업은 몫을 문서로 못 박아야 가능해요.' : lvG['비겁'] === '부족' ? '동업하면 내 몫을 먼저 말하는 연습이 필요해요.' : '동업은 역할만 나누면 괜찮아요.';
      const inv = lvG['관성'] === '부족' ? '투자는 금액 상한을 먼저 정해야 해요.' : lvG['재성'] === '과다' ? '투자 기회는 많으니 고르는 기준이 전부예요.' : '투자는 아는 분야에서 소액으로 시작하는 게 맞아요.';
      S.push({ id: 'work', title: '동업·독립·투자 중 내 길', conclusion: MONEY_PATH[top[0]].replace('가 맞아요.', ''), body: [MONEY_PATH[top[0]], coop, inv, c.weakInAllowed ? `${j(c.CAREER_S[weak], '은')} 지금 힘들어도 길게 보면 채울 방향이에요.` : `길게 보면 ${c.CAREER_S[pickG]} 쪽이 타고난 판을 보완해요.`], avoid: PATH_PAIR[top[0]].avoid, instead: PATH_PAIR[top[0]].instead });
      // 7 돈과 사람
      const mr = MONEY_REL[dayG];
      S.push({ id: 'rel', title: '돈과 가까운 사람', conclusion: mr.body.replace(/\.$/, ''), body: [mr.body, `집안 자리로 보면 ${c.BRANCH_POS[r.year.branch][0]}.`, lvG['비겁'] === '과다' ? '동업과 보증은 가까운 사람일수록 더 조심해요.' : '가까운 사람과의 돈 거래는 문서가 관계를 지켜요.'], avoid: mr.avoid, instead: mr.instead });
      return S;
    },
  };

  // ═══════════════ 윤슬 · 연애·궁합 ═══════════════
  const LOVE_TEMP = { 木: '시작이 빠르고 마음을 키워 주는 사랑을 해요.', 火: '뜨겁게 시작하고 식는 속도도 빨라요.', 土: '천천히 깊어지고 한 번 품으면 오래 가요.', 金: '선이 분명하고 신뢰가 깨지면 돌아보지 않아요.', 水: '먼저 식어 먼저 떠나는 쪽이 자주 나예요.' };
  const LOVE_LEVEL = { 비겁: { 과다: '경쟁자가 끼는 삼각 구도가 생기기 쉬워요.', 부족: '상대 리듬에 맞추다 나를 잃기 쉬워요.', 적정: '내 자리를 지키며 맞출 줄 알아요.' }, 식상: { 과다: '표현이 넘쳐 말실수로 관계가 흔들려요.', 부족: '마음은 깊은데 표현이 적어 오해를 사요.', 적정: '표현이 알맞아 마음이 전해져요.' }, 인성: { 부족: '상처를 회복할 틈 없이 다음 사람을 만나요.', 과다: '생각이 많아 고백을 미루기 쉬워요.', 적정: '다친 마음을 스스로 추스를 줄 알아요.' } };
  const LOVE_SP = [
    { body: '짝 기운이 드러나 있지 않아 인연은 운이 들어올 때 움직여요.', avoid: '기다리면 온다는 말만 믿고 집에만 있지 마세요', instead: '인연이 움직이는 달엔 새 모임 하나에 꼭 나가세요. 드러난 짝 기운이 없는 사람은 직접 찾아 나설 때 보여요.' },
    { body: '짝 기운이 하나 있어 한 사람에게 집중하는 구조예요.', avoid: '한 사람에게 모든 걸 걸고 나를 지우지 마세요', instead: '집중하는 만큼 내 일상 하나는 지키세요. 한 사람 구조는 내가 서 있을 때 오래가요.' },
    { body: '짝 기운이 둘 있어 비교하다 놓치기 쉬운 구조예요.', avoid: '두 사람을 저울질하며 둘 다 붙잡아 두지 마세요', instead: '기한을 정하고 한 사람을 고르세요. 선택의 구조는 결정이 늦을수록 둘 다 잃어요.' },
    { body: '짝 기운이 여럿이라 고르는 기준을 먼저 세워야 해요.', avoid: '외롭다고 아무나 빨리 사귀지 마세요', instead: '만나기 전에 안 되는 조건 세 개를 적어 두세요. 인연이 많은 사람은 거르는 기준이 곧 복이에요.' },
  ];
  const LOVE_DECADE = {
    비겁: { body: ['친구 같은 인연이 많고 경쟁도 생기는 10년이에요.', '혼자가 편해지는 시기이기도 해요.'], avoid: '친구 관계와 연애를 섞어 두 쪽 다 놓치지 마세요', instead: '마음이 생기면 친구 자리를 먼저 정리하고 고백하세요. 이 계절은 선이 분명할 때 인연이 남아요.' },
    식상: { body: ['표현이 커져 만남이 많아지는 10년이에요.', '말실수와 변덕도 같이 와요.'], avoid: '감정이 올라온 날 밤에 이별 통보를 하지 마세요', instead: '중요한 말은 다음 날 낮에 하세요. 표현의 계절은 타이밍만 늦추면 매력이 돼요.' },
    재성: { body: ['현실과 조건이 사랑에 들어오는 10년이에요.', '남성이라면 인연이 움직이는 계절이에요.'], avoid: '조건만 보고 마음을 뒤로 미루지 마세요', instead: '조건은 적어 두고 마음은 직접 만나서 확인하세요. 현실의 계절은 둘을 같이 볼 때 결혼으로 이어져요.' },
    관성: { body: ['책임과 결혼이 주제가 되는 10년이에요.', '여성이라면 인연이 움직이는 계절이에요.'], avoid: '압박감에 밀려 결혼을 결정하지 마세요', instead: '결혼 결정은 좋은 달에, 내 기준 세 가지를 적은 뒤 하세요. 책임의 계절은 내가 고를 때 안정이 돼요.' },
    인성: { body: ['쉬고 회복하는 10년이라 연애가 느려져요.', '기댈 사람을 찾게 돼요.'], avoid: '외로움 때문에 기대기만 하는 관계를 시작하지 마세요', instead: '회복하는 시간을 먼저 채우고 만나세요. 쉼의 계절에 만난 사람은 내가 채워져 있을 때 오래가요.' },
  };
  const LOVE_YEAR = {
    비겁: { line: '친구에서 연인이 되거나 경쟁자가 끼는 해예요.', avoid: '친구 모임에서 삼각관계를 만들지 마세요', instead: '마음이 있으면 둘만 보는 자리를 {good}에 먼저 만드세요. 경쟁이 끼는 해는 선을 긋는 쪽이 이겨요.', recap: '둘만 보는 자리는 {good}에 먼저.' },
    식상: { line: '표현이 많아지고 만남이 느는 해예요.', avoid: '마음을 말로 다 쏟고 확인 없이 기다리지 마세요', instead: '고백은 {good}에 짧게 하고 답은 기한을 두고 기다리세요. 표현이 느는 해라 절제가 매력이 돼요.', recap: '고백은 {good}에 짧게, 답은 기한을 두고.' },
    재성: { line: '현실 조건이 사랑에 들어오는 해예요.', avoid: '조건 계산으로 마음을 미루지 마세요', instead: '만남은 {good}에, 조건은 세 번째 만남 뒤에 보세요. 현실이 들어오는 해라 순서가 중요해요.', recap: '만남은 {good}에, 조건은 세 번째 만남 뒤.' },
    관성: { line: '결혼·책임 이야기가 나오는 해예요.', avoid: '주변 압박에 밀려 결혼을 서두르지 마세요', instead: '결혼 이야기는 {good}에 내 기준을 적고 꺼내세요. 책임의 해는 내가 고르면 안정이 돼요.', recap: '결혼 얘기는 {good}에 내 기준부터.' },
    인성: { line: '혼자 쉬고 싶어지는 해라 연애가 느려요.', avoid: '외로움에 옛 연인에게 먼저 연락하지 마세요', instead: '쉬고 싶은 해는 나를 채우는 데 쓰고 새 만남은 {good}에 두세요. 회복된 뒤 만난 사람이 오래가요.', recap: '새 만남은 {good}에, 그 전엔 나를 채우기.' },
    clash: { line: '관계가 크게 흔들리거나 바뀌는 해예요.', avoid: '동거·이별을 한 달 안에 정하지 마세요', instead: '큰 관계 결정은 {good}부터 한 분기에 하나씩만 하세요. 변동이 큰 해는 방향을 내가 정하는 해예요.', recap: '큰 관계 결정은 {good}부터 하나씩.' },
  };
  L.flame = {
    weakAvoid: { 비겁: '기준 없이 상대에게 맞추지 마세요', 식상: '말하지 않고 알아주길 기다리지 마세요', 재성: '현실 얘기를 미룬 채 깊어지지 마세요', 관성: '사이를 정하지 않고 만나지 마세요', 인성: '회복 없이 다음 사람을 만나지 마세요' },
    weakInstead: { 비겁: '만나기 전에 내가 양보 못 하는 것 세 가지를 종이에 적어 두세요. 내 기준이 서 있어야 맞추는 게 사랑이 되고 기준이 없으면 소모가 돼요.', 식상: '일주일에 한 번은 마음을 한 문장으로 직접 말해 보세요. 말이 어려우면 글로, 글도 어려우면 사진 한 장으로 꺼내도 충분해요.', 재성: '세 번째 만남까지는 서로의 일과 돈 이야기를 한 번은 꺼내세요. 현실을 먼저 나눈 관계가 설렘이 식은 뒤에도 오래가요.', 관성: '만난 지 석 달째엔 우리가 어떤 사이인지 직접 물어보세요. 정의가 생기면 불안이 줄고 틀이 생기면 자유도 더 넓어져요.', 인성: '이별 뒤 최소 한 계절은 혼자 보내며 나를 먼저 채우세요. 회복이 다 끝난 뒤에 만난 사람과 이 명식은 가장 오래가요.' },
    weakRecap: { 비겁: '양보 못 하는 것 세 개 먼저 적기.', 식상: '주 1회 마음을 한 문장으로.', 재성: '세 번째 만남까지 일과 돈 얘기 한 번.', 관성: '석 달째엔 우리 사이를 묻기.', 인성: '이별 뒤 한 계절은 혼자.' },
    year: LOVE_YEAR,
    monthDomain: { 일주: '고백·이별 결정', 월주: '직장 안 연애 시작', 년주: '집안에 상대 소개', 시주: '아이 계획 결정' }, monthFallback: '고백과 이별 통보',
    plan: { 비겁: ['1주: 양보 못 하는 것 세 가지를 적어요', '2주: 상대 부탁 하나를 부드럽게 거절해요', '3주: 내 일정 하나를 연애보다 먼저 지켜요', '4주: 내가 정한 기준을 지킨 날을 세어요'], 식상: ['1주: 마음을 한 문장으로 매일 적어요', '2주: 그중 하나를 상대에게 보내요', '3주: 고마운 점 하나를 직접 말해요', '4주: 표현한 날과 반응을 한 장으로 봐요'], 재성: ['1주: 데이트 예산과 횟수를 정해요', '2주: 일과 돈 이야기를 한 번 꺼내요', '3주: 상대의 현실 계획을 물어봐요', '4주: 조건과 마음을 나란히 적어 봐요'], 관성: ['1주: 관계에서 지킬 규칙 하나를 정해요', '2주: 우리가 어떤 사이인지 물어요', '3주: 애매한 관계 하나에 기한을 정해요', '4주: 규칙을 지킨 날을 달력에 표시해요'], 인성: ['1주: 혼자 회복하는 저녁 하나를 비워요', '2주: 연애 고민을 믿는 사람에게 말해요', '3주: 옛 연락처 하나를 정리해요', '4주: 채워진 날과 비운 날을 돌아봐요'] },
    planTitle: g => `${g}으로 인연을 지키는 4주`,
    entries: [{ id: 'who', label: '내 연애 모양' }, { id: 'months', label: '인연 달력' }, { id: 'rel', label: '궁합' }],
    sections(c) {
      const { r, j, G, lvG, strong, weak, pickG, rx, dm, cur, nextD, nextY, nowY, sy, cal, push, caution, bestM, prevOfBest, goodM, dayG, viz, spouseGroup, spouseN, spouseMonths, REL, STEM_MEAN, BRANCH_MEAN, STEM_HAP, HAP6, CLASH, POS_KO } = c;
      const S = []; const top = r.sortedElems[0]; const relT = REL[dayG];
      S.push({ id: 'who', title: '내 연애 모양', conclusion: c.identityLine, body: [dm.rel, LOVE_TEMP[top], relT.body, LOVE_LEVEL.식상[lvG['식상']]], avoid: relT.avoid, instead: relT.instead, viz: { type: 'identity' } });
      const sp = LOVE_SP[Math.min(3, spouseN)];
      S.push({ id: 'power', title: '끌어들이는 사람, 끌리는 사람', conclusion: sp.body.replace(/\.$/, ''), body: [sp.body, LOVE_LEVEL.비겁[lvG['비겁']], LOVE_LEVEL.인성[lvG['인성']], `전체로는 ${c.SP[rx.label]}이라 ${rx.label === '신강' ? '내가 이끄는 연애가 편해요' : rx.label === '신약' ? '받쳐 주는 사람이 맞아요' : '어느 쪽이든 맞출 수 있어요'}.`], avoid: sp.avoid, instead: sp.instead, viz: viz.bars });
      const ld = LOVE_DECADE[c.curG], ldn = nextD ? LOVE_DECADE[nextD.tenGod.group] : null; const curHasSp = cur && (cur.tenGod.group === spouseGroup || cur.branchTenGod.group === spouseGroup);
      S.push({ id: 'decade', title: '인연의 10년 계절', conclusion: cur ? `${cur.fromAge}~${cur.toAge}세는 ${ld.body[0].replace('이에요.', '')}` : '첫 계절을 기다리는 중', body: [cur ? `지금은 ${cur.fromAge}~${cur.toAge}세예요.` : '아직 첫 10년 계절 전이에요.'].concat(ld.body, [curHasSp ? '이 계절에 짝 기운이 들어 있어 인연이 가까워요.' : '이 계절엔 짝 기운이 없어 서두를 때가 아니에요.', nextD ? (ldn === ld ? `${nextD.fromAge}세부터도 같은 흐름이 이어져요.` : `${nextD.fromAge}세부터는 ${ldn.body[0]}`) : '']).filter(Boolean).slice(0, 5), avoid: `${cur ? `${cur.fromAge}~${cur.toAge}세 사이에는` : '첫 계절이 오기 전에는'} ${ld.avoid}`, instead: ld.instead, viz: viz.timeline });
      const yp = LOVE_YEAR[c.yPair.key] || LOVE_YEAR[c.curG]; const y0 = r.seun[0];
      S.push({ id: 'year', title: `${nowY}년과 ${nextY}년 인연`, conclusion: `${nextY}년은 ${(c.yClash ? LOVE_YEAR.clash : LOVE_YEAR[sy.branchTenGod.group]).line.replace('예요.', '')}`, body: [`${nowY}년은 ${LOVE_YEAR[y0.branchTenGod.group].line}`, `${nextY}년은 ${(c.yClash ? LOVE_YEAR.clash : LOVE_YEAR[sy.branchTenGod.group]).line}`, (sy.tenGod.group === spouseGroup || sy.branchTenGod.group === spouseGroup) ? `${nextY}년엔 짝 기운이 들어 인연이 움직여요.` : `${nextY}년은 짝 기운이 드는 해는 아니라 다지는 해예요.`, c.yClash ? `내 ${POS_KO[c.yClashPillar]} 자리와 부딪혀 관계가 흔들리기 쉬워요.` : ''].filter(Boolean), avoid: `${c.yPair.time}에는 ${yp.avoid}`, instead: yp.instead.replace(/\{good\}/g, goodM), viz: viz.years });
      const spM = spouseMonths.slice(0, 3);
      S.push({ id: 'months', title: `${nextY}년 인연 달력`, conclusion: `인연이 움직이는 달 ${c.mlist(spM) || '뚜렷하지 않음'}, 멈출 달 ${c.mlist(caution) || '없음'}`, body: [`${nextY}년 인연이 움직이는 달은 ${spM.length ? j(c.mlist(spM), '이에요') : '뚜렷하지 않아요'}.`, '진한 칸은 고백과 만남을 밀어붙일 달이에요.', caution.length ? `고백도 이별도 멈출 달은 ${j(c.mlist(caution), '이에요')}.` : '정면으로 부딪히는 달은 없어요.', '달의 경계는 1일이 아니라 괄호 안 날짜예요.'], avoid: `${nextY}년 ${bestM.label}에 만날 자리를 ${prevOfBest.label} 말까지 비워 두지 마세요`, instead: `${prevOfBest.label} 마지막 주에 ${bestM.label}에 나갈 모임이나 약속 세 개를 적어 두세요. 좋은 달은 준비된 사람에게만 좋은 달이에요.`, viz: viz.calendar });
      S.push({ id: 'rel', title: '잘 맞는 상대의 글자', conclusion: `${STEM_MEAN[STEM_HAP[r.day.stem]]} 쪽 사람과 끌림이 빨라요`, body: [`태어난 날 글자가 ${STEM_MEAN[STEM_HAP[r.day.stem]]} 쪽인 사람과 끌림이 빨라요.`, `아랫글자가 ${BRANCH_MEAN[HAP6[r.day.branch]]} 쪽이면 편하게 오래가요.`, `${BRANCH_MEAN[CLASH[r.day.branch]]} 쪽 사람과는 부딪히며 배워요.`, '궁합은 두 명식을 맞대야 정확하고 이건 입구예요.'], avoid: '글자만 보고 사람을 미리 거르지 마세요', instead: '끌리는 사람의 생일을 알게 되면 윤슬에게 다시 와서 맞대 보세요. 입구는 글자가 열고 결론은 여덟 글자가 말해요.' });
      const spY = [y0, sy].filter(y => y.tenGod.group === spouseGroup || y.branchTenGod.group === spouseGroup).map(y => y.year);
      S.push({ id: 'work', title: '결혼·동거 타이밍', conclusion: spY.length ? `${spY.join('·')}년이 짝 기운이 드는 해` : '지금은 다지는 시기', body: [spY.length ? `${spY.join('년과 ')}년은 짝 기운이 드는 해예요.` : `${nowY}년과 ${nextY}년 모두 짝 기운이 드는 해는 아니에요.`, curHasSp ? '지금 10년 계절에도 짝 기운이 있어 결혼 흐름이 가까워요.' : '지금 10년 계절엔 짝 기운이 없어 서두르면 손해예요.', `${nextY}년 결혼·동거 이야기는 ${goodM}에 꺼내는 게 좋아요.`, lvG['관성'] === '부족' && r.input.gender === 'F' ? '틀을 만드는 힘이 작아 관계 정의를 미루기 쉬워요.' : '인사와 큰 약속은 날을 고르는 것부터 시작이에요.'], avoid: '상대 가족에게 인사하는 날을 부딪히는 달에 잡지 마세요', instead: `인사와 큰 약속은 ${goodM}에 잡으세요. 흔들리는 달을 피하면 같은 말도 다르게 들려요. 결혼 흐름이 있는 해라면 그 달이 문이에요.` });
      return S;
    },
  };

  // ═══════════════ 서지안 · 이직 ═══════════════
  const WORK_TYPE = { 비겁: '혼자 맡겨도 되는 독립형 인재로 보여요.', 식상: '결과물로 말하는 제작형 인재로 보여요.', 재성: '숫자를 만드는 성과형 인재로 보여요.', 관성: '조직을 지키는 관리형 인재로 보여요.', 인성: '전문성으로 신뢰받는 자격형 인재로 보여요.' };
  const WORK_LEVEL = { 관성: { 부족: '조직 적응 비용이 커요.', 과다: '평가에 눌려 소모돼요.', 적정: '조직과 자율의 균형이 맞아요.' }, 식상: { 부족: '성과를 설명하는 힘이 약해 저평가돼요.', 과다: '아이디어는 많은데 마무리가 약해요.', 적정: '성과를 알릴 줄 알아요.' }, 비겁: { 과다: '상사와 주도권 다툼이 생겨요.', 부족: '내 몫을 요구하지 못해요.', 적정: '팀 안에서 내 자리를 지켜요.' } };
  const WORK_LEAK = { 관성: { avoid: '규칙 많은 조직으로 혼자 옮기지 마세요', instead: '자율이 큰 팀을 고르거나 규칙을 하나로 줄여 협상하세요. 틀이 작은 사람은 환경을 골라야 오래 다녀요.' }, 식상: { avoid: '성과 자료 없이 면접·평가에 들어가지 마세요', instead: '숫자 하나와 사례 하나를 한 장으로 만들어 가세요. 설명이 붙는 순간 몸값이 달라져요.' }, 비겁: { avoid: '연봉 협상에서 먼저 양보하지 마세요', instead: '희망 연봉을 숫자로 먼저 말하세요. 내 몫을 말하는 사람이 시장에서 제값을 받아요.' }, none: { avoid: '한 번에 여러 제안에 다 응하지 마세요', instead: '제안은 한 분기에 하나만 진지하게 보세요. 고르는 사람이 오래가요.' } };
  const WORK_DECADE = {
    비겁: { body: ['자립해서 책임지는 자리가 맞는 10년이에요.', '동업과 공동 창업은 손실이 나기 쉬워요.'], avoid: '동업으로 회사를 차리지 마세요', instead: '독립하려면 1인 체제로 시작하세요. 자립의 계절은 혼자 책임질 때 성과가 나요.' },
    식상: { body: ['결과물로 평가받는 10년이에요.', '조직과 부딪히고 싶어져요.'], avoid: '조직과 부딪힌 날 바로 사직서를 내지 마세요', instead: '그 에너지로 포트폴리오 하나를 완성하세요. 결과물이 다음 자리를 데려와요.' },
    재성: { body: ['연봉과 성과가 움직이는 10년이에요.', '기회와 유혹이 같이 와요.'], avoid: '연봉만 보고 자리를 옮기지 마세요', instead: '연봉과 함께 성과를 숫자로 남길 수 있는 자리를 고르세요. 결과의 계절은 기록이 몸값이에요.' },
    관성: { body: ['직책과 평가가 걸리는 10년이에요.', '인정과 압박이 같이 와요.'], avoid: '거절 못 해 떠안은 책임으로 번아웃을 키우지 마세요', instead: '책임이 몰리면 순서를 제안하고 직책을 요구하세요. 책임의 계절은 맡은 만큼 자리가 와요.' },
    인성: { body: ['배우고 자격을 쌓는 10년이에요.', '실행이 늦어지기 쉬워요.'], avoid: '자격증만 모으며 이직을 미루지 마세요', instead: '배운 것을 쓸 자리로 석 달 안에 옮기세요. 배움의 계절은 써먹을 때 경력이 돼요.' },
  };
  const WORK_YEAR = {
    비겁: { line: '경쟁이 늘고 독립 제안이 오는 해예요.', avoid: '동료와 같은 자리를 두고 경쟁에 끼지 마세요', instead: '내 성과를 기록으로 남기고 독립 제안은 {good}에 보세요. 경쟁의 해는 기록이 증거예요.', recap: '성과는 기록으로, 독립 제안은 {good}에.' },
    식상: { line: '새 시도와 이직 제안이 느는 해예요.', avoid: '제안이 왔다고 바로 사표를 내지 마세요', instead: '제안은 {good}에 서면으로 받고 비교하세요. 시도의 해는 고를수록 유리해요.', recap: '제안은 {good}에 서면으로 받아 비교.' },
    재성: { line: '연봉과 성과가 움직이는 해예요.', avoid: '연봉 인상만 믿고 지출을 늘리지 마세요', instead: '오른 만큼 떼어 두고 성과는 {good}에 숫자로 정리하세요. 돈이 움직이는 해는 기록이 다음 협상이에요.', recap: '오른 만큼 떼어 두고 성과는 숫자로.' },
    관성: { line: '평가·승진·직책이 걸리는 해예요.', avoid: '평가 시즌에 상사와 정면으로 부딪히지 마세요', instead: '평가 전에 내 성과를 한 장으로 {good}에 먼저 보내세요. 평가의 해는 자료가 말해요.', recap: '평가 전 성과 한 장을 {good}에 먼저.' },
    인성: { line: '배우고 준비하기 좋은 해라 이직은 늦어요.', avoid: '준비만 하며 지원을 다음 해로 미루지 마세요', instead: '지원 날짜를 {good}로 박아 두세요. 준비의 해도 한 번은 내 봐야 흐름이 바뀌어요.', recap: '지원 날짜는 {good}로 박아 두기.' },
    clash: { line: '자리와 환경이 크게 바뀌는 해예요.', avoid: '이직과 이사를 같은 분기에 하지 마세요', instead: '바꿀 일은 {good}부터 한 분기에 하나씩 순서를 정하세요. 변동이 큰 해는 순서가 전부예요.', recap: '바꿀 일은 {good}부터 하나씩.' },
  };
  const WORK_REL = {
    비겁: { body: '같은 눈높이 동료와는 좋고 상사와는 주도권 다툼이 나요.', avoid: '상사와 공개 석상에서 맞서지 마세요', instead: '의견은 일대일로, 결정은 상사 이름으로 내세요. 같은 힘끼리는 역할이 나뉠 때 오래가요.' },
    식상: { body: '내가 아이디어를 내고 받쳐 주는 상사와 잘 맞아요.', avoid: '아이디어를 회의에서 다 쏟지 마세요', instead: '아이디어는 한 장으로 적어 미리 보내세요. 표현형은 문서로 말할 때 신뢰가 쌓여요.' },
    재성: { body: '성과를 숫자로 보는 상사와 잘 맞아요.', avoid: '성과 없이 보상부터 요구하지 마세요', instead: '숫자를 먼저 만들고 보상을 말하세요. 성과형은 순서가 맞을 때 몸값이 올라요.' },
    관성: { body: '규칙이 분명한 상사 밑에서 안정적이에요.', avoid: '규칙 없는 상사 밑에서 혼자 기준을 세우려 하지 마세요', instead: '기준을 문서로 제안하고 승인받으세요. 틀을 좋아하는 사람은 틀을 만드는 쪽이 돼야 편해요.' },
    인성: { body: '가르쳐 주는 상사와 잘 맞고 방임형과는 흔들려요.', avoid: '배울 게 없다고 바로 떠나지 마세요', instead: '배울 사람을 조직 밖에서 한 명 두세요. 배움형은 멘토가 있으면 어디서든 버텨요.' },
  };
  L.hunter = {
    weakAvoid: { 비겁: '내 몫 없는 조건으로 입사하지 마세요', 식상: '자료 없이 평가 자리에 가지 마세요', 재성: '연봉 숫자 확인 없이 옮기지 마세요', 관성: '기한 없는 말로 일을 받지 마세요', 인성: '지친 상태에서 사직서를 내지 마세요' },
    weakInstead: { 비겁: '입사 전에 희망 연봉과 역할을 숫자로 적어 먼저 보내세요. 거절이 어렵다면 검토 후 내일 답하겠다는 말로 하루를 버세요.', 식상: '평가 전날 숫자 하나와 사례 하나를 한 장으로 만들어 가세요. 말이 어렵다면 문서로, 문서도 어렵다면 그림 한 장으로 꺼내세요.', 재성: '제안서의 연봉·성과급·근무 조건을 표로 나란히 비교한 뒤 답하세요. 숫자를 세어 본 사람이 시장에서 제값을 받아요.', 관성: '일을 받을 때 기한과 범위를 메일 한 통으로 반드시 남기세요. 규칙 하나를 4주만 지켜도 다음 평가가 달라져요.', 인성: '사직 결정은 쉰 다음 날 낮에, 믿는 한 사람에게 말한 뒤 하세요. 지친 날의 결정은 경력에 가장 비싸게 남는 결정이에요.' },
    weakRecap: { 비겁: '입사 전 연봉·역할 숫자로 먼저.', 식상: '평가 전날 숫자 하나, 사례 하나.', 재성: '제안은 표로 비교한 뒤 답하기.', 관성: '일 받을 때 기한·범위 메일로.', 인성: '사직은 쉰 다음 날 낮에.' },
    year: WORK_YEAR,
    monthDomain: { 월주: '사직서·이직 결정', 일주: '근무지 이동·이사', 년주: '가족 사업 합류', 시주: '팀 재편·후배 인사' }, monthFallback: '사직서 제출',
    plan: { 비겁: ['1주: 희망 연봉을 숫자로 적어요', '2주: 내 성과 세 줄을 상사에게 보내요', '3주: 거절할 업무 하나를 순서로 제안해요', '4주: 혼자 끝낸 일 하나를 기록해요'], 식상: ['1주: 성과 숫자 하나를 찾아 적어요', '2주: 사례 하나를 한 장으로 만들어요', '3주: 포트폴리오 항목 하나를 공개해요', '4주: 이력서 한 줄을 숫자로 고쳐요'], 재성: ['1주: 시장 연봉을 세 곳에서 확인해요', '2주: 내 성과를 금액으로 환산해요', '3주: 제안 비교표를 만들어요', '4주: 협상 최저선을 적어요'], 관성: ['1주: 지킬 업무 규칙 하나를 정해요', '2주: 애매한 업무에 기한을 통보해요', '3주: 책임이 몰리면 순서를 제안해요', '4주: 규칙을 지킨 4주를 기록해요'], 인성: ['1주: 결정 없는 날 하루를 비워요', '2주: 이직 고민을 멘토에게 말해요', '3주: 배울 것을 사람에게 물어요', '4주: 지원 날짜를 달력에 박아요'] },
    planTitle: g => `${g}으로 몸값을 올리는 4주`,
    entries: [{ id: 'who', label: '시장이 보는 나' }, { id: 'months', label: '분기별 적기' }, { id: 'work', label: '적합 직무' }],
    sections(c) {
      const { r, j, G, lvG, strong, weak, pickG, rx, dm, cur, nextD, nextY, nowY, sy, cal, push, caution, bestM, goodM, dayG, viz, top, POS_KO, CAREER, CAREER_S, WORK_STYLE } = c;
      const S = [];
      S.push({ id: 'who', title: '시장이 보는 당신의 유형', conclusion: WORK_TYPE[top[0]].replace('로 보여요.', ''), body: [WORK_TYPE[top[0]], dm.work, dm.body[0], `전체로는 ${c.SP[rx.label]}이라 ${rx.label === '신강' ? '권한이 큰 자리가 맞아요' : rx.label === '신약' ? '받쳐 주는 팀이 있어야 해요' : '어느 조직이든 맞출 수 있어요'}.`], avoid: dm.avoid, instead: dm.instead, viz: { type: 'identity' } });
      const leak = ['관성', '식상', '비겁'].find(k => lvG[k] === '부족') || 'none';
      S.push({ id: 'power', title: '이력서에 없는 자원 배분', conclusion: `${j(G[strong], '이')} 가장 크고 ${j(G[weak], '이')} 가장 작아요`, body: [WORK_LEVEL.관성[lvG['관성']], WORK_LEVEL.식상[lvG['식상']], WORK_LEVEL.비겁[lvG['비겁']], `그래서 처방은 ${c.rxPhrase}이에요.`], avoid: WORK_LEAK[leak].avoid, instead: WORK_LEAK[leak].instead, viz: viz.bars });
      const wd = WORK_DECADE[c.curG], wdn = nextD ? WORK_DECADE[nextD.tenGod.group] : null;
      S.push({ id: 'decade', title: '커리어 10년 계절', conclusion: cur ? `${cur.fromAge}~${cur.toAge}세는 ${wd.body[0].replace('이에요.', '')}` : '첫 계절을 기다리는 중', body: [cur ? `지금은 ${cur.fromAge}~${cur.toAge}세예요.` : '아직 첫 10년 계절 전이에요.'].concat(wd.body, [nextD ? (wdn === wd ? `${nextD.fromAge}세부터도 같은 흐름이 이어져요.` : `${nextD.fromAge}세부터는 ${wdn.body[0]}`) : '', c.edge ? '지금은 계절이 바뀌는 경계라 이직은 첫해를 지나 보고 해요.' : '']).filter(Boolean).slice(0, 5), avoid: `${cur ? `${cur.fromAge}~${cur.toAge}세 사이에는` : '첫 계절이 오기 전에는'} ${wd.avoid}`, instead: wd.instead, viz: viz.timeline });
      const yp = WORK_YEAR[c.yPair.key] || WORK_YEAR[c.curG]; const y0 = r.seun[0];
      S.push({ id: 'year', title: `${nowY}년과 ${nextY}년 이직 흐름`, conclusion: `${nextY}년은 ${(c.yClash ? WORK_YEAR.clash : WORK_YEAR[sy.branchTenGod.group]).line.replace('예요.', '')}`, body: [`${nowY}년은 ${WORK_YEAR[y0.branchTenGod.group].line}`, `${nextY}년은 ${(c.yClash ? WORK_YEAR.clash : WORK_YEAR[sy.branchTenGod.group]).line}`, c.yClash ? `내 ${POS_KO[c.yClashPillar]} 자리와 부딪혀 자리가 흔들리기 쉬워요.` : `앞머리엔 ${G[sy.tenGod.group]}, 뒤로 갈수록 ${G[sy.branchTenGod.group]} 주제예요.`, (sy.tenGod.group === '관성' || sy.branchTenGod.group === '관성') ? '평가와 직책이 걸리는 해라 자료가 말해요.' : '움직인다면 기록을 먼저 만들어 두는 해예요.'], avoid: `${c.yPair.time}에는 ${yp.avoid}`, instead: yp.instead.replace(/\{good\}/g, goodM), viz: viz.years });
      const q = [1, 2, 3, 4].map(n => ({ n, score: cal.filter(x => Math.ceil(x.solarMonth / 3) === n && x.yearLabel === nextY).reduce((a, x) => a + (x.grade === '추진' ? 1 : x.grade === '주의' ? -3 : 0), 0) })); const best = q.slice().sort((a, b) => b.score - a.score)[0], worst = q.slice().sort((a, b) => a.score - b.score)[0];
      S.push({ id: 'months', title: `${nextY}년 분기별 적기`, conclusion: `적기 ${best.n}분기, 비적기 ${worst.n}분기`, body: [`${nextY}년 이직 적기는 ${best.n}분기, 비적기는 ${worst.n}분기예요.`, `면접은 ${c.mlist(push.slice(0, 3)) || '보통 달'}에 잡는 게 좋아요.`, caution.length ? `사직서는 ${j(c.mlist(caution), '을')} 피해서 내세요.` : '정면으로 부딪히는 달은 없어요.', '달의 경계는 1일이 아니라 괄호 안 날짜예요.'], avoid: `${nextY}년 ${worst.n}분기에는 사직서를 내지 마세요`, instead: `사직서는 ${best.n}분기에, 면접은 ${bestM.label}에 잡으세요. 적기에 움직이면 같은 경력도 더 좋은 조건으로 팔려요.`, viz: viz.calendar });
      const wr = WORK_REL[dayG];
      S.push({ id: 'rel', title: '상사·동료 궁합', conclusion: wr.body.replace(/\.$/, ''), body: [wr.body, dm.rel.replace(/사랑|연인/g, '동료'), lvG['비겁'] === '과다' ? '동업자나 공동 창업자와는 몫 문제가 먼저 와요.' : '팀에서는 역할이 분명할 때 가장 편해요.'], avoid: wr.avoid, instead: wr.instead });
      const rec = c.rec; const forb = c.forbidden;
      S.push({ id: 'work', title: '적합 직무와 피할 환경', conclusion: `맞는 일은 ${CAREER[top[0]]}`, body: [`맞는 일은 ${j(CAREER[top[0]], '이에요')}.`, WORK_STYLE[strong], rec[1] && rec[1] !== top[0] ? `두 번째로는 ${CAREER[rec[1]]} 쪽이에요.` : '', c.weakInAllowed ? `${j(CAREER_S[weak], '은')} 지금 힘들어도 길게 보면 채울 방향이에요.` : `길게 보면 ${CAREER_S[pickG]} 쪽이 타고난 판을 보완해요.`].filter(Boolean), avoid: c.workPair.avoid, instead: c.workPair.instead });
      return S;
    },
  };

  // ═══════════════ 복순 할머니 · 한 해·가족·건강 (6·7장만 교체) ═══════════════
  const FAMILY_PAIR = {
    비겁: { avoid: '식구 일로 다툰 날 누가 옳은지 끝까지 가리지 마세요', instead: '역할을 하나씩 나눠 두세요. 같은 힘끼리는 자리가 나뉠 때 집이 조용해져요.' },
    식상: { avoid: '식구를 챙기느라 내 끼니와 잠을 거르지 마세요', instead: '내가 먼저 챙기는 날을 주에 하루 두세요. 베푸는 사람이 쉬어야 집이 돌아가요.' },
    재성: { avoid: '집안 돈 이야기를 혼자 끌어안지 마세요', instead: '한 달에 한 번 식구와 돈 이야기를 식탁에 올리세요. 나누면 반이 돼요.' },
    관성: { avoid: '식구에게 내 기준을 규칙처럼 들이대지 마세요', instead: '바라는 것 하나만 부탁하세요. 규칙이 줄면 식구가 먼저 다가와요.' },
    인성: { avoid: '받는 데 익숙해져 어른의 피로를 넘기지 마세요', instead: '한 달에 한 번은 내가 어른을 챙기는 날을 정하세요. 품에 안긴 사람이 품어 줄 때 집이 깊어져요.' },
  };
  const HEALTH_PAIR = {
    木: { avoid: '눈과 어깨가 뻐근한 주에 밤샘 일정을 잡지 마세요', instead: '그 주엔 걷는 시간을 하루 이십 분 넣으세요. 자라는 기운은 움직여야 풀려요.' },
    火: { avoid: '잠이 줄어든 주에 큰 약속을 잡지 마세요', instead: '그 주엔 열 시 전에 불을 끄세요. 불 기운은 식히는 시간이 약이에요.' },
    土: { avoid: '입맛이 떨어진 주에 끼니를 건너뛰지 마세요', instead: '그 주엔 따뜻한 밥 한 끼를 시간 맞춰 드세요. 흙 기운은 규칙적인 끼니가 뿌리예요.' },
    金: { avoid: '목이 칼칼한 주에 찬 바람 쐬며 무리하지 마세요', instead: '그 주엔 따뜻한 물을 자주 마시고 일찍 들어오세요. 쇠 기운은 몸을 데울 때 단단해요.' },
    水: { avoid: '손발이 찬 주에 밤늦게 결정을 내리지 마세요', instead: '그 주엔 허리를 따뜻하게 하고 낮에 결정하세요. 물 기운은 데워질 때 맑아져요.' },
  };
  L.granny = {
    entries: [{ id: 'who', label: '나의 기질' }, { id: 'year', label: '올해 흐름' }, { id: 'rel', label: '가족과 몸' }],
    tail(c) {
      const { r, dayG, viz, REL, BRANCH_POS, BODY_SIGNAL, lvG, caution } = c; const e = r.dayMaster.element;
      const fam = { id: 'rel', title: '가족 자리', conclusion: `집안 자리로 보면 ${BRANCH_POS[r.year.branch][0].replace(/어릴 적 /, '')}`, body: [`${BRANCH_POS[r.year.branch][0]}.`, REL[dayG].body, r.hour ? `${BRANCH_POS[r.hour.branch][3]}.` : '말년 자리는 시각을 알아야 보여요.'], avoid: FAMILY_PAIR[dayG].avoid, instead: FAMILY_PAIR[dayG].instead };
      const keep = { id: 'work', title: '올해 지킬 것: 몸과 돈', conclusion: BODY_SIGNAL[e].replace(/\.$/, ''), body: [BODY_SIGNAL[e], MONEY_LEVEL.재성[lvG['재성']], caution.length ? `멈출 달 ${c.mlist(caution)}엔 몸도 돈도 쉬게 두세요.` : '정면으로 부딪히는 달이 없어 평소 리듬이면 돼요.'], avoid: HEALTH_PAIR[e].avoid, instead: HEALTH_PAIR[e].instead };
      return [fam, keep];
    },
  };

  return { LENS: L, MONEY_LEVEL };
});
