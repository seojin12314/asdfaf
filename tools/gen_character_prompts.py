# -*- coding: utf-8 -*-
"""사주도감 캐릭터 컨셉 + 장면별 이미지 생성 프롬프트 조립기.
실행: python3 tools/gen_character_prompts.py > docs/character-prompts.md
공통 스타일 블록 + 캐릭터 앵커 + 장면 지시를 한 곳에서 조립해 42장 이상의 프롬프트가 서로 어긋나지 않게 한다."""

STYLE = ("Korean webtoon-style character illustration, clean cel shading with two-tone shadows, "
         "key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, "
         "clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, "
         "eye-level camera, centered composition, looking at the viewer, "
         "plain transparent background, no background scenery, no text, no letters, no logo, no watermark.")

NEG = "Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur."

CHARS = [
 dict(id="flame", name="홍염의 여신", role="연애·재회·궁합", accent="#ff6f5e",
  concept_ko=["20대 후반 여성 신격. 사랑을 '지키는' 신이 아니라 '꿰뚫어 보는' 신.",
    "머리: 검붉은 긴 머리, 끝이 불씨처럼 흩날리며 코랄빛으로 옅어짐.", "눈: 코랄 레드 홍채, 눈꼬리 올라감, 한쪽 입꼬리를 올린 도발적 미소가 기본 표정.",
    "의상: 현대적으로 재해석한 검붉은 한복 드레스(한쪽 어깨 비대칭, 치맛자락에 불씨 자수), 금색 이어커프.",
    "소품: 왼 손목에 감긴 붉은 실(인연의 실), 오른 손끝의 작은 불꽃.", "포즈 습관: 한 손 허리, 다른 손으로 불꽃을 보여 주듯 들어 올림.", "금지: 과한 노출, 공포스러운 분위기, 서양식 악마 뿔."],
  anchor=("a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, "
          "coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder "
          "and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; "
          "accent color coral red #ff6f5e on her eyes, flame and embroidery"),
  pose_full="standing three-quarter view facing slightly left, left hand on her hip, right hand raised chest-high showing the small flame, weight on one leg, hair drifting",
  pose_card="half-body from the waist up, placed in the right third of the frame, turned toward the empty left side, holding the flame up as if lighting the blank space",
  expr=dict(neutral="confident one-sided smirk, eyes half-lidded", smile="warm open smile with raised eyebrow, flame glowing brighter", serious="narrowed eyes, lips closed, warning look, embers in her hair flaring", talk="mouth slightly open mid-sentence as if telling a secret"),
  emblem="a single stylized flame with a smaller pale inner flame, two-tone coral red and off-white, flat vector style, centered, no face",
  idle="hair embers drift upward slowly, the fingertip flame flickers, she breathes gently, a faint smirk settles",
  bg="dark crimson haze with slow-rising ember particles and a soft warm glow at the bottom center, no figures"),
 dict(id="sage", name="도사님", role="돈·사업·직업", accent="#e2b74f",
  concept_ko=["70대 남성 도사. 재물의 신이 아니라 '돈이 새는 자리'를 아는 산속 노인.",
    "머리: 상투에 작은 흑립(갓), 흰 눈썹이 길고 흰 수염이 가슴까지.", "눈: 거의 감은 듯 웃는 눈, 눈가 주름 깊음. 기본 표정은 '허허' 웃음.",
    "의상: 낡아 보이는 황토색 도포, 소매가 넓음, 허리끈에 엽전 꿰미.", "소품: 엽전 문양이 그려진 큰 부채, 허리의 호리병.", "포즈 습관: 부채로 입을 반쯤 가리거나, 엽전 하나를 손가락으로 튕김.", "금지: 담뱃대(흡연 이미지), 무서운 산신령, 중국풍 도교 복식."],
  anchor=("a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, "
          "eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, "
          "holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim"),
  pose_full="standing three-quarter view facing slightly left, fan half-open in his right hand near his chin, left hand flicking a single brass coin into the air",
  pose_card="seated cross-legged from the waist up, placed in the right third, fan resting on his knee, one coin balanced on his fingertip toward the empty left side",
  expr=dict(neutral="eyes nearly closed, gentle knowing chuckle", smile="wide hearty laugh, head tilted back slightly, beard shaking", serious="eyes open for once, sharp and clear, fan closed and pointed forward", talk="mouth open mid-chuckle, one eyebrow lifted"),
  emblem="a single old brass coin with a square hole, two small bamboo leaves crossing behind it, flat vector style, two-tone gold and dark navy, centered",
  idle="the fan sways slowly, the coin spins on his fingertip, his beard moves with a slow breath, eyes crinkle",
  bg="misty mountain haze in deep navy with floating gold coin glints and a warm glow low in the frame, no figures"),
 dict(id="granny", name="할머니", role="한 해·가족·인생 흐름", accent="#b9a3ff",
  concept_ko=["70대 여성. 무서운 점쟁이가 아니라 손을 잡아 주는 외할머니.",
    "머리: 은백색 쪽진 머리, 비녀 하나.", "눈: 주름진 눈웃음, 돋보기 안경을 목에 걸고 있음(쓰지 않음).",
    "의상: 연보라 누비 한복 조끼 + 회색 치마, 무릎 위 손뜨개 담요.", "소품: 손바닥만 한 달 모양 등불(보라빛), 손목의 묵주 같은 나무 염주.", "포즈 습관: 두 손을 앞으로 내밀어 상대 손을 잡으려는 제스처.", "금지: 쇠약하거나 슬픈 분위기, 무당 복식, 방울·칼."],
  anchor=("a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, "
          "reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, "
          "holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow"),
  pose_full="standing three-quarter view facing slightly left, both hands extended forward gently as if about to take the viewer's hands, the moon lantern hanging from her left wrist",
  pose_card="half-body from the waist up, placed in the right third, leaning toward the empty left side, offering the glowing moon lantern with both hands",
  expr=dict(neutral="soft crinkled smile, eyes warm", smile="eyes closed in a wide affectionate laugh, cheeks lifted", serious="brows gently furrowed with concern, lips pressed, eyes still kind", talk="mouth slightly open as if saying a soothing word, head tilted"),
  emblem="a crescent moon with one small star beside it, flat vector style, two-tone lavender and deep indigo, centered",
  idle="the moon lantern glows in a slow pulse, she nods slightly, the blanket edge moves, eyes blink softly",
  bg="deep indigo night with soft violet moonlight from the upper left and drifting fireflies, no figures"),
 dict(id="child", name="애기동자", role="자녀·기질", accent="#ff9ab5",
  concept_ko=["5~6세 동자(남아). 신령스러운 아이. 무섭지 않고 신나 있음.",
    "머리: 양 갈래로 땋아 올린 댕기머리, 이마에 잔머리.", "눈: 크고 반짝이는 눈, 볼에 홍조, 기본 표정은 입 벌린 신난 웃음.",
    "의상: 연분홍 색동저고리(소매 줄무늬), 흰 바지, 꽃신.", "소품: 품에 안은 분홍 연꽃 등, 머리 위에 작은 별 하나가 떠 있음.", "포즈 습관: 발뒤꿈치 들고 검지로 무언가를 가리키며 외침.", "금지: 공포 동자 이미지, 노출, 성인 비율."],
  anchor=("a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, "
          "an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, "
          "hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height"),
  pose_full="standing three-quarter view facing slightly left, up on tiptoes, pointing forward with the right index finger, lotus lantern tucked under the left arm",
  pose_card="half-body, placed in the right third, leaning into the empty left side and pointing at it with a delighted expression, lotus glowing",
  expr=dict(neutral="bright curious look, small open smile", smile="huge open-mouthed laugh, eyes squeezed shut, star bouncing", serious="pouting lips, brows down, suspicious squint, still cute", talk="mouth wide open mid-shout, eyes bright"),
  emblem="a stylized lotus flower with three petals and a small four-pointed star above it, flat vector style, two-tone pink and off-white, centered",
  idle="bounces on tiptoes, the star above the head bobs, the lotus lantern pulses pink, braids sway",
  bg="soft rose-pink twilight with floating lotus petals and small sparkles, no figures"),
 dict(id="hunter", name="냉철한 헤드헌터", role="커리어·이직", accent="#5fb0ff",
  concept_ko=["30대 후반 여성. 감정을 빼고 시장 가치를 말하는 사람.",
    "머리: 턱선 단발, 한쪽 귀 뒤로 넘김.", "눈: 얇은 금속테 안경, 시선이 정확히 정면, 입은 다물고 있음.",
    "의상: 차콜 슈트 재킷, 스틸블루 블라우스, 손목시계.", "소품: 왼팔에 낀 얇은 태블릿(화면은 비어 있음), 오른손 펜.", "포즈 습관: 팔짱 또는 태블릿을 보다가 고개만 들어 응시.", "금지: 웃는 영업 미소, 과한 화장, 서류에 글자."],
  anchor=("a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, "
          "wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; "
          "accent color steel blue #5fb0ff on the blouse, glasses reflection and pen"),
  pose_full="standing three-quarter view facing slightly left, arms crossed with the tablet held against her chest, chin level, weight even",
  pose_card="half-body, placed in the right third, turned toward the empty left side, pen raised as if about to annotate the blank space, tablet in the other hand",
  expr=dict(neutral="calm neutral face, lips closed, steady gaze", smile="restrained approving half-smile, one corner of the mouth, eyes slightly softened", serious="brows lowered, stern assessing stare over the glasses", talk="lips parted mid-sentence, delivering a verdict, eyebrows level"),
  emblem="a hexagon outline with an upward arrow inside, flat vector style, two-tone steel blue and dark navy, centered",
  idle="she looks down at the tablet then back up to the viewer, the pen taps once, glasses catch a glint",
  bg="cool slate-blue gradient with faint thin grid lines and a soft light beam from the top-left, no figures"),
 dict(id="master", name="정경진 (전문가)", role="종합 명식 풀이 · K-천문명리학 협회 회장", accent="#d8b45f",
  concept_ko=["40~50대 남성 전문가. 전문적이지만 친근. '어려운 말을 쉽게 풀어 주는 선생님'.",
    "머리: 단정한 짧은 머리, 옆머리 살짝 희끗.", "눈: 둥근 뿔테 안경, 눈가 미소, 기본 표정은 설명하는 중의 따뜻한 미소.",
    "의상: 남색 개량 한복 재킷(금색 실 포인트), 안에 흰 라운드 셔츠.", "소품: 만세력 책(표지 글자 없음), 손에 든 붓 또는 나침반 형태의 패철.", "포즈 습관: 한 손으로 설명하는 제스처, 다른 손에 책.",
    "실존 인물: 본인 서면 동의와 레퍼런스 사진이 있을 때만 '닮게' 만든다. 동의 전에는 아래 앵커의 일반 인상으로만 생성하고 얼굴을 닮게 하지 않는다.", "금지: 무속 복식, 과장된 권위, 동의 없는 실제 얼굴 복제."],
  anchor=("a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, "
          "wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand "
          "and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge"),
  pose_full="standing three-quarter view facing slightly left, right hand open in a gentle explaining gesture at chest height, book held at his side",
  pose_card="half-body, placed in the right third, turned toward the empty left side, hand extended as if presenting the blank space, dial glinting",
  expr=dict(neutral="warm attentive smile while explaining", smile="broad friendly laugh, eyes crinkled behind the glasses", serious="calm, focused, lips closed, slight nod of concern", talk="mouth open mid-explanation, hand gesture active"),
  emblem="a geomantic compass dial: two concentric circles with eight radial ticks and a center dot, flat vector style, two-tone gold and navy, centered",
  idle="he turns a page of the almanac, adjusts his glasses, nods and smiles, the dial glints",
  bg="deep navy with faint gold constellation lines and a warm lamp glow from the lower right, no figures"),
]

BG_STYLE = ("Korean webtoon background painting, soft painterly brushwork with clean edges, cinematic night lighting, overall dark and low-contrast "
            "so that a character placed in the center-bottom stays readable, strongest light source in the upper left, gentle vignette, "
            "muted palette with one accent color, subtle paper grain, no characters, no people, no animals with faces, no text, no letters, no logo, no watermark.")
BG_NEG = "Avoid: photorealism, 3D render look, bright daylight, busy details in the center, any figure or silhouette of a person, text or signage."

BGS = {
 "flame": dict(place_ko="밤의 붉은 신전 누각. 처마에 붉은 등롱이 줄지어 걸리고, 바닥은 검은 돌, 공중에 불씨가 떠오른다. 뒤로 어두운 산 능선.",
   far="the interior of a night-time Korean pavilion shrine seen from inside, dark lacquered wooden pillars framing the left and right edges, rows of small crimson paper lanterns hanging from the eaves high up, a black stone floor reflecting faint red light, a distant dark mountain ridge through the open back, deep crimson and charcoal palette with coral #ff6f5e accents",
   mid="drifting ember sparks and thin coral-red smoke wisps rising slowly, scattered across the frame, denser near the bottom", near="a single red silk thread stretched loosely across the lower left corner and a few out-of-focus lantern tassels at the top edge", 
   header="a wide night-time pavilion eave with crimson lanterns receding into darkness, embers drifting, very dark lower half",
   loop="embers rise slowly and fade, lantern flames flicker, smoke wisps drift right, red thread sways slightly"),
 "sage": dict(place_ko="안개 낀 산중 암자 마루. 늙은 소나무 가지에 엽전 꿰미가 걸려 있고, 멀리 산봉우리가 안개 위로 떠 있다. 황토빛 등불 하나.",
   far="a misty mountain hermitage at dusk seen from its wooden porch, a gnarled old pine tree on the right with strings of old brass coins hanging from a branch, layered mountain peaks floating above a sea of fog in the back, a single warm ochre oil lamp glow on the left, deep navy and slate palette with antique gold #e2b74f accents",
   mid="slow-moving horizontal fog bands and a few floating gold coin glints, translucent", near="out-of-focus pine needles at the top left corner and a corner of a woven straw mat at the bottom",
   header="a wide misty mountain range at dusk with one pine branch and hanging coins entering from the right, dark lower half",
   loop="fog drifts slowly left, coins sway and glint, the lamp flame breathes, pine needles tremble"),
 "granny": dict(place_ko="달빛 드는 한옥 안방 툇마루. 창호지 문으로 보랏빛 달빛이 들어오고, 반짇고리와 찻잔, 작은 등불이 놓여 있다.",
   far="a cozy traditional Korean room at night seen from the floor, a paper-screen door on the left glowing with soft violet moonlight, a low wooden table with a tea cup and a sewing basket, a folded quilt in the corner, a small lantern, warm dark wood tones with lavender #b9a3ff moonlight accents",
   mid="soft drifting dust motes in the moonbeam and a few slow fireflies, translucent", near="a corner of a hand-knitted blanket draped at the bottom right and the edge of the paper screen frame on the left",
   header="a wide moonlit paper-screen wall with a low table and lantern on the right, dark lower half",
   loop="moonlight shifts slowly, dust motes drift, the lantern flame breathes, fireflies blink"),
 "child": dict(place_ko="연등이 떠 있는 밤의 연못가. 수면에 분홍 연꽃과 연등이 비치고, 반딧불과 꽃잎이 날린다.",
   far="a night-time lotus pond seen from the shore, dozens of small pink paper lanterns floating on still water and reflected, large lotus leaves and a few pink lotus blossoms in the foreground water, a stone step at the bottom, deep teal-navy water with pink #ff9ab5 lantern accents",
   mid="floating pink petals and small sparkles drifting across the frame, translucent", near="one large lotus leaf edge entering from the bottom left and a hanging lantern string at the top right, out of focus",
   header="a wide lotus pond at night with floating lanterns receding into the distance, dark lower half",
   loop="lanterns bob gently, reflections ripple, petals drift down, sparkles blink"),
 "hunter": dict(place_ko="새벽 고층 오피스 유리창 앞. 차가운 푸른 도시 야경, 유리에 희미한 격자 반사, 책상 위 스탠드 하나.",
   far="a high-rise office at dawn seen from inside, floor-to-ceiling glass on the back wall showing a cool blue city skyline with scattered lights, a faint grid reflection on the glass, a minimal desk with a single steel lamp on the right, slate and steel-blue palette with #5fb0ff accents",
   mid="thin horizontal light streaks and slowly moving faint grid lines, translucent", near="the out-of-focus edge of a glass partition on the left and the corner of the desk at the bottom right",
   header="a wide dawn city skyline through office glass with a thin light beam from the upper left, dark lower half",
   loop="city lights twinkle, a light beam sweeps slowly across the glass, grid lines drift, lamp glow steady"),
 "master": dict(place_ko="명리 서재. 남색 벽에 금색 별자리 선이 그려져 있고, 고서가 꽂힌 서가, 책상 위 패철과 붓, 따뜻한 스탠드 불빛.",
   far="a scholar's study at night, a deep navy wall painted with fine gold constellation lines and a large circular star chart, wooden shelves of old books with plain spines on the right, a desk with a brass geomantic dial and brushes, a warm lamp glow from the lower right, navy and walnut palette with antique gold #d8b45f accents",
   mid="slowly rotating faint gold constellation lines and tiny star glints, translucent", near="the out-of-focus corner of an open almanac at the bottom left and a hanging scroll edge at the top right",
   header="a wide navy wall with gold constellation lines and a shelf of old books on the right, dark lower half",
   loop="constellation lines rotate imperceptibly, stars glint, lamp light breathes, a page corner lifts"),
}

FACE_SHOT = ("bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, "
             "three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character")

def block(title, body, size, use):
    return f"\n**{title}** · 크기 {size} · 쓰이는 곳: {use}\n\n```\n{body}\n```\n"

def gen():
    out = []
    out.append("# 사주도감 캐릭터 컨셉 & 장면별 이미지 프롬프트\n")
    out.append("이 문서의 프롬프트는 GPT(이미지 생성)에 그대로 붙여 넣는 용도다. 한 캐릭터는 **먼저 캐릭터 시트 1장**을 만들고, 그 이미지를 이후 모든 프롬프트에 **레퍼런스로 첨부**한 뒤 \"same character as the attached reference\"를 유지한다. 앵커 문장은 매번 그대로 들어가 있으니 수정하지 말 것.\n")
    out.append("## 0. 사용 순서\n")
    out.append("1. 캐릭터당 **시트(S0)** 를 먼저 생성한다. 마음에 들 때까지 시트만 반복한다. 여기서 얼굴·의상이 확정된다.\n2. 확정된 시트를 첨부하고 **full → face 4종 → emblem → card** 순서로 생성한다. face 4종은 한 번의 대화 안에서 연달아 뽑아야 프레이밍이 같다.\n3. 투명 배경이 안 나오면 \"transparent background, PNG with alpha\"를 다시 강조하거나, 단색 배경(#00FF00)으로 뽑아 배경을 제거한다.\n4. 크기: GPT는 1024×1024 / 1024×1536 / 1536×1024만 낸다. card.png는 1024×1536으로 뽑아 4:5(1024×1280)로 크롭 후 1080×1350으로 확대, emblem은 1024에서 512로 축소.\n5. 저장 경로와 파일명은 `docs/character-art-brief.md` 기준. 넣으면 앱이 자동 반영한다.\n")
    out.append("## 1. 공통 스타일 블록 (모든 프롬프트에 이미 포함됨)\n")
    out.append(f"```\n{STYLE}\n{NEG}\n```\n")
    out.append("## 2. 장면 ↔ 파일 매핑\n")
    out.append("| 앱 장면 | 연출 | 쓰는 파일 |\n|---|---|---|\n| 홈 카드 | 부유, 순차 등장 | `full.png` |\n| 캐릭터 소개 | 아래→위 리빌, 빛 스윕, 후광 펄스 (+선택 `idle.webm`) | `full.png`, 배경은 CSS(선택: 배경 플레이트) |\n| 리딩 | 어둡던 캐릭터가 밝아지는 wake | `full.png` |\n| 결과 초상 | 숨쉬기, 말할 때 바운스, 문장별 표정 교체 | `face.png`, `face_smile.png`, `face_serious.png`, `face_talk.png` |\n| 리포트 장 머리 칩 | 팝인 | `face.png` |\n| 공유 카드 | 캔버스 합성 | `card.png` |\n| 카드 모서리·파비콘 | 정적 | `emblem.png` |\n| 소개·리딩 배경 | 멀리(천천히 확대) + 중간(입자 상승 루프) + 가까이(마우스·기울기 패럴랙스) 3겹 | `bg_intro_far.png`, `bg_intro_mid.png`, `bg_intro_near.png` (+선택 `bg_intro.webm`) |\n| 결과 헤더·리포트 표지 배경 | 가로 띠, 어두운 그라데이션 덮개 | `bg_header.png` |\n| 공유 카드 배경 | 캔버스 합성 | `bg_card.png` |\n")
    out.append("## 2-1. 장면 합성 규칙 (배경 + 캐릭터)\n")
    out.append("앱은 장면을 **아래부터** 이렇게 쌓는다. 각 층은 파일이 없으면 자동으로 빠지고 CSS 글로우가 대신한다.\n\n| 층 | 파일 | 움직임(앱이 처리) |\n|---|---|---|\n| 1 멀리 | `bg_intro_far.png` 불투명 | 20초 주기로 1.00→1.06 느린 확대·축소 |\n| 2 중간 | `bg_intro_mid.png` 투명 입자·안개 | 9초 주기로 위로 떠오르며 페이드, 반복 |\n| 3 후광 | CSS | 캐릭터 강조색 펄스 |\n| 4 가까이 | `bg_intro_near.png` 투명 전경 소품 | 기기 기울기·마우스에 따라 ±12px 패럴랙스 |\n| 5 캐릭터 | `full.png` 또는 `idle.webm` | 리빌, 숨쉬기, 부유 |\n| 6 빛 스윕 | CSS | 등장 시 1회 |\n\n배경 세 장은 **같은 카메라, 같은 장소**에서 깊이만 나눈 것이어야 한다. 멀리 장을 먼저 확정하고, 그 이미지를 첨부해 중간·가까이 장을 \"같은 장면의 분리 레이어\"로 생성한다. 캐릭터가 서는 중앙 하단 1/3은 세 장 모두 비워 둔다.\n")
    for c in CHARS:
        A = c["anchor"]; ref = "Same character as the attached reference sheet. "
        out.append(f"\n---\n\n## {c['name']} (`{c['id']}`) · {c['role']} · 강조색 {c['accent']}\n")
        out.append("### 컨셉 시트\n")
        out.append("\n".join(f"- {l}" for l in c["concept_ko"]) + "\n")
        out.append("### 앵커(영문, 모든 프롬프트에 포함됨)\n")
        out.append(f"```\n{A}\n```\n")
        out.append("### 프롬프트\n")
        out.append(block("S0 캐릭터 시트 (레퍼런스용, 1차 생성)",
            f"Character design sheet of {A}. Layout on one canvas: left half shows a full-body turnaround in three poses (front, three-quarter facing left, side), right half shows four head studies with these expressions: {c['expr']['neutral']}; {c['expr']['smile']}; {c['expr']['serious']}; {c['expr']['talk']}. Include a small swatch of the accent color {c['accent']}. {STYLE.replace('plain transparent background, no background scenery, ', 'plain off-white background, ')} {NEG}",
            "1536×1024", "레퍼런스 전용(앱에 넣지 않음)"))
        out.append(block("full.png 전신", f"{ref}Full-body illustration of {A}. Pose: {c['pose_full']}. Leave about 5 percent empty margin above the head and below the feet. {STYLE} {NEG}", "1024×1536", "홈 카드 · 캐릭터 소개 · 리딩"))
        for key, fname, use in [("neutral","face.png","결과 초상 기본 · 리포트 칩"),("smile","face_smile.png","3줄 결과 2번째 문장(강점)"),("serious","face_serious.png","3줄 결과 3번째 문장(약점·경고)"),("talk","face_talk.png","말풍선 타이핑 중 입 교차")]:
            out.append(block(f"{fname} 얼굴 · {key}", f"{ref}{FACE_SHOT}. Expression: {c['expr'][key]}. Subject: {A}. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. {STYLE} {NEG}", "1024×1024", use))
        out.append(block("emblem.png 엠블럼", f"Flat vector emblem icon: {c['emblem']}. Accent color {c['accent']} with a dark navy #0b0e18 or off-white #f2ecdc as the second tone. Thick clean shapes readable at 32 pixels. Transparent background, no text, no gradient, no 3D, no face.", "1024×1024 → 512", "카드 모서리 · 공유 카드 · 파비콘 대체"))
        out.append(block("card.png 공유 카드용 반신", f"{ref}Half-body illustration of {A}. Composition: {c['pose_card']}. The left two thirds of the frame must stay completely empty (text will be placed there later). {STYLE} {NEG}", "1024×1536 → 4:5 크롭 → 1080×1350", "공유 카드 캔버스 합성"))
        out.append(block("idle.webm 대기 영상 (선택, Sora/Runway/Kling용)", f"Animate the attached full-body illustration as a seamless 4-second loop at 24 fps, camera locked, transparent or solid #00FF00 background for keying. Motion: {c['idle']}. Movement amplitude very small, no camera move, no new elements, loop start and end frames identical. Keep the exact illustration style, no 3D conversion.", "1024×1536, 4s 루프", "캐릭터 소개 화면(있으면 full.png 대신 재생)"))
        b = BGS[c["id"]]
        out.append(f"### 배경 세계관\n\n- 장소: {b['place_ko']}\n- 규칙: 캐릭터가 서는 **중앙 하단 1/3은 비워 둘 것**. 배경의 강조색은 캐릭터와 같은 {c['accent']}. 사람·얼굴·글자 금지.\n")
        out.append(block("bg_intro_far.png 배경 · 멀리 (불투명, 먼저 확정)", f"Background plate, layer FAR: {b['far']}. Composition for a 2:3 portrait frame, horizon slightly above center, the center-bottom third left simple and dark for a character to stand on. {BG_STYLE} {BG_NEG}", "1024×1536", "소개·리딩 배경 1층"))
        out.append(block("bg_intro_mid.png 배경 · 중간 (투명 입자층)", f"Same scene as the attached FAR background, SEPARATED LAYER MID only: {b['mid']}. Render ONLY these floating elements on a fully transparent background, no ground, no walls, no sky, same camera and lighting as the reference, elements concentrated away from the center-bottom third. {BG_STYLE.replace('no characters,', 'transparent background, no characters,')} {BG_NEG}", "1024×1536 (투명)", "소개·리딩 배경 2층(위로 떠오르는 루프)"))
        out.append(block("bg_intro_near.png 배경 · 가까이 (투명 전경)", f"Same scene as the attached FAR background, SEPARATED LAYER NEAR only: {b['near']}. Render ONLY these foreground elements on a fully transparent background, slightly out of focus, touching only the frame edges, the center completely empty. {BG_STYLE.replace('no characters,', 'transparent background, no characters,')} {BG_NEG}", "1024×1536 (투명)", "소개·리딩 배경 4층(패럴랙스)"))
        out.append(block("bg_header.png 결과 헤더·리포트 표지 배경 (가로)", f"Wide background plate: {b['header']}. Composition for a 3:1 banner crop from the vertical middle of a 3:2 frame, the lower half very dark so text placed over it stays readable. {BG_STYLE} {BG_NEG}", "1536×1024 → 가운데 3:1 크롭", "결과 화면 헤더 · 리포트 표지 띠"))
        out.append(block("bg_card.png 공유 카드 배경", f"Background plate for a social card: same world as the attached FAR background, reframed for a 4:5 portrait, the left two thirds nearly empty and dark (text goes there), the scene's key props gathered on the right third behind where a half-body character will stand. {BG_STYLE} {BG_NEG}", "1024×1536 → 4:5 크롭 → 1080×1350", "공유 카드 캔버스 배경"))
        out.append(block("bg_intro.webm 배경 루프 영상 (선택, Sora/Runway/Kling용)", f"Animate the attached FAR background as a seamless 8-second loop at 24 fps, camera locked. Motion: {b['loop']}. Keep the center-bottom third calm and dark. No new objects, no people, loop start and end identical, keep the painted illustration style.", "1024×1536, 8s 루프", "소개 화면에서 far+mid 대신 재생(있으면)"))
    out.append("\n---\n\n## MBTI 사주 상품 비주얼\n")
    out.append(block("mbti_tiles.png", "Four square tiles arranged two by two, each tile a dark navy #121829 rounded square with a thin teal #7fd1c7 border, each showing one large bold serif letter: E, N, F, P in teal, slight perspective tilt as if the tiles are floating, soft teal glow beneath, transparent background, no other text.", "1024×1024", "홈의 MBTI 사주 카드(지금은 CSS 타일이 대신함)"))
    out.append("## 작업 순서 요약 (캐릭터 1명 기준)\n")
    out.append("1. S0 시트 → 확정\n2. full / face 4종 / emblem / card (시트 첨부)\n3. bg_intro_far → 확정\n4. bg_intro_mid / bg_intro_near / bg_card (far 첨부)\n5. bg_header\n6. (선택) idle.webm, bg_intro.webm\n7. 전부 `mvp/saju/assets/characters/<id>/` 에 저장 → 앱 새로고침\n")
    out.append("## 검수 체크리스트\n")
    out.append("- [ ] 시트와 각 파일의 얼굴·머리·의상이 같은 사람으로 보이는가 (다르면 레퍼런스를 다시 첨부하고 재생성)\n- [ ] face 4종을 겹쳐 봤을 때 눈 위치가 같은가\n- [ ] 전신이 왼쪽을 향한 3/4인가 (말풍선이 오른쪽에 붙음)\n- [ ] 배경이 진짜 투명인가 (체커보드 확인), 이미지에 글자가 없는가\n- [ ] 강조색이 의상·소품·눈 중 두 곳 이상에 들어갔는가\n- [ ] card.png 왼쪽 2/3가 비어 있는가\n- [ ] `master`는 본인 동의서 없이는 실제 얼굴을 닮게 만들지 않았는가\n- [ ] 배경 3겹(far·mid·near)이 같은 카메라·같은 장소인가, 중앙 하단이 비어 있는가\n- [ ] mid·near 층이 진짜 투명인가(바닥·벽이 섞여 들어오지 않았는가)\n- [ ] bg_header 아래 절반이 충분히 어두워 글자가 읽히는가\n")
    return "\n".join(out)

if __name__ == "__main__":
    print(gen())
