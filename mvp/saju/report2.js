/*
 * report2.js — 3층(L1 결론 · L2 쉬운 설명 · L3 근거) 리포트 생성기 + 자동 검사기(lint)
 *
 * 설계 원리
 *  - 모든 처방은 판정값(신강·신약·중화 → 방향 fill/drain/season)을 입력받아 생성한다. 판정과 무관한 고정 처방 문장을 두지 않는다.
 *  - 피할 것 3개는 원국(natal) · 올해 세운(seun) · 월운 주의 달(month) 세 출처에서 각 1개. 형식 [시기]+[행동]+[대상].
 *  - 대신은 피할 것과 1:1, 글자 수 2배 이상, 셋 중 하나는 "비어 있는(방향상 채울) 기운"을 채우는 행동.
 *  - L1·L2는 쉬운 말만(한자·분수·십신 원어·절기월 금지, 한 문장 40자, 한 단락 3문장, 해요체). 전문용어·한자는 L3와 용어집에서만.
 *  - 캐릭터 색깔: 본문 규칙은 같고, 캐릭터는 (1) 초점 섹션 확장 (2) 섹션마다 캐릭터 한마디(인용) (3) 제목 패턴으로 드러난다.
 *  - lint(rep)가 합격 기준 전부를 검사한다. tools/report_lint.cjs가 수백 명식에 돌린다.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./saju.js'), require('./report.js'), require('./mbti.js'), require('./report-lenses.js'));
  else root.SajuReport2 = factory(root.Saju, root.SajuReport, root.SajuMBTI, root.SajuLenses);
})(typeof self !== 'undefined' ? self : this, function (S, R, M, LZS) {
  'use strict';

  // ───── 조사 ─────
  const NUM_B = { 0: 1, 1: 1, 2: 0, 3: 1, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1, 9: 0 }, NUM_R = { 1: 1, 7: 1, 8: 1 };
  const LAT_B = { L: 1, M: 1, N: 1, R: 1 };
  function lastSound(w) {
    const s = String(w).replace(/[)\]'"”’\s]+$/, ''); const ch = s[s.length - 1]; if (!ch) return { b: false, r: false };
    const c = ch.charCodeAt(0);
    if (c >= 0xac00 && c <= 0xd7a3) { const t = (c - 0xac00) % 28; return { b: t !== 0, r: t === 8 }; }
    if (/[0-9]/.test(ch)) return { b: !!NUM_B[+ch], r: !!NUM_R[+ch] };
    if (/[A-Za-z]/.test(ch)) { const u = ch.toUpperCase(); return { b: !!LAT_B[u], r: u === 'L' }; }
    return { b: false, r: false };
  }
  const JOSA = { 이: ['이', '가'], 은: ['은', '는'], 을: ['을', '를'], 과: ['과', '와'], 아: ['아', '야'], 이라: ['이라', '라'], 이에요: ['이에요', '예요'], 으로: ['으로', '로'] };
  function j(w, p) { const ls = lastSound(w); if (p === '으로') return w + ((ls.b && !ls.r) ? '으로' : '로'); const [B, N] = JOSA[p]; return w + (ls.b ? B : N); }
  const lastOf = s => { const m = String(s).match(/[가-힣](?=[^가-힣]*$)/); return m ? m[0] : ''; };

  // ───── 이름 규칙(한 개념 = 한 이름) ─────
  const G = { 비겁: '나 자신의 힘', 식상: '내보내는 힘', 재성: '손에 쥐는 힘', 관성: '나를 누르는 힘', 인성: '쉬고 배우는 힘' };
  const EP = { 木: '나무 기운', 火: '불 기운', 土: '흙 기운', 金: '쇠 기운', 水: '물 기운' };
  const ADJ = { 부족: '비어 있는', 적정: '알맞은', 과다: '넘치는' };
  const LVV = { 부족: '비어 있어요', 적정: '알맞아요', 과다: '넘쳐요' };
  const SP = { 신강: '내 힘이 센 편', 신약: '내 힘보다 짐이 많은 편', 중화: '힘이 중간인 편' };
  const POS_KO = { 년주: '집안', 월주: '일터', 일주: '가장 가까운 사람', 시주: '아이와 말년' };
  const POS_SHORT = { 년주: '뿌리', 월주: '무대', 일주: '나와 짝', 시주: '열매' };
  const SEASON_WORD = { 봄: '봄날', 여름: '한여름', 가을: '가을', 겨울: '겨울밤' };
  const SEASON_SENT = { 봄: '봄에 태어나 자라는 기운이 넉넉해요.', 여름: '여름에 태어나 열기가 많은 편이에요.', 가을: '가을에 태어나 거두고 자르는 기운이 커요.', 겨울: '겨울에 태어나 차분하지만 몸이 쉽게 식어요.' };
  const SEASON_NEED = { 봄: '金', 여름: '水', 가을: '火', 겨울: '火' };
  const BODY_SIGNAL = { 木: '피로가 오면 눈과 어깨부터 뻐근해져요.', 火: '피로가 오면 잠과 가슴 두근거림부터 신호가 와요.', 土: '피로가 오면 소화와 입맛부터 달라져요.', 金: '피로가 오면 목과 피부, 숨부터 신호가 와요.', 水: '피로가 오면 허리와 손발 냉기부터 느껴져요.' };
  const STEM_MEAN = { 甲: '큰 나무', 乙: '풀과 덩굴', 丙: '태양', 丁: '등불', 戊: '큰 산', 己: '논밭', 庚: '원석과 도끼', 辛: '보석', 壬: '바다', 癸: '이슬비' };
  const BRANCH_MEAN = { 子: '한밤의 물', 丑: '언 땅', 寅: '새벽 숲', 卯: '봄 들판', 辰: '봄비 머금은 땅', 巳: '초여름 열기', 午: '한낮의 불', 未: '늦여름 마른 땅', 申: '초가을 쇠', 酉: '가을 정점의 쇠', 戌: '늦가을 마른 흙', 亥: '초겨울 바다' };
  const BRANCH_YEAR = { 子: '한밤의 물처럼 궁리가 깊어지는 해', 丑: '언 땅의 소처럼 느려도 끝까지 가는 해', 寅: '새벽 숲의 호랑이처럼 시작이 많은 해', 卯: '봄 들판의 토끼처럼 움직임이 잦은 해', 辰: '봄비 머금은 땅처럼 판이 커지는 해', 巳: '초여름 뱀처럼 치밀하게 파고드는 해', 午: '한낮의 말처럼 속도가 붙는 해', 未: '늦여름 마른 땅처럼 버티는 힘을 묻는 해', 申: '초가을 원숭이처럼 재주가 빛나는 해', 酉: '가을 닭처럼 정리와 결산이 오는 해', 戌: '늦가을 개처럼 지키는 것이 중요한 해', 亥: '초겨울 바다처럼 넉넉히 받아들이는 해' };
  // 글자 × 자리(년=집안·첫인상, 월=일터, 일=가까운 사람, 시=말년·결과)
  const BRANCH_POS = {
    子: ['어릴 적 집안에 밤늦도록 궁리하는 분위기가 있었어요', '일터에서는 남들이 못 본 길을 조용히 찾아내요', '가까운 사람과는 말없이도 통하는 깊이가 있어요', '나이 들수록 혼자 궁리하는 시간이 보람이 돼요'],
    丑: ['어릴 적 묵묵히 버티는 법을 먼저 배웠어요', '일터에서는 느려도 끝까지 가는 사람으로 통해요', '가까운 사람에게는 말보다 꾸준함으로 믿음을 줘요', '나이 들수록 쌓아 둔 것이 힘이 돼요'],
    寅: ['어릴 적부터 먼저 나서는 아이였어요', '일터에서는 새 일을 여는 역할이 자주 와요', '가까운 사람과는 서로 밀어주는 동료 같은 관계예요', '나이 들수록 새로 시작할 용기가 남아 있어요'],
    卯: ['어릴 적 눈치가 빠르고 부드러운 아이였어요', '일터에서는 분위기를 읽고 조율하는 역할이 맞아요', '가까운 사람에게 다정하지만 상처도 쉽게 받아요', '나이 들수록 사람 곁에서 보람을 찾아요'],
    辰: ['어릴 적 집안에 변화와 포부가 많았어요', '일터에서는 판을 키우는 자리에 끌려요', '가까운 사람과는 큰 꿈을 함께 꾸는 관계예요', '나이 들수록 품이 넓어져요'],
    巳: ['어릴 적부터 관찰력이 남달랐어요', '일터에서는 치밀하게 파고드는 전문가 기질이 나와요', '가까운 사람을 세심하게 살피고 오래 기억해요', '나이 들수록 깊이가 무기가 돼요'],
    午: ['어릴 적 활발하고 표현이 많은 아이였어요', '일터에서는 속도와 추진으로 눈에 띄어요', '가까운 사람에게 뜨겁고 솔직해요', '나이 들수록 열정을 쓸 곳이 필요해요'],
    未: ['어릴 적 온화하지만 고집이 있는 아이였어요', '일터에서는 끝까지 버티는 사람으로 신뢰를 얻어요', '가까운 사람과는 느리지만 오래 가는 관계예요', '나이 들수록 지키는 것이 많아져요'],
    申: ['어릴 적부터 재주가 많고 손이 빨랐어요', '일터에서는 기민하게 길을 찾는 해결사예요', '가까운 사람과는 유쾌하지만 금세 식기도 해요', '나이 들수록 재주를 나누는 일이 어울려요'],
    酉: ['어릴 적부터 깔끔하고 기준이 분명했어요', '일터에서는 정확함으로 인정받아요', '가까운 사람에게 까다롭지만 한결같아요', '나이 들수록 정리하고 가르치는 일이 맞아요'],
    戌: ['어릴 적 집안에서 지키는 역할을 맡았어요', '일터에서는 충직하게 자리를 지키는 사람이에요', '가까운 사람을 끝까지 지키려 해요', '나이 들수록 든든한 어른이 돼요'],
    亥: ['어릴 적 넉넉하고 속 깊은 아이였어요', '일터에서는 큰 그림을 품고 받아들이는 편이에요', '가까운 사람을 넓게 품지만 속은 잘 안 보여요', '나이 들수록 여유가 커져요'],
  };
  const POS_IDX = { 년주: 0, 월주: 1, 일주: 2, 시주: 3 };
  const ROLE_DESC = { 년주: '집안 분위기와 어린 시절, 사회가 나를 처음 보는 인상의 자리예요.', 월주: '성장기 환경과 사회생활 무대예요. 네 기둥 중 힘이 가장 세요.', 일주: '윗글자는 나 자신, 아랫글자는 가장 가까운 사람의 자리예요.', 시주: '아이와 후배, 말년, 내가 남기는 결과물의 자리예요.' };

  // ───── 일간(나를 뜻하는 글자) ─────
  const DM = {
    甲: { noun: '큰 나무', line: '한 번 정한 방향으로 곧게 자라지만 바꾸는 데 큰 결심이 드는 나무', body: ['앞장서고 시작하는 힘이 타고났어요.', '명분이 분명할 때 가장 강해요.', '굽히기보다 부러지는 쪽을 고르는 자존심이 있어요.'], avoid: '방향을 바꿔야 할 때 혼자 버티며 조언을 끊지 마세요', instead: '방향 전환이 필요하면 믿는 사람 두 명에게 먼저 물어보세요. 큰 나무는 혼자 꺾이지만, 곁에 숲이 있으면 바람을 나눠 맞아요.', work: '조직을 세우고 큰 방향을 잡는 일에 맞아요.', rel: '지켜 주는 쪽이 편하고, 상대가 제 방식으로 서려 하면 서운해해요.', childTip: '먼저 나서게 두고, 넘어진 뒤에만 손을 내밀어 주세요. 큰 나무는 스스로 선 기억으로 자라요.' },
    乙: { noun: '덩굴', line: '돌아가고 맞추며 결국 제 자리를 만드는 질긴 풀', body: ['정면으로 부딪치지 않고 돌아가요.', '사람 사이를 잇고 막힌 곳을 뚫는 재주가 있어요.', '기댈 곳이 없으면 불안해지는 편이에요.'], avoid: '서운함을 쌓아 두다가 한 번에 관계를 끊지 마세요', instead: '서운한 일이 생긴 그 주 안에 한 문장으로 말해 보세요. 덩굴은 작은 가지를 자주 다듬을수록 오래 살고, 관계도 같아요.', work: '기획·조율·영업·디자인처럼 사람과 환경을 읽는 일에 맞아요.', rel: '맞춰 주는 사랑을 해서 오래 가지만, 끝은 갑작스러워요.', childTip: '기댈 어른 한 명이 분명하면 어디서든 자라요. 혼자 하라고 밀기보다 곁에서 지켜봐 주세요.' },
    丙: { noun: '태양', line: '모두를 환하게 비추지만 관심이 끊기면 빨리 식는 빛', body: ['숨기지 못하고 가리지 않아요.', '사람을 모으고 분위기를 바꾸는 힘이 커요.', '기복이 한낮과 한밤처럼 큰 편이에요.'], avoid: '인정받지 못한 날 말과 약속을 부풀리지 마세요', instead: '그날은 한 사람에게만 오늘 한 일을 말해 보세요. 태양은 넓게 비출 때보다 한 곳을 데울 때 더 오래 남아요.', work: '무대·발표·교육·영업처럼 앞에 서는 일에 맞아요.', rel: '뜨겁게 시작하고, 상대의 무심함을 가장 못 견뎌요.', childTip: '칭찬은 여럿 앞에서, 지적은 둘만 있을 때 해 주세요. 태양 같은 아이는 무대가 있어야 빛나요.' },
    丁: { noun: '등불', line: '가까운 것을 깊게 비추지만 연료가 끊기면 금방 꺼지는 불', body: ['한 사람, 한 주제에 오래 머물러요.', '조용하지만 속은 집요하게 타는 편이에요.', '섬세해서 작은 변화를 먼저 알아채요.'], avoid: '지친 상태에서 예민함을 혼자 삭이며 밤을 넘기지 마세요', instead: '지친 날은 자기 전에 마음에 걸린 일 세 줄만 적어 두세요. 등불은 연료만 있으면 오래 타니, 쉼이 곧 불씨예요.', work: '연구·분석·상담·전문 기술처럼 소수와 깊게 일하는 구조에 맞아요.', rel: '헌신형이라 챙기지만, 같은 섬세함이 돌아오지 않으면 혼자 식어요.', childTip: '한 가지에 오래 빠져 있을 때 끊지 말고 기다려 주세요. 등불 같은 아이는 깊이에서 자신감을 얻어요.' },
    戊: { noun: '큰 산', line: '쉽게 움직이지 않아 모두가 기대지만 떠날 때를 놓치는 산', body: ['말보다 존재로 사람을 안심시켜요.', '위기에서 당황하지 않는 중심이 있어요.', '변화를 미루고 속으로 쌓아 두는 편이에요.'], avoid: '답답함을 말하지 않은 채 몸으로 앓으며 버티지 마세요', instead: '한 달에 한 번, 바꾸고 싶은 것 하나를 말로 꺼내 보세요. 산도 계절마다 옷을 갈아입어요. 작은 변화가 큰 붕괴를 막아요.', work: '운영·관리·부동산·중재처럼 믿고 맡기는 역할에 맞아요.', rel: '행동으로 사랑해서 표현이 적다는 오해를 받아요.', childTip: '느리다고 재촉하지 말고 역할을 하나 맡겨 주세요. 산 같은 아이는 책임을 받을 때 커져요.' },
    己: { noun: '논밭', line: '무엇이든 받아 키워 내지만 제 밭은 묵히기 쉬운 땅', body: ['실속과 쓸모를 먼저 봐요.', '남이 놓친 것을 조용히 수습하는 사람이에요.', '걱정이 많고 자기 탓을 자주 해요.'], avoid: '남의 일을 떠안느라 내 일정을 먼저 지우지 마세요', instead: '일주일에 한 칸은 내 밭을 가는 시간으로 먼저 적어 두세요. 남을 키우는 땅일수록 제 양분부터 채워야 해요.', work: '교육·보육·회계·운영 지원처럼 뒤에서 판을 굴리는 일에 맞아요.', rel: '챙겨 주는 사랑을 하고, 받을 때는 어색해해요.', childTip: '걱정이 많은 아이라 결과보다 과정을 자주 칭찬해 주세요. 논밭 같은 아이는 안심할 때 가장 많이 자라요.' },
    庚: { noun: '도끼', line: '복잡한 것을 단번에 자르지만 날이 서면 곁을 베는 쇠', body: ['돌려 말하지 못하고 틀린 것을 못 참아요.', '결단과 추진이 빨라요.', '의리가 깊어 한 번 맡은 사람은 끝까지 지켜요.'], avoid: '화가 난 자리에서 바로 관계나 계약을 자르지 마세요', instead: '자르고 싶은 날은 하루를 넘기고 다음 날 아침에 결정하세요. 도끼는 숫돌에서 쉬어야 오래 쓰고, 결단도 그래요.', work: '법·의료·엔지니어링처럼 규칙이 분명한 환경에 맞아요.', rel: '선이 분명하고, 신뢰가 깨지면 돌아보지 않아요.', childTip: '규칙은 적게, 대신 분명하게 정해 주세요. 도끼 같은 아이는 기준이 또렷할 때 안정돼요.' },
    辛: { noun: '보석', line: '작은 흠도 놓치지 않지만 그 눈이 자신에게 가장 가혹한 보석', body: ['정밀함과 안목이 뛰어나요.', '말 한마디로 핵심을 찌르는 편이에요.', '인정받지 못하면 냉소가 늘어요.'], avoid: '실수한 날 스스로를 깎아내리는 말을 입 밖에 내지 마세요', instead: '실수한 날은 잘한 것 하나를 같이 적어 두세요. 보석은 흠을 보는 눈이 아니라 빛을 보는 눈으로 가치가 매겨져요.', work: '전문직·심사·디자인·분석처럼 기준을 세우는 일에 맞아요.', rel: '까다롭지만 마음을 열면 깊고, 무신경한 말을 오래 기억해요.', childTip: '완벽하지 않아도 된다는 말을 자주 들려주세요. 보석 같은 아이는 제 흠을 제일 먼저 봐요.' },
    壬: { noun: '바다', line: '모든 것을 받아들이며 흐르지만 방향이 없으면 범람하는 물', body: ['생각이 크고 틀에 갇히는 것을 싫어해요.', '흐름을 읽고 돌아가는 길을 찾아요.', '시작은 많은데 마무리가 약한 편이에요.'], avoid: '마무리 없이 새 일을 세 개 동시에 벌이지 마세요', instead: '새 일을 시작하기 전에 끝낼 일 하나를 먼저 닫으세요. 바다도 둑이 있어야 농사를 짓고, 큰 물일수록 길이 필요해요.', work: '기획·전략·무역·미디어처럼 움직이는 일에 맞아요.', rel: '자유로운 사랑을 하고, 떠난 사람을 오래 출렁이며 그리워해요.', childTip: '넓게 경험하게 두되 끝내는 습관 하나만 지켜 주세요. 바다 같은 아이는 둑 하나면 충분해요.' },
    癸: { noun: '이슬비', line: '소리 없이 스며들어 사람을 바꾸지만 혼자 오래 두면 안개가 되는 물', body: ['말하지 않은 것을 읽는 감각이 있어요.', '조용히 사람을 움직이는 영향력이 있어요.', '결정을 미루고 혼자 잠기는 편이에요.'], avoid: '혼자 있는 시간이 길어진 주에 큰 결정을 내리지 마세요', instead: '혼자 보낸 날이 사흘을 넘기면 한 사람과 짧게라도 만나세요. 이슬은 햇볕을 만나야 안개가 아니라 아침이 돼요.', work: '연구·상담·글·데이터처럼 뒤에서 흐름을 설계하는 일에 맞아요.', rel: '조용히 깊게 사랑하고, 상대가 알아채 주길 기다리다 지쳐요.', childTip: '속마음을 묻기보다 곁에서 같은 걸 해 주세요. 이슬 같은 아이는 조용한 동행에서 마음을 열어요.' },
  };

  // ───── 기운(십신 그룹)별 텍스트 ─────
  const WEAK_WHY = { 비겁: '내 몫을 먼저 말하는 힘이 작아 남에게 맞추다 손해를 봐요.', 식상: '속을 꺼내 보여 주는 통로가 작아 성과가 저평가돼요.', 재성: '돈과 결과를 손에 쥐는 감각이 작아 들어와도 남지 않아요.', 관성: '나를 묶는 틀이 작아 자유롭지만 흐트러지기 쉬워요.', 인성: '쉬고 기대는 통로가 작아 지쳐도 멈추지 못해요.' };
  const WEAK_AVOID = { 비겁: '내 몫 없는 계약서에 사인하지 마세요', 식상: '자료 없이 평가 자리에 가지 마세요', 재성: '가격 없이 일을 시작하지 마세요', 관성: '기한 없는 말로 일을 받지 마세요', 인성: '큰 결정을 혼자 밤에 내리지 마세요' };
  const WEAK_INSTEAD = {
    비겁: '사인 전에 내 몫 한 줄을 적어 상대에게 먼저 보내세요. 거절이 어렵다면 내일 답하겠다는 말로 하루를 버는 것부터 시작하면 돼요.',
    식상: '평가 전날 숫자 하나와 사례 하나를 한 장으로 적어 가세요. 말이 어렵다면 글로, 글이 어렵다면 그림 한 장으로 꺼내도 충분해요.',
    재성: '일을 받기 전에 가격과 범위를 한 줄로 적어 보내세요. 들어온 돈은 그날 두 갈래로 나누고 한쪽은 손대지 않는 계좌로 보내세요.',
    관성: '일을 받을 때 기한과 범위를 문자 한 통으로 남기세요. 규칙은 하나면 충분하고 그 하나를 4주 지키면 틀이 생겨요.',
    인성: '큰 결정은 낮에, 믿는 한 사람에게 먼저 말한 뒤 내리세요. 일주일에 하루는 결정 없는 날로 비워 두면 판단이 맑아져요.',
  };
  const WEAK_RECAP = { 비겁: '사인 전 내 몫 한 줄 먼저 보내기.', 식상: '평가 전날 숫자 하나, 사례 하나 적어 가기.', 재성: '일 받기 전 가격 한 줄, 들어온 돈은 두 갈래로.', 관성: '일 받을 때 기한과 범위를 문자로 남기기.', 인성: '큰 결정은 낮에, 한 사람에게 말한 뒤에.' };
  const FILL_ACTION = { 비겁: '이번 주 부탁 하나를 이유 없이 거절해 보세요.', 식상: '매일 세 줄, 그날의 생각을 밖으로 적어 보세요.', 재성: '들어오는 돈의 일부를 들어온 날 바로 떼어 두세요.', 관성: '지킬 규칙 하나를 정하고 4주만 지켜 보세요.', 인성: '이번 주 하루를 아무 결정도 하지 않는 날로 비워 두세요.' };
  const PRESC = {
    비겁: { fill: { avoid: '남의 부탁을 먼저 채우느라 내 일정을 지우지 마세요', instead: '하루 한 칸은 내 일로 먼저 채우세요. 힘이 약한 때일수록 내 몫을 먼저 지켜야 남을 도울 힘도 남아요.' }, drain: null },
    식상: { fill: { avoid: '하고 싶은 말을 삼키고 그냥 넘어가지 마세요', instead: '매일 세 줄이라도 밖으로 꺼내 보세요. 비어 있던 통로가 열리면 막힌 자리가 풀려요.' }, drain: { avoid: '속에 쌓인 말을 참다가 한 번에 터뜨리지 마세요', instead: '하루 한 번 만들거나 말하는 출력 시간을 두세요. 센 힘은 쓸 통로가 있어야 고집이 아니라 재주가 돼요.' } },
    재성: { fill: { avoid: '들어온 돈을 세어 보지 않은 채 쓰지 마세요', instead: '매주 한 번 들어온 돈과 나간 돈을 적어 보세요. 손에 쥐는 감각은 세어 보는 데서 자라요.' }, drain: { avoid: '벌 궁리 없이 힘만 쓰며 버티지 마세요', instead: '이번 달 손에 쥘 결과 하나를 숫자와 날짜로 정하세요. 센 힘은 결과로 바꿔야 몸이 가벼워져요.' } },
    관성: { fill: { avoid: '기한 없이 일을 끌고 가지 마세요', instead: '일마다 기한 하나를 먼저 정해 두세요. 틀이 생기면 자유도 더 넓어져요.' }, drain: { avoid: '마감과 기준 없이 혼자 밀어붙이지 마세요', instead: '외부 마감 하나와 봐 주는 사람 한 명을 두세요. 센 힘은 틀 안에서 더 멀리 가요.' } },
    인성: { fill: { avoid: '쉬는 날을 일정에서 가장 먼저 지우지 마세요', instead: '쉬는 날을 달력에 먼저 적고 약속처럼 지키세요. 짐이 많은 명식은 쉼이 곧 연료예요.' }, drain: null },
  };
  const DECADE = {
    비겁: { theme: '자립과 경쟁의 10년', body: ['혼자 결정하고 책임지는 일이 잘 풀려요.', '형제·친구·동료가 운의 변수가 돼요.'], avoid: '동업·보증·공동 명의를 하지 마세요', instead: '함께하고 싶다면 역할과 돈을 문서로 나눈 뒤 시작하세요. 몸이 자산인 시기라 건강 관리가 곧 재테크예요.' },
    식상: { theme: '표현과 새 시도의 10년', body: ['만들고 알리고 가르치는 일에 기회가 와요.', '규칙을 깨고 싶은 충동이 커져요.'], avoid: '조직과 부딪힌 날 바로 사직서를 내지 마세요', instead: '그 에너지는 내 결과물 하나를 만드는 데 쓰세요. 아이디어가 돈이 되는 시기라 꺼내 놓는 만큼 돌아와요.' },
    재성: { theme: '결과와 돈이 움직이는 10년', body: ['기회와 지출이 함께 커져요.', '구조를 먼저 만들어야 남아요.'], avoid: '들어오는 돈을 보고 고정 지출부터 늘리지 마세요', instead: '수입이 늘면 먼저 떼어 두는 비율부터 정하세요. 이 10년의 돈은 들어오는 양보다 남기는 구조가 결정해요.' },
    관성: { theme: '책임과 평가의 10년', body: ['직책·시험·계약처럼 나를 묶는 일이 걸려요.', '인정과 압박이 같이 와요.'], avoid: '거절 못 해 떠안은 책임을 하나 더 얹지 마세요', instead: '책임이 몰리면 거절 대신 순서를 제안하세요. 이 10년은 맡은 것을 끝까지 하는 사람이 자리를 얻어요.' },
    인성: { theme: '배움과 회복의 10년', body: ['공부·자격·문서에 유리해요.', '실행이 느려지고 안주하기 쉬워요.'], avoid: '준비만 하며 시작을 다음 해로 미루지 마세요', instead: '배운 것을 석 달 안에 한 번 써먹을 자리를 정하세요. 쉼이 깊어지는 시기라 충전된 만큼 움직이면 돼요.' },
  };
  const YEAR = {
    비겁: { avoid: '동업·공동 명의·보증은 하지 마세요', instead: '같이 하고 싶은 일은 {good}에 내 몫을 문서로 정한 뒤 시작하세요. 혼자 책임지는 일에서 성과가 나는 해라 경쟁자보다 내 기록을 보면 돼요.', recap: '같이 할 일은 {good}에 내 몫부터 문서로.' },
    식상: { avoid: '확인 없는 말로 계약을 뒤집지 마세요', instead: '새 시도는 {good}에 하나씩 시작하고 결과를 기록하세요. 말이 앞서는 해라 글로 남긴 약속만 지키면 재주가 돈으로 바뀌어요.', recap: '새 시도는 {good}에 하나씩, 약속은 글로.' },
    재성: { avoid: '들어온 돈을 그 주에 크게 쓰지 마세요', instead: '큰 지출은 {good}에 하루 묵힌 뒤 결정하세요. 기회가 많은 해라 먼저 떼어 두는 비율만 정하면 남는 해가 돼요.', recap: '큰 지출은 {good}에 하루 묵힌 뒤.' },
    관성: { avoid: '기한 없는 책임을 떠안지 마세요', instead: '책임을 맡을 땐 {good}에 범위와 기한을 먼저 정하세요. 평가가 붙는 해라 맡은 하나를 끝내면 자리가 와요.', recap: '책임은 {good}에 범위와 기한부터.' },
    인성: { avoid: '준비만 하며 시작을 미루지 마세요', instead: '시작은 {good}로 날짜를 박아 두세요. 배우기 좋은 해라 준비와 시작을 반반으로 나누면 돼요.', recap: '시작 날짜는 {good}로 미리 박아 두기.' },
    clash: { avoid: '이사·이직·결혼 중 둘을 같은 분기에 하지 마세요', instead: '바꿀 일이 여럿이면 한 분기에 하나씩, {good}부터 순서를 정하세요. 변동이 큰 해는 막는 해가 아니라 방향을 내가 정하는 해예요.', recap: '바꿀 일은 {good}부터 한 분기에 하나씩.' },
  };
  const MONTH_DOMAIN = { 일주: '결혼·이사 결정', 월주: '이직·이동 결정', 년주: '집안 돈거래·보증', 시주: '아이와 얽힌 큰 약속' };
  const MONTH_FALLBACK = { 관성: '기한 없는 새 책임', 재성: '큰 지출', 식상: '즉석 발표와 즉흥 계약', 비겁: '돈이 얽힌 부탁', 인성: '혼자 내리는 큰 결정' };
  const REL = {
    비겁: { body: '가장 가까운 자리에 나와 같은 힘이 앉아 친구 같은 관계예요.', avoid: '다툰 날 주도권을 가리려고 끝까지 밀어붙이지 마세요', instead: '서로의 영역을 하나씩 정해 두세요. 같은 힘끼리는 역할이 나뉠 때 오래 가고, 그 선이 곧 애정 표현이에요.' },
    식상: { body: '가장 가까운 자리에 내보내는 힘이 앉아 내가 베푸는 쪽이 돼요.', avoid: '서운한 마음을 말 대신 선물과 챙김으로만 메우지 마세요', instead: '챙긴 만큼 바라는 것을 한 문장으로 말해 보세요. 표현이 많은 관계라 말 한 줄이 선물보다 오래 남아요.' },
    재성: { body: '가장 가까운 자리에 손에 쥐는 힘이 앉아 현실이 함께 와요.', avoid: '관계 초반에 돈 이야기를 피한 채 큰 약속을 하지 마세요', instead: '돈과 현실 계획을 먼저 꺼내는 쪽이 되세요. 실속 있는 짝을 만나는 자리라 숫자를 나누는 대화가 신뢰를 만들어요.' },
    관성: { body: '가장 가까운 자리에 나를 누르는 힘이 앉아 안정이 와요.', avoid: '상대를 내 기준으로 고치려는 말을 반복하지 마세요', instead: '기준 대신 바라는 모습을 한 가지만 부탁하세요. 안정적인 관계라 규칙이 하나 줄 때마다 숨이 트여요.' },
    인성: { body: '가장 가까운 자리에 쉬고 배우는 힘이 앉아 쉼터가 돼요.', avoid: '받는 데 익숙해져 상대의 피로를 못 본 척 넘기지 마세요', instead: '한 달에 한 번은 내가 먼저 챙기는 날을 정하세요. 품어 주는 짝을 만나는 자리라 돌려주는 만큼 오래 가요.' },
  };
  const SPOUSE_N = ['짝 기운이 드러나 있지 않아 인연은 운이 들어올 때 움직여요.', '짝 기운이 하나 있어 한 사람에게 집중하는 구조예요.', '짝 기운이 둘 있어 비교하다 놓치기 쉬운 구조예요.', '짝 기운이 여럿이라 고르는 기준을 먼저 세워야 해요.'];
  const CAREER = { 비겁: '혼자 책임지는 전문직·프리랜스·1인 사업', 식상: '만들고 가르치는 제작·콘텐츠·교육·기술', 재성: '영업·유통·금융·사업처럼 결과가 숫자로 보이는 일', 관성: '공공·법·대기업·관리직처럼 규칙이 분명한 일', 인성: '연구·교육·의료·자격처럼 배움이 자산인 일' };
  const CAREER_S = { 비겁: '전문직·1인 사업', 식상: '제작·콘텐츠·교육', 재성: '영업·금융·사업', 관성: '공공·대기업·관리직', 인성: '연구·교육·자격 전문직' };
  const WORK_STYLE = { 비겁: '혼자 결정할 수 있는 자리에서 성과가 나요.', 식상: '내 결과물로 평가받는 자리에서 성과가 나요.', 재성: '숫자로 결과가 보이는 자리에서 성과가 나요.', 관성: '책임과 직책이 분명한 자리에서 성과가 나요.', 인성: '배우고 준비할 시간이 있는 자리에서 성과가 나요.' };
  const WORK_PAIR = {
    비겁: { avoid: '동료와 이기려는 논쟁으로 하루를 시작하지 마세요', instead: '내 기록과 어제의 나만 비교하세요. 혼자 책임지는 구조로 가면 경쟁 에너지가 성과로 바뀌어요.' },
    식상: { avoid: '새 프로젝트 세 개를 동시에 벌이지 마세요', instead: '한 분기에 하나만 끝까지 밀고 결과를 공개하세요. 재주가 많을수록 끝낸 것 하나가 이력서가 돼요.' },
    재성: { avoid: '몸을 갈아 넣어 버는 구조를 연장하지 마세요', instead: '시간당 단가를 올리는 일 하나를 올해 안에 만드세요. 돈 감각이 좋은 사람은 양이 아니라 단가로 가야 오래가요.' },
    관성: { avoid: '평가에 맞추려고 내 방식을 전부 깎지 마세요', instead: '지킬 규칙은 회사 것 하나, 내 것 하나로 두세요. 책임을 잘 지는 사람은 기준을 가질 때 더 신뢰받아요.' },
    인성: { avoid: '준비가 끝날 때까지 지원과 제안을 미루지 마세요', instead: '준비가 칠 할쯤 됐을 때 한 번 내 보세요. 배움이 자산인 사람은 써먹는 순간 가치가 생겨요.' },
  };
  const PLAN_4W = {
    비겁: ['1주: 받은 부탁 하나를 이유 없이 거절해요', '2주: 원하는 것 세 가지를 적고 한 사람에게 말해요', '3주: 돈이 얽힌 관계 하나를 문서로 정리해요', '4주: 혼자 결정하고 책임진 일 하나를 기록해요'],
    식상: ['1주: 매일 세 줄, 그날의 생각을 적어요', '2주: 내가 한 일을 숫자 하나와 함께 설명해요', '3주: 글·그림·음성 중 하나로 결과물을 공개해요', '4주: 성과를 한 장으로 정리해 보관해요'],
    재성: ['1주: 들어오는 돈의 일부를 자동 이체로 떼어 둬요', '2주: 일주일 지출을 적고 새는 항목 하나를 지워요', '3주: 내가 주는 것의 가격을 정하고 한 번 말해요', '4주: 한 달 수입과 지출을 한 장으로 봐요'],
    관성: ['1주: 지킬 규칙을 하나만 정해요', '2주: 애매하게 끌어온 약속 하나에 기한을 알려요', '3주: 책임이 몰리면 거절 대신 순서를 제안해요', '4주: 규칙 하나를 4주 지킨 기록을 남겨요'],
    인성: ['1주: 하루를 아무 결정도 하지 않는 날로 비워요', '2주: 큰 결정 하나를 믿는 사람에게 먼저 말해요', '3주: 배울 것을 검색 대신 사람에게 물어요', '4주: 쉰 날과 배운 것을 다음 달 일정에 고정해요'],
  };

  // ───── 아이(동자) 전용 ─────
  const C_WEAK_AVOID = { 비겁: '아이 대신 결정을 내려 주지 마세요', 식상: '아이 말을 끊고 대신 말하지 마세요', 재성: '용돈 쓴 뒤에 혼내기만 하지 마세요', 관성: '규칙을 기분 따라 바꾸지 마세요', 인성: '지친 아이에게 학원을 더 얹지 마세요' };
  const C_POWER = {
    비겁: { avoid: '아이 앞에서 어른이 모든 걸 정해 버리지 마세요', instead: '하루에 하나는 아이가 고르게 하고 결과를 함께 봐요. 자기 힘이 작은 아이는 고른 경험이 쌓일수록 단단해져요.' },
    식상: { avoid: '아이의 말과 그림을 평가부터 하지 마세요', instead: '무엇을 만들었는지 먼저 묻고 끝까지 들어 주세요. 내보내는 힘이 작은 아이는 들어 주는 사람 앞에서 열려요.' },
    재성: { avoid: '갖고 싶다는 말을 무조건 막지 마세요', instead: '갖고 싶은 것의 순서와 날짜를 같이 정해 주세요. 손에 쥐는 감각은 기다려서 얻어 본 경험에서 자라요.' },
    관성: { avoid: '규칙 없이 그때그때 혼내지 마세요', instead: '집 규칙 두 개를 벽에 붙이고 어른도 같이 지켜요. 틀이 작은 아이는 어른이 지키는 규칙을 보고 배워요.' },
    인성: { avoid: '쉬는 시간을 공부로 채우지 마세요', instead: '일주일에 반나절은 아무것도 안 하는 시간으로 비워요. 쉬는 힘이 작은 아이는 멈추는 법을 보여 줘야 배워요.' },
  };
  const C_DECADE = {
    비겁: { avoid: '형제·친구와 등수를 매기지 마세요', instead: '아이가 혼자 끝낸 일을 기록해 보여 주세요. 자립이 큰 계절이라 비교보다 기록이 아이를 키워요.' },
    식상: { avoid: '아이가 벌인 판을 어른이 정리해 버리지 마세요', instead: '벌인 것 중 하나를 끝까지 하게 도와주세요. 표현이 큰 계절이라 끝낸 경험이 재주를 재능으로 바꿔요.' },
    재성: { avoid: '보상으로만 아이를 움직이지 마세요', instead: '보상 대신 약속이 지켜지는 경험을 쌓아 주세요. 현실감이 큰 계절이라 신뢰가 가장 큰 보상이 돼요.' },
    관성: { avoid: '시험과 등수로 하루를 평가하지 마세요', instead: '역할 하나를 맡기고 끝까지 하게 지켜봐 주세요. 책임이 큰 계절이라 맡은 일이 아이를 세워요.' },
    인성: { avoid: '아이가 해 볼 일을 어른이 먼저 끝내 주지 마세요', instead: '아이가 끙끙대는 시간을 십 분은 그냥 두세요. 배움이 큰 계절이라 스스로 알아낸 것이 오래 남아요.' },
  };
  const CAREER_C = { 비겁: '혼자 끝내는 만들기', 식상: '그리기·말하기·공연', 재성: '장사 놀이·모으기', 관성: '규칙 있는 게임·단체 활동', 인성: '책·퀴즈·가르치기' };
  const C_WEAK_INSTEAD = {
    비겁: '작은 선택부터 아이가 고르게 하고 결과를 함께 보세요. 스스로 고른 경험이 쌓여야 나중에 제 몫을 말하는 아이가 돼요.',
    식상: '다 들을 때까지 기다렸다가 되물어 주세요. 꺼내는 통로가 작은 아이는 기다려 주는 어른 앞에서 말문이 트여요.',
    재성: '용돈을 받는 날 함께 세 칸으로 나눠 보세요. 세어 보는 습관이 생기면 쓰는 아이가 아니라 남기는 아이가 돼요.',
    관성: '규칙은 두 개만 정하고 어떤 날에도 같게 지켜 주세요. 틀이 작은 아이는 변하지 않는 규칙 하나에서 안정을 찾아요.',
    인성: '일주일에 하루는 아무 일정도 없는 날로 비워 주세요. 쉬는 통로가 작은 아이는 멈추는 법을 어른에게서 배워요.',
  };
  const C_WEAK_RECAP = { 비겁: '작은 선택은 아이가 고르게.', 식상: '다 들을 때까지 기다렸다 되묻기.', 재성: '용돈 받는 날 세 칸으로 같이 나누기.', 관성: '규칙은 두 개만, 어떤 날에도 같게.', 인성: '일주일에 하루는 일정 없는 날.' };
  const C_YEAR = {
    비겁: { avoid: '형제·친구와 비교하는 말을 하지 마세요', instead: '{good}에 아이 혼자 해내는 작은 과제를 하나 주세요. 경쟁이 큰 해라 남과 겨루기보다 어제의 자기와 겨루게 하면 돼요.', recap: '{good}에 혼자 해내는 과제 하나.' },
    식상: { avoid: '아이가 벌인 일을 어른 기준으로 치우지 마세요', instead: '{good}에 아이가 만든 것을 보여 줄 자리를 만들어 주세요. 표현이 커지는 해라 꺼내 놓을 무대가 있으면 재주가 자라요.', recap: '{good}에 아이 작품 보여 줄 자리 만들기.' },
    재성: { avoid: '갖고 싶다는 말마다 바로 사 주지 마세요', instead: '{good}에 아이와 사고 싶은 것의 순서를 정해 보세요. 욕심이 커지는 해라 고르는 연습이 평생 돈 감각이 돼요.', recap: '{good}에 갖고 싶은 것 순서 정하기.' },
    관성: { avoid: '시험 이야기로 하루를 시작하지 마세요', instead: '{good}에 아이가 맡을 역할 하나를 집에서 정해 주세요. 책임이 붙는 해라 작은 역할이 압박 대신 자부심이 돼요.', recap: '{good}에 집에서 맡을 역할 하나.' },
    인성: { avoid: '공부만 시키고 노는 시간을 줄이지 마세요', instead: '{good}에 아이가 배우고 싶다고 한 것 하나를 시작해 주세요. 배움이 열리는 해라 스스로 고른 공부가 제일 오래가요.', recap: '{good}에 아이가 고른 배움 하나 시작.' },
    clash: { avoid: '전학·이사·학원 교체를 한 학기에 몰지 마세요', instead: '바꿀 일이 여럿이면 {good}부터 한 학기에 하나씩 하세요. 변동이 큰 해는 아이가 적응할 틈을 주는 순서가 전부예요.', recap: '바꿀 일은 {good}부터 한 학기에 하나씩.' },
  };
  const C_MONTH_DOMAIN = { 일주: '전학·이사', 월주: '학원·선생님 교체', 년주: '가족 큰 지출', 시주: '아이에게 거는 큰 약속' };
  const C_REL = {
    비겁: { body: '친구와는 동등한 사이일 때 가장 편해요.', avoid: '친구 다툼에 어른이 먼저 편을 들지 마세요', instead: '무슨 일이 있었는지 아이 입으로 끝까지 말하게 하세요. 같은 힘끼리 부딪히는 아이는 제 편보다 들어 주는 사람이 필요해요.' },
    식상: { body: '친구에게 베푸는 쪽이라 인기가 많아요.', avoid: '친구를 챙기느라 제 것을 다 내주는 걸 칭찬만 하지 마세요', instead: '주고 싶은 마음을 칭찬하되 하나는 남기게 가르쳐 주세요. 베푸는 아이는 제 몫을 지킬 때 더 오래 사랑받아요.' },
    재성: { body: '친구 관계에서도 실속을 챙기는 편이에요.', avoid: '물건이나 돈으로 친구를 사귀는 걸 못 본 척하지 마세요', instead: '물건 없이 같이 한 놀이를 자주 떠올려 말해 주세요. 현실감이 빠른 아이는 관계의 값을 어른 말로 배워요.' },
    관성: { body: '규칙을 지키는 친구를 좋아하고 어른 말을 잘 들어요.', avoid: '착하다는 말로 아이의 불만을 눌러 두지 마세요', instead: '싫은 건 싫다고 말해도 된다고 자주 알려 주세요. 규칙을 잘 따르는 아이일수록 거절하는 연습이 필요해요.' },
    인성: { body: '어른 곁을 좋아하고 보호받는 데 익숙해요.', avoid: '아이가 해 볼 일을 어른이 먼저 해결해 주지 마세요', instead: '도와달라고 하기 전까지 한 번은 기다려 주세요. 품에서 자라는 아이는 기다려 주는 만큼 홀로 서는 힘이 생겨요.' },
  };
  const C_WORK = { 비겁: { body: '혼자 끝까지 해내는 과제에서 재능이 보여요.', avoid: '잘하는 걸 시키려고 못하는 과목으로 하루를 채우지 마세요', instead: '혼자 해낸 결과를 눈에 보이게 걸어 두세요. 자기 힘이 큰 아이는 성취의 기록이 다음 도전을 끌어요.' }, 식상: { body: '만들고 말하고 보여 주는 활동에서 재능이 보여요.', avoid: '만드는 시간을 공부 시간으로 바꿔 버리지 마세요', instead: '만든 것을 가족 앞에서 설명할 자리를 매주 주세요. 표현형 아이는 보여 줄 때 배운 것이 자리 잡아요.' }, 재성: { body: '눈에 보이는 결과와 보상이 있는 활동에서 재능이 보여요.', avoid: '보상 없이 결과만 요구하지 마세요', instead: '목표마다 작은 보상과 날짜를 함께 정해 주세요. 현실형 아이는 보상이 아니라 약속이 지켜지는 경험으로 자라요.' }, 관성: { body: '규칙이 분명한 활동에서 재능이 보여요.', avoid: '평가와 등수 이야기로 동기를 만들지 마세요', instead: '규칙 안에서 아이가 정할 수 있는 칸을 하나 주세요. 틀을 좋아하는 아이는 제 몫의 자율에서 책임을 배워요.' }, 인성: { body: '읽고 듣고 배우는 활동에서 재능이 보여요.', avoid: '배운 것을 바로 시험으로 확인하려 하지 마세요', instead: '배운 것을 어른에게 가르쳐 보게 하세요. 배움형 아이는 설명하는 순간 지식이 제 것이 돼요.' } };
  const C_FILL = { 비겁: '이번 주 작은 선택 하나는 끝까지 아이가 정하게 해 보세요.', 식상: '오늘 아이가 만든 것 하나를 끝까지 듣고 한 가지만 되물어 보세요.', 재성: '이번 주 용돈을 아이와 함께 쓰기·모으기·나누기 세 칸으로 나눠 보세요.', 관성: '집 규칙 두 개를 아이와 같이 정해 벽에 붙여 보세요.', 인성: '이번 주 하루를 학원도 숙제도 없는 날로 비워 보세요.' };
  const C_PLAN = {
    비겁: ['1주: 저녁 메뉴 하나를 아이가 고르게 해요', '2주: 아이가 고른 일의 결과를 함께 적어요', '3주: 형제·친구와 비교하는 말을 하루 세어 봐요', '4주: 혼자 해낸 일 하나를 벽에 붙여요'],
    식상: ['1주: 하루 한 번 끝까지 들은 뒤 되물어요', '2주: 아이가 만든 것 하나를 사진으로 남겨요', '3주: 가족 앞에서 설명할 자리를 만들어요', '4주: 한 달 동안 만든 것을 모아 보여 줘요'],
    재성: ['1주: 용돈을 세 칸으로 같이 나눠요', '2주: 갖고 싶은 것의 순서를 함께 정해요', '3주: 작은 목표와 보상 날짜를 적어요', '4주: 한 달 용돈 흐름을 같이 봐요'],
    관성: ['1주: 집 규칙을 두 개로 줄여 적어요', '2주: 아이가 맡을 역할 하나를 정해요', '3주: 싫다고 말한 날을 칭찬해요', '4주: 규칙을 지킨 날을 달력에 표시해요'],
    인성: ['1주: 일정 없는 날을 하루 비워요', '2주: 아이가 배우고 싶은 것을 물어요', '3주: 배운 것을 아이가 가르치게 해요', '4주: 쉰 날과 배운 것을 같이 돌아봐요'],
  };

  // ───── MBTI 쉬운 말 ─────
  const LETTER_KO = { E: '밖으로 쓰는 쪽', I: '안에서 채우는 쪽', S: '눈앞의 것을 믿는 쪽', N: '가능성을 먼저 보는 쪽', T: '기준으로 정하는 쪽', F: '온도로 정하는 쪽', J: '정해 두고 가는 쪽', P: '열어 두고 가는 쪽' };
  const AXIS_NAME = { EI: '에너지 축', SN: '정보 축', TF: '결정 축', JP: '생활 축' };
  const MOVE_PLAIN = { E: '내보내는 힘과 나 자신의 힘', I: '쉬고 배우는 힘', S: '손에 쥐는 힘과 나를 누르는 힘', N: '내보내는 힘과 쉬고 배우는 힘', T: '나를 누르는 힘과 손에 쥐는 힘', F: '내보내는 힘과 쉬고 배우는 힘', J: '나를 누르는 힘과 쉬고 배우는 힘', P: '내보내는 힘과 나 자신의 힘' };
  const MOVE_HOW = { E: '말하고 만들어 밖으로 내보내는 루틴을 하루 하나 두세요. 사람을 만나는 양이 아니라 꺼내는 양이 바깥 에너지를 만들어요.', I: '혼자 정리하는 시간을 달력에 먼저 적으세요. 그 시간은 낭비가 아니라 충전이에요.', S: '목표를 숫자와 날짜로 바꾸고 이번 달 손에 잡히는 결과 하나를 정하세요. 발이 땅에 닿을 때 힘이 나요.', N: '주 1회 큰 그림만 보는 시간을 두고 왜와 다음을 먼저 물으세요. 연결이 보이면 지루함이 사라져요.', T: '결정 전에 기준 세 개를 적고 감정은 결정 뒤에 따로 다루세요. 기준이 서면 결정이 빨라져요.', F: '결정 전에 관련된 사람의 온도를 한 번 물으세요. 감정은 약점이 아니라 자료예요.', J: '루틴 하나와 마감 하나만 고정하세요. 전부 계획하지 말고 뼈대만 세우면 돼요.', P: '계획에 비워 둔 칸을 넣고 마감만 밖에 걸어 두세요. 선택지를 하나 남기는 연습이 숨통을 틔워요.' };
  const MOVE_ALT = { E: '먼저 말 거는 자리를 주에 하나 만드세요. 꺼내는 연습이 쌓이면 바깥이 편해져요.', I: '하루 끝에 십 분만 혼자 정리하는 시간을 두세요. 안에서 채워야 밖에서 오래 버텨요.', S: '이번 주 끝낼 것 하나를 손에 잡히게 적으세요. 작은 완성이 현실감을 키워요.', N: '한 달에 한 번 왜 이 일을 하는지 적어 보세요. 의미가 보이면 큰 그림이 열려요.', T: '감정이 올라온 결정은 하루 뒤 기준표로 다시 보세요. 기준은 쓸수록 또렷해져요.', F: '결정 전에 그 일로 영향받는 사람 한 명을 떠올리세요. 온도를 읽는 연습이 결정을 둥글게 해요.', J: '내일 할 일 세 개만 전날 밤에 적으세요. 작은 틀이 하루를 잡아 줘요.', P: '계획표에 빈칸 하나를 일부러 남기세요. 여유 칸이 즉흥의 숨구멍이 돼요.' };
  const MISMATCH = { EI: { EI: '밖에서 쓰지만 충전은 안에서 해야 하는 조합이에요.', IE: '조용해 보여도 꺼내야 풀리는 사람이에요.' }, SN: { SN: '지금 환경이 디테일을 요구해 감각형처럼 살고 있어요.', NS: '아이디어보다 손에 잡히는 결과에서 힘이 나요.' }, TF: { TF: '차갑게 정한 뒤 오래 마음에 남는 편이에요.', FT: '맞춰 주다가 갑자기 선을 긋는 식으로 나와요.' }, JP: { JP: '계획을 지키느라 쓰는 힘이 커요.', PJ: '구조가 없으면 오히려 불안해지는 편이에요.' } };
  const EXP = { EI: '2주 동안 사람 만난 날과 혼자 쉰 날의 저녁 기운을 적어 봐요', SN: '일을 시작한 첫 한 시간에 무엇을 했는지 세 번 적어 봐요', TF: '큰 결정 하나에서 기준과 느낌 중 뭐가 먼저였는지 적어 봐요', JP: '한 주는 계획대로, 한 주는 마감만 두고 피로를 비교해 봐요' };

  // ───── 캐릭터 색깔(한마디 · 제목 패턴 · 초점) ─────
  const PERSONA = {
    flame: { focus: 'rel', avoidTitle: '올해 피해야 할 3가지', memo: { pair: '둘을 맞붙인 결과야. 여기만은 두 번 읽어.', who: '넌 사랑할 때 이 모양 그대로야. 그걸 먼저 알아.', power: '연애에서 새는 자리가 여기야. 외워.', decade: '지금 10년의 인연 운은 이 색이야.', year: '올해 네 연애는 이 흐름 위에 있어.', months: '고백도 이별도 달을 골라서 해.', rel: '내 전문이야. 여기만은 밑줄 그어.', work: '일 얘긴 짧게. 근데 연애랑 같은 패턴이야.' } },
    sage: { focus: 'power', avoidTitle: '당신 사주가 손해 보는 자리 3곳', memo: { pair: '돈을 섞기 전에 이 장부터 보거라.', who: '그릇을 알아야 담을 돈의 양이 보이느니라.', power: '돈이 새는 구멍은 늘 같은 자리에 있다. 여기다.', decade: '이 10년은 벌 때냐 지킬 때냐, 그것만 보거라.', year: '올해는 들어오는 길과 나가는 길이 이렇다.', months: '큰 거래는 진한 달에, 붉은 달엔 지갑을 닫아라.', rel: '돈과 사람은 늘 같이 움직이는 법이지.', work: '벌 재주와 지킬 재주는 다른 것이니라.' } },
    granny: { focus: 'year', avoidTitle: '2027년 절대 하면 안 되는 시기', memo: { pair: '둘이 맞는지는 글자가 먼저 말한단다.', who: '넌 원래 이런 애야. 그러니 네 탓 말아.', power: '힘이 센지 약한지, 그게 올해 버티는 법을 정한단다.', decade: '이 10년은 계절로 치면 이렇단다.', year: '올해 힘들었던 건 네 탓이 아니라 계절 탓이야.', months: '할머니는 이 달력만 보고 산다. 너도 붙여 둬.', rel: '식구 일은 여기 다 있어. 천천히 봐.', work: '일은 밥벌이지. 몸 상하면서 하진 말아.' } },
    child: { focus: 'who', avoidTitle: '우리 아이, 올해 하면 안 되는 3가지', memo: { pair: '둘이 어떻게 맞는지 보여요!', who: '이 아이는 이렇게 생긴 아이예요! 고치지 말고 읽어요.', power: '아이 안에 어떤 힘이 많고 적은지 다 보여요.', decade: '아이의 첫 10년 계절이에요.', year: '올해 아이한테 오는 날씨예요.', months: '달력에 붙여 두면 엄마 아빠가 덜 놀라요.', rel: '친구랑 가족이랑 이렇게 지내요.', work: '아이가 잘하는 게 여기 있어요!' } },
    hunter: { focus: 'work', avoidTitle: '2027년 이직하면 안 되는 시기', memo: { pair: '파트너 검증 결과입니다.', who: '시장이 보는 당신의 유형입니다.', power: '이력서에 적히지 않는 당신의 자원 배분입니다.', decade: '커리어 관점의 10년 단위 해석입니다.', year: '올해 움직임의 결론은 하나입니다.', months: '면접과 사직서는 달을 골라야 합니다.', rel: '관계는 생략하되, 상사 궁합만 봅니다.', work: '제 전문입니다. 여기부터 읽으셔도 됩니다.' } },
    master: { focus: null, avoidTitle: '올해 피해야 할 3가지', memo: { pair: '두 명식은 따로 보지 말고 겹쳐 봐요.', who: '여기가 명식의 출발점이에요.', power: '힘의 분포가 처방의 방향을 정해요.', decade: '큰 계절부터 보고 작은 날씨를 봐요.', year: '두 해를 나란히 두면 차이가 보여요.', months: '달의 경계는 절기예요. 괄호 안 날짜를 보세요.', rel: '가까운 자리의 글자가 관계 방식이에요.', work: '격과 용신을 쉬운 말로 풀면 이거예요.' } },
    mbti: { focus: 'axes', avoidTitle: '올해 피해야 할 3가지', memo: { who: '검사 결과 말고, 타고난 결부터 볼게요.', power: '여기가 성향 추정의 재료예요.', axes: '세 글자를 나란히 두는 게 오늘의 핵심이에요.', goal: '바꾸기보다 빌려 쓰는 쪽이 오래가요.', year: '성향도 해마다 쓰이는 자리가 달라요.', months: '실험은 진한 달에 하면 결과가 빨라요.', relwork: '관계와 일에서 그 글자가 어떻게 나오는지 볼게요.' } },
  };

  // ───── 보조 계산 ─────
  const CLASH = R.CLASH, HAP6 = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' }, STEM_HAP = R.STEM_HAP;
  const HYEONG = [['寅', '巳', '申'], ['丑', '戌', '未'], ['子', '卯']];
  const level = (ratio, total) => R.ELEMENT_BALANCE ? (ratio === 0 ? '부족' : ratio >= (total <= 6 ? 0.4 : 0.375) ? '과다' : '적정') : '적정';
  const groupLevel = (count, total) => count === 0 ? '부족' : count / total >= 0.4 ? '과다' : '적정';
  const fmtMD = d => d ? `${d.getUTCMonth() + 1}/${d.getUTCDate()}` : '';

  /** 판정 → 처방 방향. 모든 처방은 rx.allowed 안에서만 나온다. */
  function direction(r, st) {
    if (st.label === '신강') return { label: '신강', dir: 'drain', allowed: st.yongshin.groups.slice(), pick: st.yongshin.pick, word: '덜어 쓰는 쪽' };
    if (st.label === '신약') return { label: '신약', dir: 'fill', allowed: st.yongshin.groups.slice(), pick: st.yongshin.pick, word: '채우는 쪽' };
    const need = SEASON_NEED[st.season]; const stemIdx = S.STEM_ELEM.indexOf(need); const grp = S.tenGod(r.day.stemIdx, stemIdx).group;
    return { label: '중화', dir: 'fill', allowed: [grp], pick: grp, word: '계절 균형을 맞추는 쪽', needElem: need };
  }

  function calendar(r, year) {
    const rows = R.monthTable(r, year); // 절기월 12개
    return rows.map((m, i) => {
      const start = m.pillar.startKST, next = rows[(i + 1) % 12].pillar.startKST;
      const end = next ? new Date((i === 11 ? new Date(Date.UTC(next.getUTCFullYear() + 1, next.getUTCMonth(), next.getUTCDate())) : next).getTime() - 86400000) : null;
      const solarMonth = start ? start.getUTCMonth() + 1 : ((i + 2) % 12) + 1;
      return { i, solarMonth, label: `${solarMonth}월`, range: `${fmtMD(start)}~${fmtMD(end)}`, grade: m.grade, clashes: m.clashes, branchGroup: m.branchGod.group, stemGroup: m.stemGod.group, pillar: m.pillar, term: m.label.split('(')[0], yearLabel: start ? start.getUTCFullYear() : year };
    });
  }
  const mlabel = c => `${c.label}(${c.range})`;
  const mlist = cs => cs.map(c => c.label).join('·');

  function pick3(arr) { return arr.slice(0, 3); }

  // ───── 본체 ─────
  function build(result, opts) {
    opts = opts || {}; const r = result; const persona = opts.persona || null; const pid = persona ? persona.id : (opts.kind === 'mbti' ? 'mbti' : 'master');
    const kind = opts.kind === 'mbti' ? 'mbti' : 'full'; const isChild = pid === 'child';
    const name = opts.name || '당신'; const g = r.groups; const tot = r.tenGods.length;
    const st = R.strengthJudge(r); const rx = direction(r, st);
    const nowY = r.seun[0].year, nextY = r.seun[1].year;
    const cal = calendar(r, nextY).map(c => Object.assign(c, { grade: c.clashes.length ? '주의' : rx.allowed.includes(c.branchGroup) ? '추진' : '보통' }));
    const push = cal.filter(c => c.grade === '추진'), caution = cal.filter(c => c.grade === '주의'), normal = cal.filter(c => c.grade === '보통');
    const good = push.length ? push : normal; const goodM = good[0].label; const bestM = good[0];
    const dm = DM[r.day.stem]; const season = st.season;
    const lvG = {}; S.TEN_GOD_GROUPS.forEach(k => { lvG[k] = groupLevel(g[k], tot); });
    const lvE = {}; S.ELEMENTS.forEach(e => { lvE[e] = level(r.elements[e] / r.totalChars, r.totalChars); });
    const weak = r.weakestGroup, strong = r.strongestGroup; const pickG = rx.pick;
    const cur = r.daeun && r.daeun.current; const curG = cur ? cur.tenGod.group : r.month.branchElem && S.tenGod(r.day.stemIdx, S.BRANCH_MAIN_STEM[r.month.branchIdx]).group;
    const nextD = r.daeun ? (cur ? r.daeun.list[r.daeun.list.indexOf(cur) + 1] : r.daeun.list[0]) : null;
    const edge = !!(cur && (r.daeun.ageYears >= cur.toAge - 1 || r.daeun.ageYears <= cur.fromAge + 1));
    const P = PERSONA[pid] || PERSONA.master; const memo = P.memo;
    const LZ = (LZS && LZS.LENS && LZS.LENS[pid]) || null; // 캐릭터 렌즈(재물·연애·이직…)
    const T = isChild ? { WA: C_WEAK_AVOID, WI: C_WEAK_INSTEAD, WR: C_WEAK_RECAP, Y: C_YEAR, MD: C_MONTH_DOMAIN, PLAN: C_PLAN } : (LZ && LZ.weakAvoid) ? { WA: LZ.weakAvoid, WI: LZ.weakInstead, WR: LZ.weakRecap, Y: LZ.year || YEAR, MD: LZ.monthDomain, PLAN: LZ.plan } : { WA: WEAK_AVOID, WI: WEAK_INSTEAD, WR: WEAK_RECAP, Y: YEAR, MD: MONTH_DOMAIN, PLAN: PLAN_4W };

    // ── 원국 관계(충·합·형) ──
    const br = r.pillars.map(p => ({ b: p.branch, name: p.name }));
    const clashes = [], haps = [], hyeongs = [];
    for (let i = 0; i < br.length; i++) for (let k = i + 1; k < br.length; k++) { if (CLASH[br[i].b] === br[k].b) clashes.push([br[i], br[k]]); if (HAP6[br[i].b] === br[k].b) haps.push([br[i], br[k]]); }
    HYEONG.forEach(h => { const have = br.filter(x => h.includes(x.b)); if ([...new Set(have.map(x => x.b))].length >= 2) hyeongs.push(have); });

    // ── L1 피할 것 3개 (원국 / 세운 / 월운) ──
    const dayClashMonth = cal.find(c => CLASH[c.pillar.branch] === r.day.branch) || cal[0];
    const natalTime = `매년 ${mlabel(dayClashMonth)}에는`;
    const natal = { src: 'natal', time: natalTime, avoid: `${natalTime} ${T.WA[weak]}`, why: clashes.length ? `타고난 판에서 ${j(POS_KO[clashes[0][0].name], '과')} ${POS_KO[clashes[0][1].name]} 자리가 부딪혀요. ${WEAK_WHY[weak]}` : `${j(G[weak], '이')} 가장 작아요. ${WEAK_WHY[weak]}`, whyId: clashes.length ? 'l3-relations' : 'l3-strength', instead: `${T.WI[weak]} ${isChild ? C_FILL[pickG] : FILL_ACTION[pickG]}`, recap: T.WR[weak], fills: true, fillGroup: pickG };
    const sy = r.seun[1]; const yClash = [r.day, r.year].some(x => CLASH[sy.branch] === x.branch);
    const yKey = yClash ? 'clash' : sy.branchTenGod.group; const yTime = yClash || sy.tenGod.group === sy.branchTenGod.group ? `${nextY}년 내내` : `${nextY}년 하반기`;
    const yt = T.Y[yKey];
    const seun = { src: 'seun', time: yTime, avoid: `${yTime} ${yt.avoid}`, why: yClash ? `${nextY}년 글자가 내 ${POS_KO[[r.day, r.year].find(x => CLASH[sy.branch] === x.branch).name]} 자리와 부딪히는 해예요.` : `${nextY}년은 ${G[sy.branchTenGod.group]} 주제가 짙어지는 해예요.`, whyId: 'l3-luck', instead: yt.instead.replace(/\{good\}/g, goodM) + (isChild ? ' 올해의 순서가 아이에게 안전한 리듬을 가르쳐요.' : ' 그 한 해의 선택이 다음 10년의 자리를 정해요.'), recap: yt.recap.replace(/\{good\}/g, goodM), fills: false };
    const yClashPillar = yClash ? [r.day, r.year].find(x => CLASH[sy.branch] === x.branch).name : null; const cautionPref = caution.slice().sort((a, b) => ((a.clashes[0] === yClashPillar) - (b.clashes[0] === yClashPillar)) || (a.i - b.i));
    let mc = cautionPref.slice(0, 1); const nb = caution.find(c => mc.length && c.i === mc[0].i + 1 && c.clashes[0] === mc[0].clashes[0]); if (nb) mc.push(nb);
    const mLabel = mc.length ? (mc.length === 2 ? `${mc[0].solarMonth}~${mc[1].label}` : mlabel(mc[0])) : null;
    let month;
    if (mc.length) {
      const dom = T.MD[mc[0].clashes[0]]; const after = good.filter(c => c.i > mc[mc.length - 1].i); const moveTo = after.length ? after[0] : good[0];
      month = { src: 'month', time: `${nextY}년 ${mLabel}에는`, avoid: `${nextY}년 ${mLabel}에는 ${j(dom, '은')} 하지 마세요`, why: `그 달 글자가 내 ${POS_KO[mc[0].clashes[0]]} 자리와 정면으로 부딪혀요.`, whyId: 'l3-months', instead: `${j(dom, '은')} ${j(moveTo.label, '으로')} 옮기고 그때까진 정보만 모으세요. 부딪히는 달은 나쁜 달이 아니라 마음이 흔들리는 달일 뿐이에요. 결정만 옮기면 그 사이 모은 정보가 준비를 두 배 빠르게 해요.`, recap: `${dom}은 ${moveTo.label}에, 그 전엔 정보 수집만.`, fills: false, months: mc.map(c => c.solarMonth) };
    } else {
      const fb = normal.find(c => c.branchGroup === '관성') || normal[0] || cal[0]; const dom = isChild ? '학원 추가' : (LZ && LZ.monthFallback) || MONTH_FALLBACK[fb.branchGroup] || '큰 지출';
      month = { src: 'month', time: `${nextY}년 ${mlabel(fb)}에는`, avoid: `${nextY}년 ${mlabel(fb)}에는 ${j(dom, '을')} 새로 늘리지 마세요`, why: `부딪히는 달은 없지만 ${G[fb.branchGroup]} 주제가 몰리는 달이에요.`, whyId: 'l3-months', instead: `${j(dom, '은')} ${bestM.label}에 하나만 고르세요. 몰리는 달에는 더하기보다 고르는 쪽이 한 해 전체를 가볍게 만들어요.`, recap: `${dom}은 ${bestM.label}에 하나만.`, fills: false, months: [fb.solarMonth] };
    }
    const trio = [natal, seun, month];

    // ── L1 ──
    const identityLine = `${SEASON_WORD[season]}의 ${dm.noun} — ${dm.line}`;
    const L1 = {
      identity: { stem: r.day.stem, stemKo: r.day.stemKo, elem: r.dayMaster.element, noun: dm.noun, line: identityLine, season, seasonBadge: `${season}생`, name, letters: null },
      avoidTitle: P.avoidTitle.replace('올해', `${nextY}년`),
      trio, calendar: cal,
      entries: kind === 'mbti' ? [{ id: 'who', label: '나의 기질' }, { id: 'axes', label: '세 글자 맞대기' }, { id: 'year', label: '올해 흐름' }] : [{ id: 'who', label: '나의 기질' }, { id: 'year', label: '올해 흐름' }, { id: 'rel', label: isChild ? '친구와 재능' : '관계와 일' }],
      focus: P.focus,
    };

    // ── L2 ──
    const L2 = []; const sec = (id, title, conclusion, body, pair, viz) => L2.push({ id, title, conclusion, body: body.filter(Boolean), avoid: pair.avoid, instead: pair.instead, memo: memo[id] || '', viz: viz || null });
    // ① 나는 어떤 사람인가
    const whoBody = dm.body.concat([SEASON_SENT[season], BODY_SIGNAL[r.dayMaster.element]]);
    if (kind === 'mbti' && opts.est) whoBody[4] = `타고난 결로 읽으면 ${opts.est.letters} 쪽이에요.`;
    sec('who', isChild ? '우리 아이는 어떤 아이인가' : '나는 어떤 사람인가', identityLine, whoBody.slice(0, 5), isChild ? { avoid: `${dm.noun} 같은 아이를 다른 아이와 비교해 고치려 하지 마세요`, instead: dm.childTip } : { avoid: dm.avoid, instead: dm.instead }, { type: 'identity' });
    // ② 내 힘의 분포
    const pr = PRESC[pickG][rx.dir === 'drain' ? 'drain' : 'fill'] || PRESC[pickG].fill;
    const rxPhrase = rx.dir === 'drain' ? `${j(G[pickG], '으로')} 덜어 쓰는 쪽` : `${j(G[pickG], '을')} 채우는 쪽`;
    const powerBody = [`${j(G[strong], '이')} 가장 크고 ${j(G[weak], '이')} 가장 작아요.`, `전체로는 ${SP[rx.label]}이에요.`, `그래서 처방은 ${rxPhrase}이에요.`, lvE[r.sortedElems[4]] === '부족' ? `${j(EP[r.sortedElems[4]], '은')} 아예 비어 있어요.` : `${j(EP[r.sortedElems[0]], '이')} 가장 많아요.`];
    if (pid === 'sage') { powerBody[3] = lvG['재성'] === '과다' ? '돈 감각은 좋은데 몸이 먼저 지치는 구조예요.' : lvG['재성'] === '부족' ? '돈이 들어와도 손에 남지 않는 구조예요.' : '돈은 알맞게 들어오니 새는 자리만 막으면 돼요.'; powerBody.push(lvG['비겁'] === '과다' ? '동업과 보증에서 새는 자리가 가장 커요.' : '빌려주고 기다리는 돈이 가장 많이 새요.'); }
    sec('power', isChild ? '아이 안의 다섯 힘' : '내 힘의 분포', `${SP[rx.label]}, ${rxPhrase}`, powerBody.slice(0, 5), isChild ? C_POWER[pickG] : pr, { type: 'bars', groups: S.TEN_GOD_GROUPS.map(k => ({ key: k, name: G[k], n: g[k], tot, level: lvG[k] })), elems: S.ELEMENTS.map(e => ({ key: e, name: EP[e], n: r.elements[e], tot: r.totalChars, level: lvE[e] })) });
    // ③ 지금 10년, 다음 10년
    const dcur = DECADE[curG]; const dnext = nextD ? DECADE[nextD.tenGod.group] : null;
    const decBody = [cur ? `지금은 ${cur.fromAge}~${cur.toAge}세, ${dcur.theme}이에요.` : `아직 첫 10년 계절 전이라 태어난 달의 기운이 대신해요.`].concat(dcur.body, [nextD ? (dnext.theme === dcur.theme ? `${nextD.fromAge}세부터도 같은 주제가 글자만 바꿔 이어져요.` : `${nextD.fromAge}세부터는 ${j(dnext.theme, '으로')} 바뀌어요.`) : '', edge ? '지금은 계절이 바뀌는 경계라 큰 결정은 첫해를 지나 보고 해요.' : '']);
    const decTime = cur ? `${cur.fromAge}~${cur.toAge}세 사이에는` : '첫 10년 계절이 오기 전에는';
    sec('decade', isChild ? '아이의 첫 10년 계절' : '지금 10년, 다음 10년', cur ? `${cur.fromAge}~${cur.toAge}세는 ${dcur.theme}` : '첫 계절을 기다리는 중', decBody.filter(Boolean).slice(0, 5), { avoid: `${decTime} ${isChild ? C_DECADE[curG].avoid : dcur.avoid}`, instead: isChild ? C_DECADE[curG].instead : dcur.instead }, { type: 'timeline', list: r.daeun ? r.daeun.list.map(p => ({ from: p.fromAge, to: p.toAge, theme: DECADE[p.tenGod.group].theme, now: cur && p.index60 === cur.index60, clash: [r.day, r.year, r.month].some(x => CLASH[p.branch] === x.branch) })) : [], age: r.daeun ? r.daeun.ageYears : null, edge });
    // ④ 올해와 내년
    const yearBlock = (sp, yy) => { const same = sp.tenGod.group === sp.branchTenGod.group; const cl = [r.day, r.year].find(x => CLASH[sp.branch] === x.branch); return [`${yy}년은 ${BRANCH_YEAR[sp.branch]}예요.`, same ? `한 해 내내 ${G[sp.tenGod.group]} 주제가 이어져요.` : `앞머리엔 ${G[sp.tenGod.group]}, 뒤로 갈수록 ${G[sp.branchTenGod.group]} 주제예요.`, cl ? `내 ${POS_KO[cl.name]} 자리와 부딪혀 변동이 생기기 쉬워요.` : (cur && sp.branchTenGod.group === curG ? `지금 10년 계절과 같은 주제라 체감이 두 배예요.` : `지금 10년 계절과 다른 주제라 변화가 느껴져요.`)]; };
    const yPair = (() => { const s0 = r.seun[0]; const k1 = sy.tenGod.group; if (!yClash && k1 !== yKey) return { time: `${nextY}년 상반기`, key: k1 }; const c0 = [r.day, r.year].some(x => CLASH[s0.branch] === x.branch); const k0 = c0 ? 'clash' : s0.branchTenGod.group; if (k0 !== yKey) return { time: `${nowY}년 남은 달`, key: k0 }; const cands = [s0.tenGod.group, nextD ? nextD.tenGod.group : null, curG].concat(S.TEN_GOD_GROUPS).filter(k => k && k !== yKey); return { time: `${nextY}년 상반기`, key: cands[0] }; })();
    const yp = T.Y[yPair.key] || T.Y[curG];
    const yearBody = yearBlock(r.seun[0], nowY).slice(0, 2).concat(yearBlock(sy, nextY));
    if (pid === 'granny') yearBody.push(`집안 자리 글자는 ${BRANCH_POS[r.year.branch][0].replace(/어릴 적 /, '')}.`);
    sec('year', `${nowY}년과 ${nextY}년`, `${nextY}년은 ${BRANCH_YEAR[sy.branch]}`, yearBody.slice(0, 5), { avoid: `${yPair.time}에는 ${yp.avoid}`, instead: yp.instead.replace(/\{good\}/g, goodM) }, { type: 'years', years: [r.seun[0], sy].map(sp => ({ year: sp.year, stem: G[sp.tenGod.group], branch: G[sp.branchTenGod.group], image: BRANCH_YEAR[sp.branch] })) });
    // ⑤ 열두 달
    const prevOfBest = cal[(bestM.i + 11) % 12];
    const monthsBody = ['진한 칸이 밀어붙일 달, 붉은 칸이 멈출 달이에요.', `가장 좋은 달은 ${j(mlabel(bestM), '이에요')}.`, caution.length ? `멈출 달은 ${j(mlist(caution), '이에요')}.` : '정면으로 부딪히는 달은 없어요.', '달의 경계는 1일이 아니라 괄호 안 날짜예요.'];
    if (pid === 'granny') { monthsBody.splice(3, 1, `${nowY}년 남은 달은 ${nowRest(r, nowY, rx)}`, '▲는 밀어붙일 달, ■는 멈출 달이에요.'); }
    sec('months', `${nextY}년 열두 달`, `밀어붙일 달 ${mlist(pick3(push)) || '없음'}, 멈출 달 ${mlist(caution) || '없음'}`, monthsBody.slice(0, 5), { avoid: `${nextY}년 ${bestM.label} 시작 목록을 ${prevOfBest.label} 말까지 비워 두지 마세요`, instead: `${prevOfBest.label} 마지막 주에 ${bestM.label}에 시작할 일 세 가지를 적어 두세요. 좋은 달은 준비된 사람에게만 좋은 달이에요. 목록 하나가 운을 두 배로 써요.` }, { type: 'calendar', cells: cal.map(c => ({ label: c.label, range: c.range, grade: c.grade, tip: c.grade === '주의' ? `${POS_KO[c.clashes[0]]} 자리와 부딪혀요. ${j(T.MD[c.clashes[0]], '은')} 미뤄요.` : c.grade === '추진' ? `${j(G[c.branchGroup], '이')} 도와요. 시작·거래에 좋아요.` : `${G[c.branchGroup]} 주제, 평소 속도로.` })) });
    // MBTI: 축 맞대기 / 추구
    if (kind === 'mbti' && opts.est) {
      const est = opts.est, cmp = opts.cmp, adv = opts.adv;
      const axBody = est.axes.map((a, i) => { const t = cmp ? cmp.axes[i].test : null; const mm = t && t !== a.letter; return mm ? `${AXIS_NAME[a.id]}은 타고난 결 ${a.letter}, 검사 ${j(t, '이에요')}. ${MISMATCH[a.id][t + a.letter]}` : t ? `${AXIS_NAME[a.id]}은 검사와 타고난 결이 같은 ${j(a.letter, '이에요')}.` : `${AXIS_NAME[a.id]}은 타고난 결이 ${j(a.letter, '이에요')}.`; });
      const mism = cmp ? cmp.axes.filter(x => !x.match) : []; const fx = mism.length ? est.axes.find(a => a.id === mism[0].id) : est.axes.slice().sort((a, b) => a.letterPct - b.letterPct)[0];
      const fxT = cmp ? cmp.axes.find(x => x.id === fx.id).test : null;
      sec('axes', '검사·타고난 결, 네 축 맞대기', cmp ? `네 축 중 ${['네', '한', '두', '세', '네'][4 - cmp.matches] && cmp.matches === 4 ? '네 축 모두' : `${cmp.matches}축`} 같은 방향` : `타고난 결은 ${est.letters}`, axBody.slice(0, 5), { avoid: fxT && fxT !== fx.letter ? `검사 ${j(fxT, '으로')} 산다고 ${LETTER_KO[fx.letter]} 회복 시간을 지우지 마세요` : `${LETTER_KO[fx.letter]} 흐름이 약한 날 억지로 반대로 밀지 마세요`, instead: MOVE_HOW[fx.letter] }, { type: 'axes', axes: est.axes.map((a, i) => ({ id: a.id, left: a.left, right: a.right, pct: a.pct, letter: a.letter, test: cmp ? cmp.axes[i].test : null, goal: adv ? adv.goal[i] : null })), letters: { test: cmp ? cmp.test : null, chart: est.letters, goal: adv ? adv.goal : null, rec: adv ? adv.rec : null } });
      L1.identity.letters = { test: cmp ? cmp.test : null, chart: est.letters, goal: adv ? adv.goal : null, rec: adv ? adv.rec : null };
      if (adv) {
        const hard = adv.axes.find(x => x.kind === 'against' && x.chartPct >= 56) || adv.axes.find(x => x.kind === 'drift') || adv.axes[0];
        const gBody = adv.axes.map(x => `${AXIS_NAME[x.id]}: 추구 ${x.goal}, 타고난 결 ${x.chart} → ${x.verdict}.`).concat([`사주가 권하는 흐름은 ${j(adv.rec, '이에요')}.`]);
        sec('goal', `추구 ${adv.goal}로 가는 길`, `권하는 흐름은 ${adv.rec}`, gBody.slice(0, 5), { avoid: `${j(hard.goal, '으로')} 바꾸려고 ${LETTER_KO[hard.chart]} 강점을 버리지 마세요`, instead: `${LETTER_KO[hard.chart]} 강점은 그대로 두고 ${hard.goal}의 기능만 빌리세요. ${hard.goal === fx.letter ? MOVE_ALT[hard.goal] : MOVE_HOW[hard.goal]}` });
      } else {
        sec('goal', '환경이 만든 나, 타고난 나', mism.length ? `다른 축 ${mism.map(x => x.id).join('·')}부터 실험` : '네 축이 같은 방향', (mism.length ? mism.map(x => `${EXP[x.id]}.`).concat(['검사는 지금의 역할, 타고난 결은 충전 방식이에요.', '둘 중 하나가 틀린 게 아니라 둘 다 나예요.']) : ['지금 환경이 타고난 결을 잘 쓰고 있어요.', '환경이 바뀔 때 어느 축이 먼저 흔들리는지만 보면 돼요.', '검사는 지금의 역할, 타고난 결은 충전 방식이에요.']).slice(0, 5), { avoid: '검사와 타고난 결 중 하나가 틀렸다고 단정하지 마세요', instead: '어느 상황에서 어느 쪽 내가 나오는지 2주만 적어 보세요. 둘 다 맞는 나라는 걸 알면 환경을 고르는 기준이 생겨요.' });
      }
    }
    // ⑥ 관계
    const spouseGroup = r.input.gender === 'M' ? '재성' : '관성'; const spouseN = r.tenGods.filter(t => t.group === spouseGroup).length;
    const dayG = r.tenGods.find(t => t.at === '일주 지지').group; const relT = isChild ? C_REL[dayG] : REL[dayG];
    const spouseMonths = cal.filter(c => c.grade !== '주의' && (c.branchGroup === spouseGroup || c.stemGroup === spouseGroup));
    const relBody = isChild ? [relT.body, BRANCH_POS[r.day.branch][2] + '.', `가족 자리로 보면 ${BRANCH_POS[r.year.branch][0]}.`] : [relT.body, dm.rel, SPOUSE_N[Math.min(3, spouseN)], `${nextY}년 인연이 움직이는 달은 ${spouseMonths.length ? mlist(pick3(spouseMonths)) : '뚜렷하지 않아요'}${spouseMonths.length ? '이에요' : ''}.`];
    if (pid === 'flame') relBody.push(`태어난 날 글자가 ${STEM_MEAN[STEM_HAP[r.day.stem]]} 쪽인 사람과 끌림이 빨라요.`);
    const relSec = { id: 'rel', title: isChild ? '친구와 가족' : '관계', conclusion: isChild ? relT.body.replace(/\.$/, '') : `${SPOUSE_N[Math.min(3, spouseN)].split('.')[0]}`, body: relBody.slice(0, 5), pair: { avoid: relT.avoid, instead: relT.instead } };
    // ⑦ 일
    const top = r.sortedGroups; const rec = [top[0]]; if (lvG[top[1]] !== '부족') rec.push(top[1]); if (!rec.includes(pickG)) rec.push(pickG);
    const weakInAllowed = rx.allowed.includes(weak); const forbidden0 = (!weakInAllowed && lvG[weak] === '부족' && !rec.includes(weak)) ? weak : null; let forbidden = null; // 본문 문장과 토큰이 겹치면 금지 직군을 두지 않는다(1-2)
    const workT = isChild ? C_WORK[top[0]] : null;
    const workBody = isChild ? [workT.body, `${CAREER_C[top[0]]} 놀이에서 눈이 빛나요.`, dm.childTip.split('.')[0] + '.'] : [`맞는 일은 ${j(CAREER[top[0]], '이에요')}.`, WORK_STYLE[strong], dm.work, weakInAllowed ? `${j(CAREER_S[weak], '은')} 지금은 힘들어도 길게 보면 채울 방향이에요.` : `길게 보면 ${CAREER_S[pickG]} 쪽이 타고난 판을 보완해요.`];
    if (pid === 'hunter') { const q = [1, 2, 3, 4].map(n => ({ n, score: cal.filter(c => Math.ceil(c.solarMonth / 3) === n && c.yearLabel === nextY).reduce((a, c) => a + (c.grade === '추진' ? 1 : c.grade === '주의' ? -3 : 0), 0) })); const best = q.slice().sort((a, b) => b.score - a.score)[0], worst = q.slice().sort((a, b) => a.score - b.score)[0]; workBody.push(`${nextY}년 이직 적기는 ${best.n}분기, 비적기는 ${worst.n}분기예요.`); }
    if (forbidden0 && !CAREER_S[forbidden0].split(/[·\s]/).filter(Boolean).some(tok => workBody.join(' ').includes(tok))) forbidden = forbidden0;
    const workPair = isChild ? { avoid: workT.avoid, instead: workT.instead } : forbidden ? { avoid: `${CAREER_S[forbidden]} 쪽으로 혼자 옮기지 마세요`, instead: `가야 한다면 그 힘을 가진 동료와 짝을 이루세요. 지금은 적응 비용이 커요. 하지만 ${j(G[forbidden], '은')} 시간이 걸릴 뿐 못 가는 길이 아니에요.` } : WORK_PAIR[strong];
    const workSec = { id: 'work', title: isChild ? '공부와 재능' : '일', conclusion: isChild ? workT.body.replace(/\.$/, '') : `맞는 일은 ${CAREER[top[0]]}`, body: workBody.slice(0, 5), pair: workPair };
    if (kind === 'mbti') sec('relwork', '관계와 일', `${SPOUSE_N[Math.min(3, spouseN)].split('.')[0]}`, [relT.body, dm.rel, `맞는 일은 ${j(CAREER[top[0]], '이에요')}.`, WORK_STYLE[strong]].slice(0, 5), workPair);
    else { sec(relSec.id, relSec.title, relSec.conclusion, relSec.body, relSec.pair); sec(workSec.id, workSec.title, workSec.conclusion, workSec.body, workSec.pair); }
    // 캐릭터 렌즈: 그 캐릭터를 누른 이유에 맞춰 7장을 통째로 바꾼다(재물·연애·이직), 복순은 6·7장만
    if (LZ && (LZ.sections || LZ.tail)) {
      const vizOf = id => (L2.find(x => x.id === id) || {}).viz || null;
      const ctx = { r, name, j, G, EP, lvG, lvE, strong, weak, pickG, rx, rxPhrase, st, dm, season, SEASON_SENT, SP, POS_KO, cur, nextD, edge, curG, cal, push, caution, normal, good, goodM, bestM, prevOfBest, sy, yClash, yClashPillar, yKey, yPair, spouseGroup, spouseN, spouseMonths, dayG, top, rec, forbidden, workPair, weakInAllowed, identityLine, T, nowY, nextY, mlist, mlabel, REL, STEM_MEAN, BRANCH_MEAN, BRANCH_POS, BODY_SIGNAL, STEM_HAP, HAP6, CLASH, CAREER, CAREER_S, WORK_STYLE, viz: { bars: vizOf('power'), timeline: vizOf('decade'), years: vizOf('year'), calendar: vizOf('months') } };
      const norm = x => Object.assign({ memo: memo[x.id] || '', viz: null }, x, { body: x.body.filter(Boolean).slice(0, 5) });
      if (LZ.sections) { const ns = LZ.sections(ctx).map(norm); L2.splice(0, L2.length); ns.forEach(x => L2.push(x)); }
      else { LZ.tail(ctx).map(norm).forEach(x => { const i = L2.findIndex(y => y.id === x.id); if (i >= 0) L2[i] = x; else L2.push(x); }); }
      if (LZ.entries) L1.entries = LZ.entries.slice();
      // 렌즈 본문에 금지 직군 토큰이 섞이면 금지를 두지 않는다(1-2)
      const ws = L2.find(x => x.id === 'work'); if (forbidden && ws && CAREER_S[forbidden].split(/[·\s]/).filter(Boolean).some(t => ws.body.join(' ').includes(t))) { if (!isChild && ws.avoid === workPair.avoid) { ws.avoid = WORK_PAIR[strong].avoid; ws.instead = WORK_PAIR[strong].instead; } forbidden = null; }
    }
    // 궁합(두 명식 맞대기): 연애면 관계 장을, 동업·지인이면 일 장을 대신한다
    if (opts.compat && opts.compat.section) {
      const cp = opts.compat; const target = cp.kind === 'love' ? 'rel' : (kind === 'mbti' ? 'relwork' : 'work'); const idx = L2.findIndex(x => x.id === target);
      const sec2 = Object.assign({}, cp.section, { memo: memo.pair || '', focus: true, replaced: target });
      if (idx >= 0) L2.splice(idx, 1, sec2); else L2.push(sec2);
      L1.entries = L1.entries.map(e => e.id === target || e.id === 'rel' ? { id: 'pair', label: cp.kindKo } : e);
    }
    // 초점 섹션 표시
    L2.forEach(s => { s.focus = s.focus || P.focus === s.id; });

    // ── L2 마무리: 대신 3개 + 4주 + 맺음 ──
    const mismAll = kind === 'mbti' && opts.cmp ? opts.cmp.axes.filter(x => !x.match) : [];
    const plan = (kind === 'mbti' && mismAll.length) ? mismAll.slice(0, 4).map((x, k) => `${k + 1}주: ${EXP[x.id]}`).concat(T.PLAN[pickG].slice(mismAll.length)).slice(0, 4) : T.PLAN[pickG];
    const end = { title: '대신 이렇게 하면 잘 풀려요', insteads: trio.map(t => ({ src: t.src, text: t.recap, fills: t.fills })), planTitle: LZ && LZ.planTitle ? LZ.planTitle(G[pickG]) : `${j(G[pickG], '을')} ${rx.dir === 'drain' ? '쓰는' : '채우는'} 4주`, plan, closing: ['여기까지 읽었다면 이미 절반은 했어요.', '4주 뒤 같은 자리에서 다른 선택을 한 번 했다면 충분해요.', `${bestM.label}에 시작할 일 하나만 적어 두고 덮으세요.`] };

    // ── L3 근거 ──
    const L3 = []; const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const rd = b => `${b} ${S.BRANCHES_KO[S.BRANCHES.indexOf(b)]}(${BRANCH_MEAN[b]})`, rs = s => `${s} ${S.STEMS_KO[S.STEMS.indexOf(s)]}(${STEM_MEAN[s]})`;
    L3.push({ id: 'l3-chart', title: '원국 여덟 글자', html: `<table class="gods l3t"><thead><tr><th>자리</th><th>윗글자(천간)</th><th>아랫글자(지지)</th><th>십신</th></tr></thead><tbody>${r.pillars.map(p => { const tg = r.tenGods.find(t => t.at === p.name + ' 천간'), bg = r.tenGods.find(t => t.at === p.name + ' 지지'); return `<tr><td>${p.name}<br><small>${POS_SHORT[p.name]}</small></td><td class="el-${p.stemElem}">${rs(p.stem)}</td><td class="el-${p.branchElem}">${rd(p.branch)}</td><td>${tg ? tg.name : '일간(나)'} · ${bg.name}</td></tr>`; }).join('')}</tbody></table><p class="muted">한자 뒤 괄호는 독음과 뜻이에요. 같은 글자가 둘이면 자리마다 다른 뜻으로 읽어요.</p>` });
    const seenB = {}; L3.push({ id: 'l3-pillars', title: '네 기둥 자세히', html: r.pillars.map(p => { const bg = r.tenGods.find(t => t.at === p.name + ' 지지'); const first = !seenB[p.branch]; seenB[p.branch] = (seenB[p.branch] || 0) + 1; const line = first ? BRANCH_POS[p.branch][POS_IDX[p.name]] + '.' : `앞서 본 ${rd(p.branch)}가 ${p.name}에도 있어요. 같은 주제가 ${POS_KO[p.name]} 자리에서 한 번 더 와요.`; return `<div class="pblock"><h5>${p.name} ${p.hanja} <small>${p.ko} · ${POS_SHORT[p.name]} 자리 · ${bg.name}(${R.GOD_NUANCE[bg.name]})</small></h5><p>${ROLE_DESC[p.name]}</p><p>${line}</p></div>`; }).join('') });
    const relHtml = [].concat(clashes.map(([a, b]) => `<b>${a.name} ${rd(a.b)} ↔ ${b.name} ${rd(b.b)} 충(부딪힘).</b> ${POS_KO[a.name]}과 ${POS_KO[b.name]} 영역에서 변동과 이동이 반복되기 쉬워요.`), haps.map(([a, b]) => `<b>${a.name} ${rd(a.b)} + ${b.name} ${rd(b.b)} 합(끌림).</b> ${POS_KO[a.name]}과 ${POS_KO[b.name]}이 서로 묶여요. 결속이자 발이 묶이는 자리예요.`), hyeongs.map((h, i) => `<b>${h.map(x => x.name + ' ' + rd(x.b)).join(', ')} 형(마찰).</b> ${i === 0 ? '다듬어지는 과정의 마찰이라 전문 기술로 쓰면 권위가 돼요.' : '앞의 마찰과 같은 성격이라 같은 주제가 한 번 더 와요.'}`));
    L3.push({ id: 'l3-relations', title: '글자 사이의 충·합·형', html: relHtml.length ? relHtml.map(x => `<p>${x}</p>`).join('') : '<p>원국 글자 사이에 뚜렷한 충·합·형이 없어요. 안정적이지만 운에서 오는 부딪힘이 크게 느껴져요.</p>' });
    const mg = r.tenGods.find(t => t.at === '월주 지지'); const gyeok = mg.name === '비견' ? '건록격' : mg.name === '겁재' ? '양인격' : mg.name + '격';
    L3.push({ id: 'l3-strength', title: '신강·신약 판정과 처방 방향', html: `<p><b>${st.label}</b>(점수 ${st.score}/6) · ${SP[st.label]}.</p><ul class="keylist">${st.why.map(w => `<li>${w.replace(/([一-龥])\(([一-龥])\)/g, (m, b, e) => `${b} ${S.BRANCHES_KO[S.BRANCHES.indexOf(b)]}(${EP[e]})`).replace(/돕습니다/g, '도와요').replace(/받칩니다/g, '받쳐요').replace(/않습니다/g, '않아요')}</li>`).join('')}</ul><p><b>처방 방향.</b> ${rx.dir === 'drain' ? '힘이 세니 식상·재성·관성으로 덜어 써요.' : rx.label === '중화' ? `중화라 조후(계절 균형)를 우선해요. ${st.season}생이라 ${rx.needElem}(${S.ELEM_KO[rx.needElem]})이 반갑고, 일간 기준 ${rx.pick}이에요.` : '힘이 약하니 인성·비겁으로 채워요.'} 용신 후보 1순위는 <b>${rx.pick}</b>(${G[rx.pick]})${lastSound(rx.pick).b ? '이' : ''}고, 이 리포트의 모든 처방은 이 방향 안에서만 나와요.</p><p><b>격(간이).</b> 월지 ${rd(r.month.branch)}의 본기는 ${rs(S.STEMS[S.BRANCH_MAIN_STEM[r.month.branchIdx]])}, 일간 기준 ${j(mg.name, '이라')} ${j(gyeok, '으로')} 봐요.</p><p><b>십신 비율.</b> ${S.TEN_GOD_GROUPS.map(k => `${k}(${G[k]}) ${g[k]}개 ${lvG[k]}`).join(' · ')} (전체 ${tot}개).</p><p class="muted">득령·득지·득세를 단순 점수화한 간이 판정이에요. 지장간·합충·격국을 반영한 정식 판정은 전문가 감수가 필요해요.</p>` });
    L3.push({ id: 'l3-luck', title: '대운표와 세운', html: (r.daeun ? `<table class="gods l3t"><thead><tr><th>만 나이</th><th>대운</th><th>십신</th></tr></thead><tbody>${r.daeun.list.map(p => `<tr class="${cur && p.index60 === cur.index60 ? 'now' : ''}"><td>${p.fromAge}~${p.toAge}세</td><td>${rs(p.stem)} ${rd(p.branch)}</td><td>${p.tenGod.name}·${p.branchTenGod.name}</td></tr>`).join('')}</tbody></table><p class="muted">대운수 ${r.daeun.startAge}, ${r.daeun.forward ? '순행' : '역행'}, 현재 만 ${r.daeun.ageYears}세. 만 나이 기준이에요.</p>` : '<p>성별이 없어 대운을 세우지 않았어요.</p>') + r.seun.map(sp => `<p><b>${sp.year}년 ${rs(sp.stem)} ${rd(sp.branch)}.</b> 천간 ${sp.tenGod.name}, 지지 ${sp.branchTenGod.name}.${[r.day, r.year].some(x => CLASH[sp.branch] === x.branch) ? ` 원국 ${[r.day, r.year].filter(x => CLASH[sp.branch] === x.branch).map(x => x.name).join('·')}와 충이에요.` : ''}</p>`).join('') });
    L3.push({ id: 'l3-months', title: `${nextY}년 월운표(절기 기준)`, html: `<table class="gods l3t months"><thead><tr><th>양력</th><th>절기월</th><th>월운</th><th>십신</th><th>등급</th></tr></thead><tbody>${cal.map(c => `<tr class="g-${c.grade}"><td>${c.label}<br><small>${c.range}</small></td><td>${c.term}</td><td>${rs(c.pillar.stem)} ${rd(c.pillar.branch)}</td><td>${c.stemGroup}·${c.branchGroup}</td><td><b>${c.grade}</b>${c.clashes.length ? `<br><small>${c.clashes.join('·')} 충</small>` : ''}</td></tr>`).join('')}</tbody></table><p class="muted">추진은 처방 방향(${rx.allowed.map(k => `${k}`).join('·')})의 기운이 드는 달, 주의는 원국 일지·년지·월지와 충하는 달이에요. 달의 경계는 절입일이에요.</p>` });
    if (opts.compat && opts.compat.l3) L3.push({ id: 'l3-pair', title: `${opts.compat.kindKo} 근거: 두 명식 맞대기`, html: opts.compat.l3 });
    L3.push({ id: 'l3-basis', title: '계산 기준과 안내', html: `<p class="muted">년주 경계 입춘, 월주 경계 12절기(태양 황경 근사식), 일주 (율리우스일수+49) mod 60, 23시 이후 익일 일주, 진태양시 보정 ${r.input.solarCorrectionMin || 0}분. ${r.notes.join(' / ') || ''}</p><p class="muted">몸의 신호는 오행 배속이라는 전통 관점이고 의학적 진단이 아니에요. 이 리포트는 참고용 콘텐츠이며 의학·법률·금융 조언이 아니에요.</p>` });
    const glossary = [['나 자신의 힘', '비겁(비견·겁재)'], ['내보내는 힘', '식상(식신·상관)'], ['손에 쥐는 힘', '재성(정재·편재)'], ['나를 누르는 힘', '관성(정관·편관)'], ['쉬고 배우는 힘', '인성(정인·편인)'], ['10년 계절', '대운'], ['올해 날씨', '세운'], ['이달 날씨', '월운'], ['나를 살리는 기운', '용신'], ['부딪힘', '충'], ['끌림', '합'], ['마찰', '형'], ['나를 뜻하는 글자', '일간']];

    const title = opts.title || (persona ? persona.report.title : 'MBTI 사주 심층');
    const rep = { kind, pid, title, name, nowY, nextY, L1, L2, end, L3, glossary, meta: { strength: st, rx, lvG, lvE, weak, strong, pick: pickG, career: { recommended: rec, forbidden: forbidden ? [forbidden] : [] }, trio, plan: PLAN_4W } };
    rep.chars = countChars(rep); rep.screens = Math.max(3, Math.round((rep.chars + 1200) / 450));
    return rep;
  }
  function nowRest(r, nowY, rx) { const cs = calendar(r, nowY); const now = new Date(); const rest = cs.filter(c => c.pillar.startKST && c.pillar.startKST.getTime() + 31 * 86400000 >= now.getTime()); return rest.length ? j(rest.map(c => `${c.label}${c.clashes.length ? '■' : rx.allowed.includes(c.branchGroup) ? '▲' : ''}`).join('·'), '이에요') + '.' : '얼마 남지 않았어요.'; }

  // ───── 글자수·검사기 ─────
  const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  function l12Texts(rep) {
    const out = [];
    const L1 = rep.L1; out.push({ t: L1.identity.line, k: 'head' }, { t: L1.avoidTitle, k: 'head' });
    L1.trio.forEach(x => { out.push({ t: x.avoid, k: 'avoid' }, { t: x.why, k: 'body' }, { t: x.instead, k: 'instead' }); });
    L1.calendar.forEach(c => out.push({ t: c.label, k: 'head' }));
    rep.L2.forEach(s => { out.push({ t: s.title, k: 'head' }, { t: s.conclusion, k: 'head' }); s.body.forEach(b => out.push({ t: b, k: 'body' })); out.push({ t: s.avoid, k: 'avoid' }, { t: s.instead, k: 'instead' }); if (s.memo) out.push({ t: s.memo, k: 'memo' }); if (s.viz && s.viz.cells) s.viz.cells.forEach(c => out.push({ t: c.tip, k: 'body' })); });
    out.push({ t: rep.end.title, k: 'head' }, { t: rep.end.planTitle, k: 'head' }); rep.end.insteads.forEach(x => out.push({ t: x.text, k: 'recap' })); rep.end.plan.forEach(p => out.push({ t: p, k: 'plan' })); rep.end.closing.forEach(c => out.push({ t: c, k: 'closing' }));
    return out;
  }
  function countChars(rep) { return l12Texts(rep).filter(x => x.k !== 'memo').map(x => x.t).join('').replace(/\s/g, '').length; }
  const sentences = t => String(t).split(/(?<=[.!?])\s+|(?<=[.!?])$/).map(s => s.trim()).filter(Boolean);

  const JARGON = /비견|겁재|식신|상관|정재|편재|정관|편관|정인|편인|비겁|식상|재성|관성|인성|용신|대운|세운|월운|일간|천간|(?<![가-힣])지지(?![가-힣])|신강|신약|원국|격국|십신|조후|억부|지장간|일지|월지|년지|시지/;
  const TERMS_IN = /(?<![가-힣\d])[자축인묘진사오미신유술해]월(?![가-힣\d])/;
  const LOSS = /피하|하지 마|손해|위험|조심|주의|잃|실패|불안|나쁜|막아/;
  const TERM_NAMES = /(?<![가-힣])(입춘|경칩|청명|입하|망종|소서|입추|백로|한로|입동|대설|소한)(?![가-힣])/;
  const FEAR = /질병|사고|사망|죽|병원|수술|헤어지게|이별이 와|이별할 운|이별 운/;
  /** 합격 기준 검사. 문제 목록(빈 배열이면 통과). */
  function lint(rep) {
    const P = []; const push = (rule, msg) => P.push({ rule, msg });
    const items = l12Texts(rep); const l12 = items.map(x => x.t).join('\n'); const l12NoMemo = items.filter(x => x.k !== 'memo').map(x => x.t).join('\n');
    const all = l12 + '\n' + rep.L3.map(s => s.title + ' ' + strip(s.html)).join('\n');
    const rx = rep.meta.rx;
    // 1-1 방향 일치
    const notFill = S.TEN_GOD_GROUPS.filter(k => !(rx.dir === 'fill' && rx.allowed.includes(k))).map(k => G[k]); const notDrain = S.TEN_GOD_GROUPS.filter(k => !(rx.dir === 'drain' && rx.allowed.includes(k))).map(k => G[k]);
    const bad = [new RegExp(`(${notFill.join('|')})[을를이가은는] ?(채우|보태|키우)`), new RegExp(`(${notDrain.join('|')})[을를이가은는] ?(덜어 ?내|줄이|빼)`)];
    bad.forEach(re => { const m = l12NoMemo.match(re); if (m) push('1-1 방향', `${rx.label}인데 "${m[0]}"`); });
    if (!rx.allowed.includes(rep.meta.pick)) push('1-1 방향', '용신이 허용 집합 밖');
    // 1-1 등급 수식어
    Object.keys(rep.meta.lvG).forEach(k => { const n = G[k], lv = rep.meta.lvG[k]; if (lv !== '과다' && new RegExp(`(넘치는 ${n}|${n}[이가] 넘치)`).test(l12NoMemo)) push('1-1 등급', `${k} ${lv}인데 넘치는`); if (lv !== '부족' && new RegExp(`(비어 있는 ${n}|${n}[이가은는] (아예 )?비어)`).test(l12NoMemo)) push('1-1 등급', `${k} ${lv}인데 비어 있는`); });
    // 1-2 직군
    const c = rep.meta.career; if (c.forbidden.some(f => c.recommended.includes(f))) push('1-2 직군', `금지∩추천: ${c.forbidden}`);
    if (c.forbidden.length) { const ws = rep.L2.find(x => x.id === 'work' || x.id === 'relwork'); const toks = c.forbidden.flatMap(f => CAREER_S[f].split(/[·\s]/)).filter(Boolean); if (ws && toks.some(t => ws.body.join(' ').includes(t))) push('1-2 직군', `금지 직군 ${toks.join('/')}이 추천 문장에 등장`); }
    // 1-3 조사
    [/\((는|가|를|와|이|은|을|과)\)/, /[一-龥][은는이가을를과와으]/, /당신 님/, /정재은|겁재이|식신은 |편재은/].forEach(re => { const m = all.match(re); if (m) push('1-3 조사', `"${m[0]}"`); });
    // 2 중복(25자 이상 동일 문장)
    const seen = new Map(); sentences(all.replace(/\n/g, ' ')).forEach(s => { const k = s.replace(/\s+/g, ''); if (k.length >= 25) seen.set(k, (seen.get(k) || 0) + 1); }); seen.forEach((n, k) => { if (n > 1) push('2 중복', `${n}회: ${k.slice(0, 30)}…`); });
    // 3·8 섹션 구조
    rep.L2.forEach(s => { if (!s.avoid || !s.instead) push('6-1 쌍', `${s.id} 피할 것/대신 누락`); if (s.body.length < 3 || s.body.length > 5) push('3 섹션', `${s.id} 본문 ${s.body.length}문장`); if (s.instead.replace(/\s/g, '').length <= s.avoid.replace(/\s/g, '').length) push('6 비율', `${s.id} 대신이 피할 것보다 짧음`); });
    // 4 용어·한자·분수·절기월·괄호
    if (/[一-龥]/.test(l12NoMemo)) push('4-3 한자', (l12NoMemo.match(/[^\n]*[一-龥][^\n]*/) || [''])[0].slice(0, 40));
    const fr = l12NoMemo.match(/(?<![\d/~])\d+\/\d+(?![\d/~])/); if (fr) push('4-4 분수', fr[0]);
    const jg = l12NoMemo.match(JARGON); if (jg) push('4-1 원어', (l12NoMemo.match(new RegExp(`[^\n]*${jg[0]}[^\n]*`)) || [jg[0]])[0].slice(0, 50));
    const tm = l12NoMemo.match(TERMS_IN) || l12NoMemo.match(TERM_NAMES); if (tm) push('4-5 절기월', tm[0]);
    const np = l12NoMemo.match(/\)\(|\([^)\n]*\(/); if (np) push('4-2 괄호', np[0]);
    // 5 톤·화자·문장 길이·단락
    items.filter(x => x.k !== 'memo' && x.k !== 'head').forEach(x => { if (/습니다|십시오|입니다|합니다|됩니다/.test(x.t)) push('5-1 톤', x.t.slice(0, 40)); if (/(^|[\s"“(])(제가|저는|저희) |전문가로서/.test(x.t)) push('5-2 화자', x.t.slice(0, 40)); sentences(x.t).forEach(s => { if (s.length > 40) push('5-3 길이', `${s.length}자: ${s}`); }); if (x.k === 'body' || x.k === 'instead') { if (sentences(x.t).length > 3) push('5-3 단락', x.t.slice(0, 40)); } });
    // 6 피할 것 3개 출처·대응·비율·공포·맺음
    const srcs = rep.L1.trio.map(t => t.src).sort().join(','); if (srcs !== 'month,natal,seun') push('6-5 출처', srcs);
    rep.L1.trio.forEach(t => { if (!t.instead) push('6-1 대응', t.src); if (t.instead.replace(/\s/g, '').length < t.avoid.replace(/\s/g, '').length * 2) push('6 비율', `${t.src} 대신 ${t.instead.replace(/\s/g, '').length} < 피할 것×2 ${t.avoid.replace(/\s/g, '').length * 2}`); if (FEAR.test(t.avoid)) push('6-3 공포', t.avoid); if (!/\d+월|매년|내내|상반기|하반기|남은 달/.test(t.avoid)) push('6 형식', `시기 없음: ${t.avoid}`); });
    if (!rep.L1.trio.some(t => t.fills)) push('6 채움', '빈 기운 채우는 대신 없음');
    items.filter(x => x.k === 'avoid').forEach(x => { if (FEAR.test(x.t)) push('6-3 공포', x.t); });
    rep.end.closing.forEach(cl => { if (LOSS.test(cl)) push('6 맺음', cl); });
    rep.end.insteads.forEach(x => { if (/하지 마|마세요/.test(x.text)) push('6 끝요약', x.text); });
    // 8 글자수
    if (rep.chars > 2500) push('8 글자수', `${rep.chars}자`);
    return P;
  }

  return { G, EP, DM, PERSONA, LETTER_KO, build, lint, direction, calendar, josa: j, countChars, l12Texts };
});
