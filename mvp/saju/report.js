/*
 * report.js — 심층 풀이 구성기 (데이터 기반 장문 템플릿)
 * 입력: Saju.compute() 결과 + 캐릭터(personas.js) → 13개 장(section)으로 된 리포트.
 * 모든 문장은 명식 데이터(십신·오행·대운·세운·월운·충)에서 선택된다. 운영 전환 시 각 장의 본문을
 * LLM이 캐릭터 말투로 다시 쓰되, 이 구성기가 만든 "사실 골격"을 입력으로 준다.
 * 신강·신약, 용신 후보, 조후는 간이 판정이며 전문가 감수가 필요하다(화면에 표기).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./saju.js'));
  else root.SajuReport = factory(root.Saju);
})(typeof self !== 'undefined' ? self : this, function (S) {
  'use strict';

  const DAYMASTER = {
    甲: { name: '갑목', image: '하늘로 곧게 뻗는 큰 나무', core: '갑목은 하늘로 곧게 뻗는 큰 나무입니다. 열 천간의 첫 글자답게 시작하는 힘, 앞장서는 힘이 본성이고, 굽히는 것보다 부러지는 쪽을 택하는 자존심이 있습니다. 한 번 방향을 정하면 오래 밀고 가지만, 방향을 바꾸는 데는 남들보다 큰 결심이 필요합니다.', strength: '책임을 맡으면 커지는 사람입니다. 명분이 분명할 때 가장 강하고, 남을 세우는 자리에서 신뢰를 얻습니다. 큰 그림을 잡고 사람을 모으는 데 타고난 재능이 있습니다.', shadow: '고집이 자존심과 붙으면 조언이 들리지 않습니다. 뿌리가 되는 인성과 물이 부족하면 겉은 크고 속은 마르는 상태가 오기 쉽습니다. 꺾이는 순간을 인정하지 못해 더 크게 부러집니다.', relation: '관계에서는 보호자 역할을 자처합니다. 상대가 기대 오는 것은 편하지만, 상대가 자기 방식대로 서려 할 때 서운함을 느낍니다. 사랑을 받는 법보다 주는 법에 익숙합니다.', work: '조직을 세우고 키우는 일, 큰 방향을 잡는 일에 맞습니다. 잔손이 많은 반복 업무는 오래 버티지 못하고, 명분 없는 지시 아래서는 능력이 반으로 줄어듭니다.' },
    乙: { name: '을목', image: '바위틈에서도 자라는 풀과 덩굴', core: '을목은 바위틈에서도 자라는 풀이고 덩굴입니다. 겉은 부드럽지만 생존력은 열 천간 중 가장 질깁니다. 정면으로 부딪치지 않고 돌아가며, 환경에 맞춰 모양을 바꾸는 유연함이 무기입니다.', strength: '적응과 협상에 강합니다. 사람 사이를 잇고, 막힌 곳을 돌아서 뚫습니다. 누구와도 어울리면서 결국 자기 자리를 만드는 끈기가 있습니다.', shadow: '기댈 대상이 없으면 불안하고, 눈치를 보다 자기 의견을 잃습니다. 속으로 삭이는 서운함이 쌓이다가 어느 날 덩굴을 끊듯 관계를 끊습니다.', relation: '맞춰 주는 사랑을 합니다. 그래서 오래 가지만, 참다가 한 번에 끝내는 패턴이 있습니다. 상대는 그 끝이 갑작스럽다고 느낍니다.', work: '기획·조율·영업·디자인처럼 사람과 환경을 읽는 일이 맞습니다. 홀로 버티는 창업보다 좋은 파트너와의 협업에서 더 멀리 갑니다.' },
    丙: { name: '병화', image: '모든 것을 비추는 태양', core: '병화는 태양입니다. 숨길 수 없고, 가리지 않고 비춥니다. 밝고 공평하며 뒤끝이 없지만, 그만큼 기복도 한낮과 한밤처럼 큽니다. 있는 자리를 환하게 만들고, 없는 자리를 티 나게 비웁니다.', strength: '사람을 모으고 분위기를 바꿉니다. 리더십과 표현력, 솔직함으로 신뢰를 삽니다. 시작의 열기가 커서 새 일을 띄우는 데 탁월합니다.', shadow: '관심이 없으면 시들고, 인정받지 못하면 과장이 늘어납니다. 꾸준함과 디테일이 약점이고, 뜨거웠던 만큼 식는 속도도 빠릅니다.', relation: '뜨겁게 시작합니다. 관심을 쏟는 만큼 돌려받기를 원하고, 상대의 무심함을 가장 견디지 못합니다. 사랑을 숨기지 못해 밀당이 안 됩니다.', work: '무대·발표·교육·세일즈·리더 자리에 맞습니다. 숫자와 서류만 다루는 일은 에너지를 빼앗고, 뒤에서 조용히 받쳐 주는 역할에서는 빛이 꺼집니다.' },
    丁: { name: '정화', image: '가까운 것을 밝히는 등불', core: '정화는 촛불이고 등불입니다. 태양처럼 모두를 비추지 않고 가까운 것을 따뜻하게 밝힙니다. 겉은 조용하지만 속은 집요하게 타는 불이라, 한 사람과 한 주제에 오래 머뭅니다.', strength: '집중과 통찰이 강점입니다. 한 사람, 한 주제를 깊게 파고 들어가 본질을 봅니다. 섬세하고 예의가 바르며, 가까운 사람에게는 한없이 따뜻합니다.', shadow: '바람 같은 환경 변화에 흔들리고, 연료가 되는 인성과 목이 끊기면 금방 꺼집니다. 예민함이 불안으로 바뀌기 쉽고, 혼자 상처를 오래 품습니다.', relation: '헌신형입니다. 상대의 작은 변화를 알아채고 챙기지만, 같은 섬세함을 돌려받지 못하면 혼자 식어 갑니다. 사랑을 표현하는 방식이 조용해서 오해를 삽니다.', work: '연구·분석·상담·문화예술·전문 기술처럼 소수와 깊게 일하는 구조가 맞습니다. 대규모 조직의 정치와 소음 속에서는 빛이 묻힙니다.' },
    戊: { name: '무토', image: '모두가 기대는 큰 산', core: '무토는 산이고 넓은 대지입니다. 쉽게 움직이지 않고, 모두가 기댈 수 있는 중심입니다. 느리지만 한 번 자리 잡으면 흔들리지 않는 신뢰가 본성이고, 말보다 존재로 사람을 안심시킵니다.', strength: '포용과 안정이 강점입니다. 위기에서 당황하지 않고, 사람과 자원을 품어 지킵니다. 오래 가는 신뢰를 쌓아 결국 중심 자리에 앉습니다.', shadow: '변화를 미루고 고집이 세집니다. 답답함을 속으로 쌓다가 몸으로 앓는 경우가 많고, 떠나야 할 때 떠나지 못합니다.', relation: '말보다 행동으로 사랑합니다. 그래서 표현이 적다는 오해를 받고, 떠나는 사람을 붙잡는 말을 끝내 못 합니다. 한 번 품은 사람은 오래 품습니다.', work: '운영·관리·부동산·금융·중재처럼 믿고 맡기는 역할에 강합니다. 빠른 피벗이 필요한 일에는 느리고, 그 느림이 때로는 가장 큰 안전장치가 됩니다.' },
    己: { name: '기토', image: '무엇이든 키워 내는 논밭', core: '기토는 가꿔진 땅, 논밭입니다. 무엇이든 받아서 키워 내는 흙이라 실속과 쓸모를 봅니다. 겉으로 드러내지 않고 조용히 챙기는 사람이고, 주변이 잘 되는 것을 자기 보람으로 삼습니다.', strength: '현실감과 돌봄이 강점입니다. 디테일을 챙기고, 남이 놓친 것을 수습합니다. 눈에 띄지 않아도 없으면 판이 돌아가지 않는 사람입니다.', shadow: '걱정이 많고 자기 비하가 습관이 되기 쉽습니다. 남의 일을 떠안다가 정작 자기 밭은 묵히고, 그 사실을 아무에게도 말하지 않습니다.', relation: '챙겨 주는 사랑을 합니다. 받는 것보다 주는 데 익숙해서 받을 때 어색해하고, 서운함을 말로 못 하고 거리를 둡니다.', work: '교육·보육·회계·운영 지원·요식처럼 뒤에서 판을 굴리는 역할에 강합니다. 앞에 서서 자기를 파는 일에는 에너지가 두 배로 듭니다.' },
    庚: { name: '경금', image: '가공 전의 쇠, 도끼', core: '경금은 가공 전의 쇠이고 바위이며 도끼입니다. 단단하고 직선적이며 의리와 결단이 본성입니다. 돌려 말하지 못하고, 틀린 것을 보면 참지 못합니다. 거칠지만 뒤끝은 없습니다.', strength: '결단과 추진이 강점입니다. 복잡한 상황을 잘라 정리하고, 한 번 맡은 사람은 끝까지 지킵니다. 위기에서 가장 믿음직한 사람입니다.', shadow: '날이 서면 주변이 다칩니다. 융통성이 부족하고, 자기 기준에 못 미치는 사람을 쉽게 포기합니다. 다듬어지지 않은 쇠는 스스로도 다칩니다.', relation: '선이 분명한 사랑을 합니다. 믿으면 다 주지만, 한 번 신뢰가 깨지면 돌아보지 않습니다. 표현이 투박해 마음보다 작게 전달됩니다.', work: '군·경·법·의료·엔지니어링·구조조정처럼 규칙이 분명한 환경에서 빛납니다. 애매한 정치 구조 안에서는 소모되고, 그 소모를 참지 못합니다.' },
    辛: { name: '신금', image: '다듬어진 보석과 바늘', core: '신금은 다듬어진 보석이고 바늘입니다. 섬세하고 예리하며, 자기 가치에 대한 자존심이 강합니다. 작은 흠을 그냥 넘기지 못하는 완벽주의가 있고, 그 눈이 자신에게 가장 가혹합니다.', strength: '정밀함과 안목이 강점입니다. 품질을 가려내고, 말 한마디로 핵심을 찌릅니다. 기준을 세우는 자리에서 대체 불가능한 사람이 됩니다.', shadow: '예민함이 상처로 돌아옵니다. 인정받지 못하면 냉소가 늘고, 자기 기준으로 자신을 가장 심하게 깎습니다. 흙탕물 같은 환경에서는 빛이 흐려집니다.', relation: '까다롭지만 한 번 마음을 열면 깊습니다. 상대의 무신경한 말 한마디를 오래 기억하고, 그 기억이 관계의 온도를 정합니다.', work: '전문직·심사·감정·디자인·금융 분석처럼 기준을 세우는 일에 맞습니다. 거친 현장 영업이나 두루뭉술한 관계 중심 조직과는 거리가 있습니다.' },
    壬: { name: '임수', image: '멈추지 않고 흐르는 바다', core: '임수는 바다이고 큰 강입니다. 멈추지 않고 흐르며, 모든 것을 받아들이는 넓이와 깊이를 가집니다. 생각이 크고 자유로우며, 틀에 갇히는 것을 싫어합니다. 겉은 유유하지만 속에는 조류가 있습니다.', strength: '지혜와 전략이 강점입니다. 흐름을 읽고 큰 그림을 봅니다. 포용력이 커서 다양한 사람을 품고, 위기에서 돌아가는 길을 찾습니다.', shadow: '방향이 없으면 범람합니다. 마음이 흩어지고, 시작은 많은데 마무리가 약합니다. 깊이를 아무도 모르기에 외로움도 깊습니다.', relation: '자유로운 사랑을 합니다. 묶이는 것을 싫어하지만, 상대가 떠나면 바다처럼 오래 출렁입니다. 넓은 만큼 한 사람에게 머무는 법을 배워야 합니다.', work: '기획·전략·무역·투자·미디어·해외처럼 움직이는 일이 맞습니다. 한 자리에서 같은 일을 반복하는 구조에서는 물이 고여 탁해집니다.' },
    癸: { name: '계수', image: '조용히 스며드는 이슬과 비', core: '계수는 이슬이고 비이며 샘물입니다. 조용히 스며들어 생명을 살립니다. 직관과 감수성이 예민하고, 겉으로 드러나지 않는 영향력이 있습니다. 소리 없이 땅을 적시듯 사람을 바꿉니다.', strength: '통찰과 공감이 강점입니다. 말하지 않은 것을 읽고, 조용히 사람을 움직입니다. 디테일과 분위기를 동시에 감지하는 드문 감각이 있습니다.', shadow: '속을 알 수 없다는 말을 듣고, 스스로도 감정에 잠깁니다. 결정을 미루고 비관으로 흐르기 쉬우며, 혼자 있는 시간이 길어지면 안개처럼 흐려집니다.', relation: '조용히 깊게 사랑합니다. 상대가 알아채 주길 기다리다 지치는 패턴이 있고, 말로 꺼내는 순간 관계가 바뀌는 경험을 반복합니다.', work: '연구·상담·글·예술·데이터 해석처럼 뒤에서 흐름을 설계하는 역할에 맞습니다. 큰 소리로 자기를 파는 자리보다 결과물로 말하는 자리가 어울립니다.' },
  };

  const PILLAR_ROLE = {
    년주: { role: '뿌리 자리', desc: '조상과 집안의 분위기, 어린 시절의 환경, 사회가 나를 처음 보는 인상을 뜻합니다. 대략 스무 살 전후까지의 흐름과 겹칩니다.' },
    월주: { role: '기둥 자리', desc: '부모·형제와 성장기의 환경, 그리고 사회생활의 무대입니다. 네 기둥 중 가장 힘이 세고, 청년기와 직업의 큰 방향을 봅니다.' },
    일주: { role: '나와 배우자 자리', desc: '천간은 나 자신, 지지는 배우자와 가정의 자리입니다. 중년의 흐름과 겹치며, 일지의 글자가 가장 가까운 사람과의 관계 방식을 보여 줍니다.' },
    시주: { role: '열매 자리', desc: '자녀와 후배, 말년, 그리고 내가 세상에 남기는 결과물입니다. 예순 이후와 내면이 향하는 곳을 봅니다.' },
  };
  const PILLAR_GOD = {
    년주: { 비겁: '집안에 형제·경쟁자·독립의 기운이 있었습니다. 어려서부터 스스로 해결해야 하는 환경이었거나, 또래 관계가 삶의 큰 변수였습니다.', 식상: '어릴 때부터 표현하고 만들고 움직이는 것이 자연스러웠습니다. 집안 분위기가 자유로웠거나, 반대로 억눌린 표현 욕구가 커졌습니다.', 재성: '현실과 돈을 일찍 의식한 환경입니다. 집안의 경제가 어린 시절의 큰 주제였고, 일찍 철이 들었을 가능성이 큽니다.', 관성: '규칙과 책임이 강한 집안입니다. 기대를 받고 자랐고, 그 기대가 자부심이자 부담이 됐습니다.', 인성: '보호와 교육이 두터운 뿌리입니다. 어른 덕이 있고 배움이 길지만, 그 그늘에서 독립이 늦어질 수 있습니다.' },
    월주: { 비겁: '사회생활에서 동료와 경쟁자가 늘 곁에 있습니다. 혼자 하는 일보다 함께 하는 일에서 성패가 갈리고, 동업과 돈 거래는 특히 신중해야 합니다.', 식상: '직업의 무대가 표현·생산·서비스입니다. 재능으로 먹고살 구조이며, 조직보다 자기 결과물로 평가받는 길이 맞습니다.', 재성: '사회 무대의 중심이 돈과 현실 성과입니다. 사업·영업·관리에서 두각을 나타내고, 몸을 혹사하며 버는 패턴을 조심해야 합니다.', 관성: '조직·직책·자격이 사회생활의 중심입니다. 책임지는 자리가 자꾸 오고, 승진과 평가에 운이 따르지만 압박도 큽니다.', 인성: '배움과 자격, 문서가 사회생활의 중심입니다. 전문성으로 인정받고, 준비가 길어지는 만큼 실행이 늦어지는 것을 경계해야 합니다.' },
    일주: { 비겁: '배우자 자리에 나와 같은 기운이 앉았습니다. 친구 같은 관계, 또는 주도권 다툼. 서로의 영역을 분명히 할 때 오래 갑니다.', 식상: '배우자 자리에 표현과 생산의 기운이 있습니다. 가정에서 활기와 재주가 돌고, 내가 베푸는 쪽이 되기 쉽습니다.', 재성: '배우자 자리에 현실과 재물의 기운이 있습니다. 결혼이 경제와 연결되고, 배우자가 실속 있는 사람일 가능성이 큽니다.', 관성: '배우자 자리에 책임과 규칙의 기운이 있습니다. 안정적인 가정을 만들지만, 서로에게 기준을 들이대면 숨이 막힙니다.', 인성: '배우자 자리에 보호와 수용의 기운이 있습니다. 나를 품어 주는 배우자 운이 있고, 가정이 쉼터가 됩니다.' },
    시주: { 비겁: '말년과 자녀 자리에 독립의 기운이 있습니다. 자녀가 일찍 독립하거나, 내가 말년까지 내 힘으로 서야 하는 구조입니다.', 식상: '말년과 자녀 자리에 표현과 생산이 있습니다. 자녀 덕이 있고, 나이 들수록 만들고 가르치는 일에서 보람을 찾습니다.', 재성: '말년과 자녀 자리에 재물이 있습니다. 후반부에 경제가 안정되는 흐름이고, 자녀와 돈이 얽힐 수 있습니다.', 관성: '말년과 자녀 자리에 책임과 명예가 있습니다. 늦게까지 역할이 주어지고, 자녀가 반듯한 길을 갑니다.', 인성: '말년과 자녀 자리에 배움과 쉼이 있습니다. 나이 들수록 공부하고 돌보는 삶, 자녀에게서 배우는 관계입니다.' },
  };
  const GOD_NUANCE = { 비견: '정면으로 서는 나', 겁재: '빼앗고 빼앗기는 경쟁', 식신: '느긋하게 만들어 내는 재주', 상관: '틀을 깨는 표현', 편재: '움직이는 돈과 큰 판', 정재: '차곡차곡 모으는 돈', 편관: '밀어붙이는 압박과 돌파', 정관: '반듯한 규칙과 명예', 편인: '남다른 사고와 고독', 정인: '어머니 같은 보호와 학문' };
  const BRANCH_FLAVOR = { 子: '한밤의 물, 쥐처럼 영리하고 쉼 없이 움직입니다', 丑: '언 땅의 소, 느리지만 끝까지 갑니다', 寅: '새벽 숲의 호랑이, 시작과 도전의 힘입니다', 卯: '봄 들판의 토끼, 부드럽고 민첩한 생명력입니다', 辰: '봄비 머금은 땅의 용, 변화와 포부입니다', 巳: '초여름의 뱀, 치밀하고 집요한 열기입니다', 午: '한낮의 말, 빠르고 뜨거운 추진입니다', 未: '늦여름 마른 땅의 양, 온화하지만 고집이 있습니다', 申: '초가을의 원숭이, 기민하고 재주가 많습니다', 酉: '가을 정점의 닭, 정확하고 까다롭습니다', 戌: '늦가을 마른 흙의 개, 충직하게 지키는 힘입니다', 亥: '초겨울 바다의 돼지, 넉넉하고 깊습니다' };

  const ELEMENT_BALANCE = {
    木: { 과다: '성장과 추진이 넘칩니다. 벌이는 일이 많고 멈추지 못하며, 간·근육·눈의 피로로 신호가 옵니다. 가지치기, 즉 하지 않을 일을 정하는 것이 과제입니다.', 적정: '성장의 힘이 적당히 있어 시작과 확장이 자연스럽습니다. 새로운 일 앞에서 굳지 않고 움직입니다.', 부족: '시작하는 힘과 유연함이 약합니다. 계획은 있는데 첫발이 늦고, 변화 앞에서 굳습니다. 새로운 것을 작게라도 매주 하나 시작하는 습관이 보완입니다.' },
    火: { 과다: '표현과 열정이 넘칩니다. 말이 앞서고 감정 기복이 크며, 심장·혈압·수면으로 신호가 옵니다. 식히는 시간, 침묵하는 연습이 과제입니다.', 적정: '표현과 온기가 적당해 사람을 끌어당깁니다. 뜨겁지도 차갑지도 않은 온도가 관계를 오래 가게 합니다.', 부족: '표현과 열정이 약합니다. 속은 있는데 드러나지 않아 차갑다는 오해를 받습니다. 몸을 데우는 운동과 의식적인 표현 연습이 보완입니다.' },
    土: { 과다: '안정과 수용이 넘칩니다. 변화를 미루고 쌓아 두며, 소화기·체중으로 신호가 옵니다. 비우기, 버리기, 떠나기가 과제입니다.', 적정: '중심이 잡혀 있어 흔들림이 적고 신뢰를 줍니다. 머무를 곳과 돌아올 곳이 분명합니다.', 부족: '중심과 안정이 약합니다. 쉽게 흔들리고 머무를 곳을 못 찾습니다. 루틴 하나와 돌아올 공간 하나를 고정하는 것이 보완입니다.' },
    金: { 과다: '결단과 원칙이 넘칩니다. 날카롭고 자르는 말이 많으며, 폐·피부·호흡으로 신호가 옵니다. 무뎌지는 연습, 봐주는 연습이 과제입니다.', 적정: '기준과 결단이 적당해 정리와 마무리가 됩니다. 끊을 것을 끊고 지킬 것을 지킵니다.', 부족: '결단과 마무리가 약합니다. 끊어야 할 것을 못 끊고 질질 끕니다. 마감과 기준을 외부에 걸어 두는 것이 보완입니다.' },
    水: { 과다: '지혜와 유연함이 넘칩니다. 생각이 너무 많아 불안으로 흐르고, 신장·방광·냉증으로 신호가 옵니다. 생각을 글로 꺼내 멈추는 연습이 과제입니다.', 적정: '사고와 적응이 적당해 흐름을 읽습니다. 쉬어야 할 때 쉬고 움직여야 할 때 움직입니다.', 부족: '유연함과 지혜의 저장고가 약합니다. 쉬지 못하고 배우기 전에 뛰어듭니다. 충분한 수면과 혼자 정리하는 시간이 보완입니다.' },
  };
  const ELEMENT_SYMBOL = { 木: '동쪽, 초록, 아침, 숲과 식물', 火: '남쪽, 붉은색, 한낮, 빛과 열', 土: '중앙, 노란색·황토색, 환절기, 땅과 그릇', 金: '서쪽, 흰색·금속색, 저녁, 쇠와 바위', 水: '북쪽, 검정·남색, 밤, 물과 소리' };

  const GROUP_BALANCE = {
    비겁: { 과다: '자아가 강하고 독립적입니다. 내 뜻대로 하려는 힘이 커서 리더가 되거나 외톨이가 됩니다. 동업·보증·돈 거래에서 손해 보는 자리이니, 벌 때는 혼자, 쓸 때는 함께가 원칙입니다.', 적정: '자기 중심이 있고 협력도 됩니다. 내 몫을 지키면서 남과 나눌 줄 압니다.', 부족: '나를 세우는 힘이 약합니다. 남에게 맞추다 지치고, 거절을 못 해 손해를 봅니다. 내 몫을 먼저 말하는 연습이 평생 과제입니다.' },
    식상: { 과다: '표현·생산·재주가 넘칩니다. 만들고 말하고 가르치는 데서 돈이 나오지만, 규칙을 깨는 힘이라 조직과 자주 부딪힙니다. 건강에서는 과로, 관계에서는 말실수가 약점입니다.', 적정: '표현과 생산이 적당해 재주가 돈으로 이어집니다. 말과 손이 생각을 따라갑니다.', 부족: '표현과 생산의 통로가 약합니다. 속은 가득한데 꺼내지 못하고, 성과를 설명하지 못해 저평가됩니다. 글·그림·기록 등 나에게 맞는 출력 통로를 하나 만드십시오.' },
    재성: { 과다: '현실과 돈이 삶의 중심입니다. 돈 냄새를 잘 맡고 기회를 잡지만, 재물이 일간을 소모시켜 몸이 지칩니다. 여성에게는 시댁·현실 문제, 남성에게는 이성 문제가 재물과 얽힙니다.', 적정: '돈을 다루는 감각이 적당히 있어 현실을 잘 꾸립니다. 벌고 쓰는 리듬이 있습니다.', 부족: '돈과 현실 결과에 대한 감각이 약합니다. 의미를 좇다 생활이 흔들리고, 돈이 들어와도 손에 남지 않습니다. 자동 저축과 가계부처럼 구조로 보완하십시오.' },
    관성: { 과다: '책임·규칙·압박이 삶의 중심입니다. 조직과 직책에서 인정받지만, 늘 평가받는 느낌에 시달립니다. 건강에서는 스트레스성 질환, 관계에서는 통제가 약점입니다.', 적정: '책임과 규칙이 적당해 사회적 신뢰를 얻습니다. 묶일 때 묶이고 풀릴 때 풀립니다.', 부족: '틀과 규칙이 약합니다. 자유롭지만 흐트러지기 쉽고, 조직 적응에 비용이 큽니다. 스스로 정한 작은 규칙 하나가 외부 규칙 열 개보다 낫습니다.' },
    인성: { 과다: '배움·생각·보호가 삶의 중심입니다. 지식과 자격이 자산이지만, 생각만 많고 실행이 늦습니다. 어머니와 윗사람의 영향이 크고, 게을러지기 쉬운 편안함이 약점입니다.', 적정: '배움과 회복의 힘이 적당해 지치면 다시 섭니다. 기댈 곳이 있고 혼자 서기도 합니다.', 부족: '배움·보호·회복의 통로가 약합니다. 쉬지 못하고, 기댈 어른이 없었거나 기대지 못했습니다. 멘토 한 명, 쉬는 날 하나를 의식적으로 확보하십시오.' },
  };
  const INTERACT = {
    비겁: { 식상: '힘은 넘치는데 쓸 통로가 없어 고집과 충돌로 새어 나갑니다. 만들고 표현하는 일을 억지로라도 붙이십시오.', 재성: '자존심은 강한데 돈이 안 붙습니다. 동업과 경쟁에 돈이 샙니다. 내 이름으로, 혼자 버는 구조가 맞습니다.', 관성: '나를 묶는 틀이 없어 자유롭지만 방향도 없습니다. 외부 마감과 멘토가 필요합니다.', 인성: '혼자 버티는데 회복이 안 됩니다. 쉼과 배움을 일정에 강제로 넣으십시오.' },
    식상: { 비겁: '재주는 많은데 나를 지키는 힘이 약해 남 좋은 일을 합니다. 계약서와 내 몫을 먼저 챙기십시오.', 재성: '만들기는 하는데 돈으로 못 바꿉니다. 파는 사람, 가격 매기는 구조가 필요합니다.', 관성: '틀을 깨는 힘만 있고 틀이 없어 조직과 자주 부딪힙니다. 규칙은 하나만, 대신 꼭 지키십시오.', 인성: '쏟아 내기만 하고 채우지 못합니다. 배움과 쉼이 없으면 재주가 고갈됩니다.' },
    재성: { 비겁: '돈은 따라오는데 몸이 못 버팁니다. 혼자 다 쥐려 하지 말고 사람에게 나누십시오.', 식상: '돈 감각은 있는데 만들어 내는 통로가 약해 남의 것을 굴립니다. 내 상품 하나를 만드십시오.', 관성: '벌 줄은 아는데 지킬 틀이 없어 새어 나갑니다. 장부와 규칙이 재물의 울타리입니다.', 인성: '현실에 매달려 배우고 쉴 틈이 없습니다. 일을 쉬어야 돈이 쉬지 않습니다.' },
    관성: { 비겁: '책임은 무거운데 버틸 힘이 약합니다. 거절과 위임을 배우지 않으면 몸이 먼저 무너집니다.', 식상: '규칙 안에서 성실하지만 내 표현이 없어 소모됩니다. 작은 창작 하나가 숨구멍입니다.', 재성: '명예와 책임은 있는데 실속이 없습니다. 보상을 먼저 묻는 연습이 필요합니다.', 인성: '압박만 있고 보호가 없어 번아웃이 옵니다. 기댈 사람과 쉬는 구조를 먼저 만드십시오.' },
    인성: { 비겁: '생각과 배움은 많은데 실행할 내 힘이 약합니다. 작게 시작하고 사람 앞에서 선언하십시오.', 식상: '입력만 있고 출력이 없습니다. 배운 것을 가르치고 팔아야 돈과 자신감이 생깁니다.', 재성: '공부는 길고 돈은 늦습니다. 자격을 수익으로 바꾸는 기한을 정하십시오.', 관성: '보호받는 데 익숙해 책임 앞에서 물러섭니다. 작은 직책 하나를 맡아 보십시오.' },
  };

  const LUCK_LONG = {
    비겁: '나와 같은 기운이 들어오는 시기입니다. 자립·독립·경쟁이 전면에 오고, 형제·친구·동료가 운의 변수가 됩니다. 혼자 결정하고 책임지는 일에는 유리하지만, 동업·보증·돈 거래는 손실이 나기 쉽습니다. 몸과 체력이 자산이니 건강 관리가 곧 재테크입니다.',
    식상: '표현·생산·새 시도의 시기입니다. 만들고 알리고 가르치는 일이 잘 풀리고, 아이디어가 돈이 됩니다. 반대로 규칙을 깨고 싶은 충동이 커져 조직과 마찰이 생기고, 말실수와 과로가 따라옵니다. 여성에게는 자녀·출산과 연결되는 기운입니다.',
    재성: '현실·결과·돈이 움직이는 시기입니다. 들어오는 만큼 나가고, 기회와 지출이 함께 커집니다. 구조를 먼저 만들고 벌어야 남습니다. 남성에게는 이성·결혼과 연결되고, 일간이 약하면 몸이 재물을 못 받쳐 지칩니다.',
    관성: '책임·규칙·평가의 시기입니다. 직책·시험·계약·결혼처럼 나를 묶는 일이 걸립니다. 일간이 강하면 명예와 승진으로, 약하면 압박과 건강 문제로 옵니다. 여성에게는 남편·이성과 연결되는 기운입니다.',
    인성: '학습·회복·준비의 시기입니다. 배우고 자격을 얻고 문서를 다루는 데 유리하고, 윗사람과 어머니의 도움이 있습니다. 실행은 느려지고 편안함에 안주하기 쉬우니, 결정을 미루지 않는 것이 과제입니다.',
  };
  const MONTH_GUIDE = { 비겁: '내 일에 집중. 돈 거래·보증 금지', 식상: '시작·발표·출시에 좋음. 말조심', 재성: '수입·거래·계약 추진. 지출 통제', 관성: '평가·시험·책임의 달. 건강 관리', 인성: '공부·준비·휴식. 결정은 미루지 말 것' };
  const PLAN_4W = {
    비겁: ['1주: 이번 주 받은 부탁 중 하나를 이유 없이 거절한다', '2주: 내가 원하는 것 세 가지를 종이에 적고 한 사람에게 말한다', '3주: 돈이 얽힌 관계 하나를 정리하거나 문서화한다', '4주: 혼자 결정하고 혼자 책임진 일 하나를 기록한다'],
    식상: ['1주: 매일 세 줄, 그날의 생각을 밖으로 꺼내 적는다', '2주: 내가 한 일 하나를 숫자 하나와 함께 누군가에게 설명한다', '3주: 글·그림·음성 중 하나로 만든 결과물을 공개한다', '4주: 성과를 한 장으로 정리해 보관한다'],
    재성: ['1주: 들어오는 돈의 20%를 자동 이체로 분리한다', '2주: 일주일 지출을 전부 적고 새는 항목 하나를 지운다', '3주: 내가 제공하는 것의 가격을 정하고 한 번 말해 본다', '4주: 한 달 수입·지출을 한 장으로 본다'],
    관성: ['1주: 지킬 규칙을 하나만 정한다(기상·마감·운동 중 하나)', '2주: 애매하게 끌어온 관계나 계약 하나에 기한을 통보한다', '3주: 책임이 몰리면 거절 대신 순서를 제안한다', '4주: 규칙 하나를 4주 지킨 기록을 남긴다'],
    인성: ['1주: 이번 주 하루는 아무 결정도 하지 않는 날로 비운다', '2주: 큰 결정 하나를 믿는 사람에게 먼저 말한다', '3주: 배워야 할 것을 검색 대신 사람에게 묻는다', '4주: 쉰 날과 배운 것을 기록해 다음 달 일정에 고정한다'],
  };

  const STRENGTH_TEXT = {
    신강: '일간을 돕는 기운(비겁·인성)이 많아 신강(身强)으로 봅니다. 쉽게 말해 자기 힘이 센 명식입니다. 힘이 세면 그 힘을 쓸 곳이 있어야 하므로, 식상(표현)·재성(현실)·관성(책임)처럼 힘을 빼고 쓰는 기운이 용신 후보가 됩니다.',
    중화: '돕는 기운과 빼는 기운이 비슷해 중화(中和)에 가깝습니다. 어느 한쪽으로 크게 기울지 않아 안정적이지만, 대운·세운이 들어올 때 균형이 쉽게 바뀌므로 흐름 읽기가 더 중요합니다.',
    신약: '일간을 돕는 기운이 적어 신약(身弱)으로 봅니다. 쉽게 말해 자기 힘보다 감당할 일이 많은 명식입니다. 인성(보호·배움)·비겁(동료·체력)처럼 나를 채우는 기운이 용신 후보가 됩니다.',
  };
  const SEASON = {
    봄: { branches: ['寅', '卯', '辰'], text: '봄에 태어나 목의 기운이 왕성합니다. 자라는 힘은 충분하니, 다듬는 금(金)과 꽃 피우는 화(火)가 조후상 반갑습니다.' },
    여름: { branches: ['巳', '午', '未'], text: '여름에 태어나 열기가 큽니다. 조후상 수(水)가 가장 반가운 기운이며, 물이 없으면 성급함과 소진이 반복됩니다.' },
    가을: { branches: ['申', '酉', '戌'], text: '가을에 태어나 금의 기운이 왕성합니다. 조후상 화(火)로 쇠를 다듬고 따뜻하게 하는 것이 필요합니다.' },
    겨울: { branches: ['亥', '子', '丑'], text: '겨울에 태어나 한기가 큽니다. 조후상 화(火)가 가장 반가운 기운이며, 불이 없으면 움츠러들고 결정이 늦어집니다.' },
  };
  const CLASH = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };
  const HAP6 = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
  const TRI = [{ set: ['申', '子', '辰'], elem: '水' }, { set: ['亥', '卯', '未'], elem: '木' }, { set: ['寅', '午', '戌'], elem: '火' }, { set: ['巳', '酉', '丑'], elem: '金' }];
  const HYEONG = [['寅', '巳', '申'], ['丑', '戌', '未'], ['子', '卯']];
  const POS_MEAN = { 년주: '조상·초년·집안', 월주: '부모·직장·사회', 일주: '배우자·가정·나 자신', 시주: '자녀·말년·결과물' };
  const GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const TEN_GOD_DESC = {
    비견: '비견은 나와 같은 오행, 같은 음양입니다. 주관·독립·자존심이고, 친구·형제·동료입니다. 많으면 고집과 경쟁이 되고 적당하면 뚝심이 됩니다. 돈을 나누는 자리에서는 손해를 보는 글자입니다.',
    겁재: '겁재는 나와 같은 오행, 다른 음양입니다. 승부욕과 추진력이지만 재물을 겁탈한다는 이름처럼 돈과 이성 문제에서 경쟁과 손실이 따릅니다. 잘 쓰면 위기에서 밀어붙이는 힘입니다.',
    식신: '식신은 내가 낳는 기운 중 같은 음양입니다. 먹을 복, 느긋한 재주, 꾸준한 생산입니다. 표현이 부드럽고 사람을 편하게 하며, 건강과 수명의 글자로도 봅니다.',
    상관: '상관은 내가 낳는 기운 중 다른 음양입니다. 날카로운 표현, 비판, 창의, 틀 깨기입니다. 규칙을 상하게 한다는 이름대로 조직과 부딪히지만, 예술·언변·기술에서는 천재성으로 나옵니다.',
    편재: '편재는 내가 다스리는 기운 중 같은 음양입니다. 큰돈, 유동 자산, 사업, 투기, 넓은 인맥입니다. 들어올 때 크게 들어오고 나갈 때도 크게 나갑니다. 남성에게는 아버지와 연인의 글자입니다.',
    정재: '정재는 내가 다스리는 기운 중 다른 음양입니다. 월급, 저축, 성실한 재물, 꼼꼼함입니다. 안정적이지만 인색해지기 쉽습니다. 남성에게는 아내의 글자입니다.',
    편관: '편관(칠살)은 나를 다스리는 기운 중 같은 음양입니다. 압박, 권력, 돌파, 카리스마입니다. 통제되면 큰 자리에 오르고, 통제되지 않으면 사고·질병·구설로 옵니다. 여성에게는 연인의 글자입니다.',
    정관: '정관은 나를 다스리는 기운 중 다른 음양입니다. 명예, 직장, 규칙, 품위입니다. 사회적 신뢰의 글자이며, 여성에게는 남편의 글자입니다. 많으면 억눌리고 없으면 자유롭지만 흐트러집니다.',
    편인: '편인은 나를 낳는 기운 중 같은 음양입니다. 남다른 사고, 전문 지식, 종교·철학·기술, 고독입니다. 밥그릇을 엎는 글자라고도 하지만, 한 분야를 깊게 파는 전문가의 글자입니다.',
    정인: '정인은 나를 낳는 기운 중 다른 음양입니다. 어머니, 학문, 자격, 문서, 보호입니다. 인복과 학운이지만 많으면 의존과 게으름이 됩니다.',
  };
  const STEM_HAP = { 甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙', 丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊' };
  const IFTHEN = {
    비겁: ['상대가 선택을 떠넘기면 → 24시간 안에 내 답을 먼저 말한다', '거절해야 할 부탁이 오면 → 이유 없이 "이번엔 어렵다"로 끝낸다', '혼자 결정이 두려우면 → 결정 기준 3개를 미리 적어 둔다'],
    식상: ['속에 할 말이 쌓이면 → 그날 밤 세 줄로 적어 상대에게 보낸다', '성과를 설명할 자리가 오면 → 숫자 하나와 사례 하나만 말한다', '표현이 막히면 → 글·그림·음성 중 하나로 바꿔 꺼낸다'],
    재성: ['돈이 들어오면 → 들어온 날 20%를 먼저 다른 계좌로 옮긴다', '큰 지출 충동이 오면 → 24시간 뒤 다시 본다', '가격 협상 자리에 서면 → 내 최저선을 미리 종이에 적는다'],
    관성: ['규칙이 흐트러지면 → 규칙을 하나로 줄이고 그것만 지킨다', '애매한 관계·계약이 길어지면 → 기한을 정하고 통보한다', '책임이 몰리면 → 거절 대신 "순서"를 제안한다'],
    인성: ['지쳤다고 느끼면 → 그 주에 하루는 아무 결정도 하지 않는다', '큰 결정 앞에 서면 → 믿는 사람 한 명에게 먼저 말한다', '배워야 할 게 생기면 → 혼자 검색 대신 사람에게 묻는다'],
  };
  const DONT = {
    비겁: ['동업·보증·공동 명의', '이기려고 시작하는 논쟁', '돈 빌려주고 기다리기'],
    식상: ['확인 없이 내뱉는 말', '동시에 세 가지 새 프로젝트', '규칙을 깨는 것으로 존재감 증명하기'],
    재성: ['들어온 돈 당일에 쓰기', '사람을 조건으로만 보기', '몸을 갈아 넣어 버는 구조 연장'],
    관성: ['거절 못 해 떠안은 책임 하나 더', '평가에 맞춰 나를 깎기', '건강 신호 무시하고 버티기'],
    인성: ['준비만 하고 시작 미루기', '밤에 내리는 결정', '편안한 자리에 안주해 기회 흘리기'],
  };
  const ORGAN = { 木: '간·담·눈·근육·목과 어깨', 火: '심장·소장·혈압·수면·혀', 土: '비장·위장·소화·체중·입', 金: '폐·대장·피부·호흡기·코', 水: '신장·방광·생식·귀·냉증' };
  const CAREER = { 비겁: '독립 전문직·프리랜스·스포츠·1인 사업', 식상: '제작·콘텐츠·교육·요식·예술·기술 개발', 재성: '영업·유통·금융·사업·부동산', 관성: '공공·법·행정·대기업·관리직·군경', 인성: '연구·교육·의료·자격 기반 전문직·출판' };

  // ───── 보조 계산 ─────
  function level(ratio, total) { if (ratio === 0) return '부족'; return ratio >= (total <= 6 ? 0.4 : 0.375) ? '과다' : '적정'; }
  function groupLevel(count, total) { if (count === 0) return '부족'; return count / total >= 0.4 ? '과다' : '적정'; }

  function strengthJudge(r) {
    const d = r.dayMaster.element; const helps = (el) => el === d || GEN[el] === d; // 같은 오행 또는 나를 생하는 오행
    let score = 0; const why = [];
    if (helps(r.month.branchElem)) { score += 2; why.push(`월지 ${r.month.branch}(${r.month.branchElem})가 일간을 돕습니다(득령)`); } else why.push(`월지 ${r.month.branch}(${r.month.branchElem})는 일간을 돕지 않습니다(실령)`);
    if (helps(r.day.branchElem)) { score += 1; why.push(`일지 ${r.day.branch}(${r.day.branchElem})가 일간을 받칩니다(득지)`); } else why.push(`일지 ${r.day.branch}(${r.day.branchElem})는 일간을 받치지 않습니다(실지)`);
    const others = r.pillars.flatMap(p => [p.name === '일주' ? null : p.stemElem, (p.name === '월주' || p.name === '일주') ? null : p.branchElem]).filter(Boolean);
    const helpers = others.filter(helps).length; score += helpers * 0.6;
    why.push(`나머지 글자 ${others.length}개 중 ${helpers}개가 일간을 돕습니다(득세)`);
    const label = score >= 3.2 ? '신강' : score <= 1.8 ? '신약' : '중화';
    const g = r.groups;
    let yongshin;
    if (label === '신강') { const c = ['식상', '재성', '관성'].sort((a, b) => g[a] - g[b]); yongshin = { groups: c, pick: c[0], why: '힘을 빼고 쓰는 세 기운 중 원국에서 가장 약한 것부터 보강' }; }
    else if (label === '신약') { const c = ['인성', '비겁'].sort((a, b) => g[a] - g[b]); yongshin = { groups: c, pick: c[0], why: '나를 채우는 두 기운 중 원국에서 가장 약한 것부터 보강' }; }
    else yongshin = { groups: [], pick: null, why: '중화에 가까우므로 억부보다 조후(계절 균형)를 우선' };
    const season = Object.keys(SEASON).find(k => SEASON[k].branches.includes(r.month.branch));
    return { label, score: Math.round(score * 10) / 10, why, yongshin, season, seasonText: SEASON[season].text };
  }

  // 특정 해의 12개 월주(절기 기준)와 절입일(KST)
  function monthPillarsOfYear(year) {
    const yp = S.yearPillarOf(year);
    const out = [];
    for (let k = 0; k < 12; k++) {
      const b = (2 + k) % 12; const deg = (315 + 30 * k) % 360;
      const approx = S.jdFromMs(Date.UTC(year, 1, 4)) + k * 30.44;
      const jd = S.solarTermJd(deg, approx, 20);
      const p = S.pillar(S.monthStemIdx(yp.stemIdx, b), b, '월운');
      p.startKST = jd ? new Date(S.msFromJd(jd) + 9 * 3600000) : null;
      out.push(p);
    }
    return out;
  }
  function fmtDate(d) { return d ? `${d.getUTCMonth() + 1}/${d.getUTCDate()}` : '-'; }

  function monthTable(r, year) {
    const dayIdx = r.day.stemIdx;
    return monthPillarsOfYear(year).map((p, i) => {
      const tg = S.tenGod(dayIdx, p.stemIdx), bg = S.tenGod(dayIdx, S.BRANCH_MAIN_STEM[p.branchIdx]);
      const clashes = [r.day, r.year, r.month].filter(x => CLASH[p.branch] === x.branch).map(x => x.name);
      let grade = '보통';
      if (clashes.length) grade = '주의'; else if (bg.group === '식상' || bg.group === '재성') grade = '추진'; else if (bg.group === '관성') grade = '점검';
      const label = `${p.branchKo}월(${fmtDate(p.startKST)}~)`;
      return { idx: i, label, pillar: p, stemGod: tg, branchGod: bg, clashes, grade, guide: MONTH_GUIDE[bg.group] };
    });
  }

  // ───── 리포트 조립 ─────
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const para = (...ps) => ps.filter(Boolean).map(p => `<p>${p}</p>`).join('');
  const fill = (tpl, ctx) => String(tpl || '').replace(/\{(\w+)\}/g, (_, k) => (ctx[k] != null ? ctx[k] : ''));

  function build(result, persona, ctx) {
    const r = result; const g = r.groups; const name = (ctx && ctx.name) || '당신';
    const dm = DAYMASTER[r.day.stem]; const st = strengthJudge(r);
    const nowY = r.seun[0].year, nextY = r.seun[1].year;
    const months = monthTable(r, nextY);
    const tctx = { name, dayKo: r.day.stemKo + r.dayMaster.elementKo, className: (ctx && ctx.className) || '', strong: r.strongestGroup, weak: r.weakestGroup, seunNext: nextY, year: nowY };
    const lead = (key) => persona && persona.lead && persona.lead[key] ? `<p class="lead-in">${fill(persona.lead[key], tctx)}</p>` : '';
    const sp = persona && persona.special;
    const sections = [];
    const add = (id, title, html) => sections.push({ id, title, html });

    // 1. 요약
    const cur = r.daeun && r.daeun.current;
    add('summary', '한눈에 보는 요약', lead('summary') + `<ul class="keylist">
      <li><b>일간</b> ${r.day.stemKo}${r.dayMaster.elementKo}(${r.day.stem}) · ${dm.image}</li>
      <li><b>가장 강한 기운</b> ${r.strongestGroup} ${g[r.strongestGroup]}/${r.tenGods.length} · <b>가장 약한 기운</b> ${r.weakestGroup} ${g[r.weakestGroup]}/${r.tenGods.length}</li>
      <li><b>오행</b> ${r.sortedElems[0]}(${S.ELEM_KO[r.sortedElems[0]]}) ${r.elements[r.sortedElems[0]]}개로 가장 많고 ${r.sortedElems[4]}(${S.ELEM_KO[r.sortedElems[4]]}) ${r.elements[r.sortedElems[4]]}개로 가장 적음</li>
      <li><b>신강·신약(간이)</b> ${st.label} · 계절 ${st.season}생</li>
      <li><b>현재 대운</b> ${cur ? `${cur.ko}(${cur.hanja}) 만 ${cur.fromAge}~${cur.toAge}세 · ${cur.tenGod.group}` : '대운 진입 전'}</li>
      <li><b>${nextY}년 세운</b> ${r.seun[1].ko}(${r.seun[1].hanja}) · ${r.seun[1].tenGod.name}·${r.seun[1].branchTenGod.name}</li>
      <li><b>${nextY}년 주의할 달</b> ${months.filter(m => m.grade === '주의').map(m => m.label.split('(')[0]).join(', ') || '없음'} · <b>밀어붙일 달</b> ${months.filter(m => m.grade === '추진').map(m => m.label.split('(')[0]).join(', ') || '없음'}</li>
    </ul>`);

    // 2. 일간 심층
    add('daymaster', `일간 심층: ${dm.name}, ${dm.image}`, lead('daymaster') + para(dm.core, `<b>강점.</b> ${dm.strength}`, `<b>그림자.</b> ${dm.shadow}`, `<b>관계 방식.</b> ${dm.relation}`, `<b>일하는 방식.</b> ${dm.work}`));

    // 3. 네 기둥
    const pillarsHtml = r.pillars.map(p => {
      const role = PILLAR_ROLE[p.name];
      const tg = r.tenGods.find(t => t.at === p.name + ' 천간'); const bg = r.tenGods.find(t => t.at === p.name + ' 지지');
      const stemLine = p.name === '일주' ? `천간 ${p.stem}은(는) 나 자신, 일간입니다.` : `천간 ${p.stem}(${tg.name}, ${GOD_NUANCE[tg.name]})과 `;
      const branchLine = `지지 ${p.branch}(${bg.name}, ${GOD_NUANCE[bg.name]}). ${BRANCH_FLAVOR[p.branch]}.`;
      return `<div class="pblock"><h5>${p.name} ${p.hanja} <small>${p.ko} · ${role.role}</small></h5>${para(role.desc, (p.name === '일주' ? stemLine + ' ' : stemLine) + branchLine, PILLAR_GOD[p.name][bg.group])}</div>`;
    }).join('');
    add('pillars', '원국 네 기둥 읽기', lead('pillars') + pillarsHtml);

    // 3-2. 원국에 있는 십신
    const present = []; r.tenGods.forEach(t => { if (!present.includes(t.name)) present.push(t.name); });
    add('gods', '원국에 있는 십신 하나씩', lead('gods') + present.map(nm => { const where = r.tenGods.filter(t => t.name === nm).map(t => t.at).join(', '); return `<div class="eblock"><h5>${nm} <small>${GOD_NUANCE[nm]} · ${where}</small></h5>${para(TEN_GOD_DESC[nm])}</div>`; }).join('') + para(`원국에 없는 십신: ${Object.keys(TEN_GOD_DESC).filter(n => !present.includes(n)).join(', ') || '없음'}. 없는 글자는 결핍이 아니라, 대운·세운으로 들어올 때 낯설게 크게 느껴지는 주제입니다.`));

    // 3-3. 지지 관계
    const br = r.pillars.map(p => ({ b: p.branch, name: p.name }));
    const rel = [];
    for (let i = 0; i < br.length; i++) for (let j = i + 1; j < br.length; j++) {
      const a = br[i], b = br[j];
      if (CLASH[a.b] === b.b) rel.push(`<b>${a.name} ${a.b} ↔ ${b.name} ${b.b} 충.</b> 충은 부딪혀 움직이는 힘입니다. ${POS_MEAN[a.name]}과 ${POS_MEAN[b.name]} 영역에서 변동·이동·갈등이 반복되기 쉽고, 그만큼 머물지 않고 바꾸는 힘이 됩니다.`);
      if (HAP6[a.b] === b.b) rel.push(`<b>${a.name} ${a.b} + ${b.name} ${b.b} 육합.</b> 합은 묶이고 끌리는 힘입니다. ${POS_MEAN[a.name]}과 ${POS_MEAN[b.name]}이 서로 얽혀, 좋게는 결속이고 나쁘게는 발이 묶이는 것입니다.`);
    }
    TRI.forEach(t => { const have = br.filter(x => t.set.includes(x.b)); const uniq = [...new Set(have.map(x => x.b))]; if (uniq.length >= 2) rel.push(`<b>${have.map(x => x.name + ' ' + x.b).join(', ')} → ${t.elem} ${uniq.length === 3 ? '삼합' : '반합'}.</b> 원국 안에 ${t.elem}(${S.ELEM_KO[t.elem]})의 기운이 하나로 뭉치는 자리가 있어, ${t.elem} 관련 십신의 영향이 글자 수보다 큽니다.`); });
    HYEONG.forEach(h => { const have = br.filter(x => h.includes(x.b)); const uniq = [...new Set(have.map(x => x.b))]; if (uniq.length >= 2) rel.push(`<b>${have.map(x => x.name + ' ' + x.b).join(', ')} 형(刑).</b> 형은 다듬어지는 과정의 고통, 법·수술·구설과 연결되는 관계입니다. 자기 수양과 전문 기술로 쓰면 오히려 권위가 됩니다.`); });
    add('relations', '지지 사이의 충·합·형', lead('relations') + (rel.length ? para(...rel) : para('원국 지지 사이에 뚜렷한 충·합·형이 없습니다. 안정적이지만 자극이 적어, 대운·세운에서 오는 충이 상대적으로 크게 느껴집니다.')) + para(`<span class="muted">충 ${Object.keys(CLASH).length / 2}쌍, 육합 6쌍, 삼합 4조, 형 3조의 기본 관계만 봅니다. 방합·암합·원진은 운영 버전에서 추가합니다.</span>`));

    // 4. 오행 균형
    const elemHtml = S.ELEMENTS.map(e => { const lv = level(r.elements[e] / r.totalChars, r.totalChars); return `<div class="eblock"><h5><span class="el-${e}">${e}</span> ${S.ELEM_KO[e]} ${r.elements[e]}개 · <small>${lv}</small></h5>${para(ELEMENT_BALANCE[e][lv])}</div>`; }).join('');
    const lacking = S.ELEMENTS.filter(e => r.elements[e] === 0);
    add('elements', '오행 균형과 조후', lead('elements') + elemHtml + para(`<b>조후.</b> ${st.seasonText}`, lacking.length ? `<b>비어 있는 오행.</b> ${lacking.map(e => `${e}(${S.ELEM_KO[e]})`).join(', ')}. 전통적으로 ${lacking.map(e => ELEMENT_SYMBOL[e]).join(' / ')}에 해당하는 환경·색·시간대를 생활에 두는 것을 권합니다. 상징적 보완이며 효과를 보장하는 처방은 아닙니다.` : '다섯 오행이 모두 있어 특정 기운이 통째로 비지는 않았습니다. 균형보다 비율이 문제이니 과다한 쪽을 덜어 내는 것이 우선입니다.'));

    // 4-2. 몸의 신호
    const over = S.ELEMENTS.filter(e => level(r.elements[e] / r.totalChars, r.totalChars) === '과다');
    const under = S.ELEMENTS.filter(e => r.elements[e] === 0);
    add('health', '몸의 신호 (오행 배속, 전통 관점)', lead('health') + para(
      `일간 ${r.day.stem}은(는) ${r.dayMaster.element}(${S.ELEM_KO[r.dayMaster.element]})이므로 몸의 기준점은 ${ORGAN[r.dayMaster.element]} 계통입니다. 지치면 이쪽에서 먼저 신호가 옵니다.`,
      over.length ? `<b>과다한 오행.</b> ${over.map(e => `${e}(${S.ELEM_KO[e]}) → ${ORGAN[e]} 쪽 과열·과사용`).join(' / ')}.` : '',
      under.length ? `<b>비어 있는 오행.</b> ${under.map(e => `${e}(${S.ELEM_KO[e]}) → ${ORGAN[e]} 쪽 허약·소홀`).join(' / ')}.` : '',
      `${st.seasonText.split('.')[0]}. 계절의 치우침은 체질의 치우침으로도 읽습니다.`,
      `<span class="muted">오행과 장부의 대응은 전통 명리의 배속이며 의학적 진단이 아닙니다. 증상이 있으면 병원이 먼저입니다.</span>`));

    // 5. 십신 구조
    const tot = r.tenGods.length;
    const groupHtml = S.TEN_GOD_GROUPS.map(gr => { const lv = groupLevel(g[gr], tot); return `<div class="eblock"><h5>${gr} ${g[gr]}/${tot} · <small>${lv}</small></h5>${para(GROUP_BALANCE[gr][lv])}</div>`; }).join('');
    add('tengods', '십신 구조: 나를 움직이는 다섯 힘', lead('tengods') + groupHtml + para(`<b>${r.strongestGroup}이 넘치고 ${r.weakestGroup}이 비어 있는 구조.</b> ${INTERACT[r.strongestGroup][r.weakestGroup]}`));

    // 6. 신강·신약
    const mg = r.tenGods.find(t => t.at === '월주 지지'); const gyeok = mg.name === '비견' ? '건록격' : mg.name === '겁재' ? '양인격' : mg.name + '격';
    add('strength', `신강·신약, 격, 용신 후보 (간이 판정)`, lead('strength') + para(`<b>격(간이).</b> 월지 ${r.month.branch}의 본기는 ${S.STEMS[S.BRANCH_MAIN_STEM[r.month.branchIdx]]}, 일간 기준 ${mg.name}이므로 <b>${gyeok}</b>으로 봅니다. 격은 명식의 직업적 틀입니다. ${GOD_NUANCE[mg.name]}의 무대에서 살아갈 가능성이 크고, ${TEN_GOD_DESC[mg.name].split('.').slice(1, 3).join('.')}.`, `<b>${st.label}</b> (점수 ${st.score}/6). ${STRENGTH_TEXT[st.label]}`, `<b>판정 근거.</b> ${st.why.join('. ')}.`, st.yongshin.pick ? `<b>용신 후보.</b> ${st.yongshin.groups.join(' → ')} 순으로 검토하며, 1순위는 <b>${st.yongshin.pick}</b>입니다. ${st.yongshin.why}. ${GROUP_BALANCE[st.yongshin.pick]['부족'].split('.')[0]}.` : `<b>용신 후보.</b> ${st.yongshin.why}. ${st.seasonText}`, `<span class="muted">이 판정은 득령·득지·득세를 단순 점수화한 간이 방식입니다. 지장간·합충·격국을 반영한 정식 판정은 전문가 감수가 필요합니다.</span>`));

    // 7. 대운
    let daeunHtml = '';
    if (r.daeun) {
      const rows = r.daeun.list.map(p => `<tr class="${cur && p.index60 === cur.index60 ? 'now' : ''}"><td>${p.fromAge}~${p.toAge}세</td><td><span class="el-${p.stemElem}">${p.stem}</span><span class="el-${p.branchElem}">${p.branch}</span> ${p.ko}</td><td>${p.tenGod.name}·${p.branchTenGod.name}</td></tr>`).join('');
      const nextD = cur ? r.daeun.list[r.daeun.list.indexOf(cur) + 1] : r.daeun.list[0];
      const edge = cur && (r.daeun.ageYears >= cur.toAge - 1 || r.daeun.ageYears <= cur.fromAge + 1);
      const story = `<ol class="timeline">${r.daeun.list.map(p => `<li class="${cur && p.index60 === cur.index60 ? 'now' : ''}"><b>${p.fromAge}~${p.toAge}세 ${p.ko}</b> ${LUCK_LONG[p.tenGod.group].split('.')[0]}. 지지는 ${p.branchTenGod.group}의 색.${[r.day, r.year, r.month].some(x => CLASH[p.branch] === x.branch) ? ' 원국과 충하는 대운이라 이 10년은 이동·변동이 큽니다.' : ''}</li>`).join('')}</ol>`;
      daeunHtml = `<div class="tablewrap"><table class="gods"><thead><tr><th>만 나이</th><th>대운</th><th>천간·지지 십신</th></tr></thead><tbody>${rows}</tbody></table></div>` + story +
        para(`대운수 ${r.daeun.startAge}, ${r.daeun.forward ? '순행' : '역행'}. 현재 만 ${r.daeun.ageYears}세.`,
          cur ? `<b>현재 대운 ${cur.ko}(${cur.hanja}), 만 ${cur.fromAge}~${cur.toAge}세.</b> 천간은 ${cur.tenGod.name}, 지지는 ${cur.branchTenGod.name}. ${LUCK_LONG[cur.tenGod.group]} 지지 쪽으로는 ${LUCK_LONG[cur.branchTenGod.group].split('.')[0]}.` : `아직 첫 대운에 들어가기 전입니다. 이 시기는 월주의 기운이 대운을 대신합니다.`,
          nextD ? `<b>다음 대운 ${nextD.ko}(${nextD.hanja}), 만 ${nextD.fromAge}~${nextD.toAge}세.</b> ${LUCK_LONG[nextD.tenGod.group]}` : '',
          edge ? `<b>전환기.</b> 지금은 대운이 바뀌는 경계 2년 안에 있습니다. 이 시기에는 환경·직업·관계가 함께 흔들리는 경우가 많으니, 큰 결정은 바뀐 대운의 첫해를 지나 보고 하는 것이 안전합니다.` : '');
    }
    add('daeun', '대운: 10년 단위의 계절', lead('daeun') + daeunHtml);

    // 8. 세운
    const seunHtml = r.seun.map(sy => para(`<b>${sy.year}년 ${sy.ko}(${sy.hanja}).</b> 천간 ${sy.tenGod.name}, 지지 ${sy.branchTenGod.name}. ${LUCK_LONG[sy.tenGod.group]}`, sy.tenGod.group !== sy.branchTenGod.group ? `지지 쪽은 ${sy.branchTenGod.group}의 기운이라 ${LUCK_LONG[sy.branchTenGod.group].split('.')[0]}. 상반기는 천간, 하반기는 지지의 색이 짙어지는 경향으로 읽습니다.` : '천간과 지지가 같은 그룹이라 한 해 내내 같은 주제가 반복됩니다.', [r.day, r.year].some(x => CLASH[sy.branch] === x.branch) ? `<b>충.</b> ${sy.year}년 지지 ${sy.branch}는 원국의 ${[r.day, r.year].filter(x => CLASH[sy.branch] === x.branch).map(x => x.name + ' ' + x.branch).join(', ')}와 충합니다. 이사·이직·관계 변동이 생기기 쉬운 해이니, 변동 자체를 막기보다 변동의 방향을 내가 정하십시오.` : '')).join('');
    add('seun', `세운: ${nowY}년과 ${nextY}년`, lead('seun') + seunHtml);

    // 9. 월별
    const mrows = months.map(m => `<tr class="g-${m.grade}"><td>${m.label}</td><td><span class="el-${m.pillar.stemElem}">${m.pillar.stem}</span><span class="el-${m.pillar.branchElem}">${m.pillar.branch}</span></td><td>${m.stemGod.name}·${m.branchGod.name}</td><td><b>${m.grade}</b>${m.clashes.length ? ` <small>(${m.clashes.join('·')} 충)</small>` : ''}</td><td>${m.guide}</td></tr>`).join('');
    const nowMs = (ctx && ctx.now ? new Date(ctx.now) : new Date()).getTime();
    const restThis = monthTable(r, nowY).filter(m => m.pillar.startKST && m.pillar.startKST.getTime() + 31 * 86400000 >= nowMs);
    const restRows = restThis.map(m => `<tr class="g-${m.grade}"><td>${nowY} ${m.label}</td><td><span class="el-${m.pillar.stemElem}">${m.pillar.stem}</span><span class="el-${m.pillar.branchElem}">${m.pillar.branch}</span></td><td>${m.stemGod.name}·${m.branchGod.name}</td><td><b>${m.grade}</b></td><td>${m.guide}</td></tr>`).join('');
    add('months', `${nextY}년 열두 달 흐름표`, lead('months') + `<div class="tablewrap"><table class="gods months"><thead><tr><th>달(절기)</th><th>월운</th><th>십신</th><th>등급</th><th>지침</th></tr></thead><tbody>${mrows}</tbody></table></div>` + (restRows ? `<p class="muted" style="margin-top:10px">${nowY}년 남은 달</p><div class="tablewrap"><table class="gods months"><tbody>${restRows}</tbody></table></div>` : '') + para(`등급은 지지 십신과 원국과의 충을 기준으로 한 단순 분류입니다. <b>추진</b>은 식상·재성이 들어와 시작과 수입에 유리한 달, <b>점검</b>은 관성이 들어와 평가·책임·건강을 살필 달, <b>주의</b>는 원국의 일지·년지·월지와 충하는 달입니다. 달의 경계는 양력 1일이 아니라 절기(절입일)입니다.`));

    // 9-2. 배우자성
    const spouseGroup = r.input.gender === 'M' ? '재성' : '관성';
    const spouseMain = r.input.gender === 'M' ? '정재' : '정관', spouseSub = r.input.gender === 'M' ? '편재' : '편관';
    const spouseHits = r.tenGods.filter(t => t.group === spouseGroup);
    const dayBranchGod = r.tenGods.find(t => t.at === '일주 지지');
    const spouseMonths = months.filter(m => m.branchGod.group === spouseGroup || m.stemGod.group === spouseGroup).map(m => m.label.split('(')[0]);
    add('spouse', '배우자 자리와 배우자성', lead('spouse') + para(
      `${r.input.gender === 'M' ? '남성' : '여성'} 명식에서 배우자성은 <b>${spouseGroup}</b>(${spouseMain}은 배우자, ${spouseSub}은 연인·두 번째 인연)입니다.`,
      spouseHits.length ? `원국에 ${spouseGroup}이 ${spouseHits.length}개 있습니다: ${spouseHits.map(t => `${t.at} ${t.char}(${t.name})`).join(', ')}. ${spouseHits.length >= 3 ? '배우자성이 많으면 인연이 여럿이거나 관계에서 소모가 큽니다. 고르는 기준을 먼저 세워야 합니다.' : spouseHits.length === 1 ? '하나 있는 배우자성은 한 사람에게 집중하는 구조입니다. 그 자리가 어디인지가 인연의 성격을 말해 줍니다.' : '둘 있는 배우자성은 선택의 구조입니다. 비교하다 놓치지 않도록 기한을 두십시오.'} 자리의 뜻: ${spouseHits.map(t => POS_MEAN[t.at.split(' ')[0]]).join(' / ')}.` : `원국에 ${spouseGroup}이 드러나 있지 않습니다. 인연이 없다는 뜻이 아니라, 대운·세운에서 ${spouseGroup}이 들어올 때 인연이 움직인다는 뜻입니다. 평소에는 상대를 고르는 기준이 흐릿할 수 있습니다.`,
      `<b>배우자 자리(일지) ${r.day.branch}.</b> ${dayBranchGod.name}이 앉아 있습니다. ${PILLAR_GOD['일주'][dayBranchGod.group]} ${BRANCH_FLAVOR[r.day.branch]}.`,
      `<b>잘 맞는 글자(간이).</b> 일간 ${r.day.stem}과 천간합을 이루는 일간은 ${STEM_HAP[r.day.stem]}, 일지 ${r.day.branch}와 육합하는 일지는 ${HAP6[r.day.branch]}입니다. 상대의 일주에 이 글자가 있으면 끌림이 빠르고, 반대로 일지 ${CLASH[r.day.branch]}를 가진 상대와는 부딪히며 배웁니다. 궁합은 두 명식을 맞붙여야 정확하고, 이것은 입구만 보는 것입니다.`,
      `<b>${nextY}년 ${spouseGroup}이 들어오는 달.</b> ${spouseMonths.length ? spouseMonths.join(', ') : '뚜렷한 달이 없습니다'}. 만남·결혼·관계의 결정은 이 달들을 기준으로 보되, 충하는 달(흐름표의 주의)은 피하십시오.`));

    // 9-3. 직업 적성
    const top = r.sortedGroups;
    add('career', '일의 형태: 십신 비율로 보는 적성', lead('career') + para(
      `십신 비율은 ${top.map(k => `${k} ${g[k]}`).join(' > ')}입니다. 1순위 직군은 <b>${CAREER[top[0]]}</b>, 2순위는 <b>${CAREER[top[1]]}</b>입니다.`,
      `일간 성향과 합치면: ${dm.work}`,
      `격이 ${gyeok}이므로 ${GOD_NUANCE[mg.name]}의 성격이 강한 무대가 오래 갑니다.`,
      `<b>피해야 할 환경.</b> ${r.weakestGroup}이 비어 있어 ${CAREER[r.weakestGroup]} 쪽 환경에서는 적응 비용이 큽니다. 가야 한다면 그 기운을 가진 파트너와 함께 가십시오.`,
      st.yongshin.pick ? `용신 후보가 ${st.yongshin.pick}이므로, 장기적으로는 ${CAREER[st.yongshin.pick]} 방향이 명식을 보완합니다.` : ''));

    // 10. 고민 특화
    if (sp) {
      const focusMonths = sp.focus ? months.filter(m => sp.focus(r, m)).map(m => m.label.split('(')[0]) : [];
      add('special', fill(sp.title || '{name}의 고민에 답하기', tctx), lead('special') + para(fill(sp.intro, tctx), fill(sp.byElem[r.dayMaster.element], tctx), fill(sp.byStrong[r.strongestGroup], tctx), fill(sp.byWeak[r.weakestGroup], tctx), sp.focusLabel ? `<b>${fill(sp.focusLabel, tctx)}</b> ${focusMonths.length ? focusMonths.join(', ') : '뚜렷한 달이 없습니다. 대신 위 흐름표의 추진 달을 쓰십시오.'}. ${fill(sp.monthsNote || '', tctx)}` : ''));
    }

    // 11. 실행 계획
    add('plan', `약한 자리를 메우는 4주 계획`, lead('plan') + para(`가장 약한 기운은 <b>${r.weakestGroup}</b>입니다. ${GROUP_BALANCE[r.weakestGroup]['부족']}`) + `<p><b>상황별 if-then 3개</b></p><ol class="ifthen">${IFTHEN[r.weakestGroup].map(s => `<li>${s}</li>`).join('')}</ol>` + `<p><b>4주 과제</b></p><ol class="ifthen">${PLAN_4W[r.weakestGroup].map(s => `<li>${s}</li>`).join('')}</ol>` + para(`<b>넘치는 ${r.strongestGroup}이 만드는, 하지 말아야 할 것 세 가지.</b> ${DONT[r.strongestGroup].join(' / ')}.`) + para(`계획은 명식을 바꾸지 않습니다. 명식이 만드는 반복을 알아차리는 속도를 바꿉니다. 4주 뒤 같은 상황에서 다른 선택을 한 번이라도 했다면 이 리포트는 값을 했습니다.`));

    // 12. 맺음
    add('closing', '맺음말과 계산 기준', (sp && sp.closing ? para(fill(sp.closing, tctx)) : '') + para(`<span class="muted">계산 기준: 년주 경계 입춘, 월주 경계 12절기(태양 황경, 천문 근사식), 일주 (율리우스일수+49) mod 60, 23시 이후 익일 일주, 진태양시 보정 ${r.input.solarCorrectionMin || 0}분. 절입 ${r.terms.prev ? new Date(Date.parse(r.terms.prev) + 9 * 3600000).toISOString().slice(0, 16).replace('T', ' ') : '-'} ~ ${r.terms.next ? new Date(Date.parse(r.terms.next) + 9 * 3600000).toISOString().slice(0, 16).replace('T', ' ') : '-'} KST. 이 풀이는 참고용 콘텐츠이며 의학·법률·금융 조언이 아닙니다.</span>`));

    const text = sections.map(s => s.title + ' ' + s.html.replace(/<[^>]+>/g, ' ')).join(' ').replace(/\s+/g, ' ');
    const chars = text.replace(/\s/g, '').length;
    return { sections, chars, screens: Math.round(chars / 450), strength: st, months };
  }

  return { TEN_GOD_DESC, ORGAN, CAREER, IFTHEN, DONT, STEM_HAP, DAYMASTER, PILLAR_ROLE, PILLAR_GOD, GOD_NUANCE, BRANCH_FLAVOR, ELEMENT_BALANCE, GROUP_BALANCE, INTERACT, LUCK_LONG, MONTH_GUIDE, PLAN_4W, STRENGTH_TEXT, SEASON, CLASH, strengthJudge, monthPillarsOfYear, monthTable, build };
});
