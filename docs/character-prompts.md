# 사주도감 캐릭터 컨셉 & 장면별 이미지 프롬프트

이 문서의 프롬프트는 GPT(이미지 생성)에 그대로 붙여 넣는 용도다. 한 캐릭터는 **먼저 캐릭터 시트 1장**을 만들고, 그 이미지를 이후 모든 프롬프트에 **레퍼런스로 첨부**한 뒤 "same character as the attached reference"를 유지한다. 앵커 문장은 매번 그대로 들어가 있으니 수정하지 말 것.

## 0. 사용 순서

1. 캐릭터당 **시트(S0)** 를 먼저 생성한다. 마음에 들 때까지 시트만 반복한다. 여기서 얼굴·의상이 확정된다.
2. 확정된 시트를 첨부하고 **full → face 4종 → emblem → card** 순서로 생성한다. face 4종은 한 번의 대화 안에서 연달아 뽑아야 프레이밍이 같다.
3. 투명 배경이 안 나오면 "transparent background, PNG with alpha"를 다시 강조하거나, 단색 배경(#00FF00)으로 뽑아 배경을 제거한다.
4. 크기: GPT는 1024×1024 / 1024×1536 / 1536×1024만 낸다. card.png는 1024×1536으로 뽑아 4:5(1024×1280)로 크롭 후 1080×1350으로 확대, emblem은 1024에서 512로 축소.
5. 저장 경로와 파일명은 `docs/character-art-brief.md` 기준. 넣으면 앱이 자동 반영한다.

## 1. 공통 스타일 블록 (모든 프롬프트에 이미 포함됨)

```
Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark.
Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```

## 2. 장면 ↔ 파일 매핑

| 앱 장면 | 연출 | 쓰는 파일 |
|---|---|---|
| 홈 카드 | 부유, 순차 등장 | `full.png` |
| 캐릭터 소개 | 아래→위 리빌, 빛 스윕, 후광 펄스 (+선택 `idle.webm`) | `full.png`, 배경은 CSS(선택: 배경 플레이트) |
| 리딩 | 어둡던 캐릭터가 밝아지는 wake | `full.png` |
| 결과 초상 | 숨쉬기, 말할 때 바운스, 문장별 표정 교체 | `face.png`, `face_smile.png`, `face_serious.png`, `face_talk.png` |
| 리포트 장 머리 칩 | 팝인 | `face.png` |
| 공유 카드 | 캔버스 합성 | `card.png` |
| 카드 모서리·파비콘 | 정적 | `emblem.png` |


---

## 홍염의 여신 (`flame`) · 연애·재회·궁합 · 강조색 #ff6f5e

### 컨셉 시트

- 20대 후반 여성 신격. 사랑을 '지키는' 신이 아니라 '꿰뚫어 보는' 신.
- 머리: 검붉은 긴 머리, 끝이 불씨처럼 흩날리며 코랄빛으로 옅어짐.
- 눈: 코랄 레드 홍채, 눈꼬리 올라감, 한쪽 입꼬리를 올린 도발적 미소가 기본 표정.
- 의상: 현대적으로 재해석한 검붉은 한복 드레스(한쪽 어깨 비대칭, 치맛자락에 불씨 자수), 금색 이어커프.
- 소품: 왼 손목에 감긴 붉은 실(인연의 실), 오른 손끝의 작은 불꽃.
- 포즈 습관: 한 손 허리, 다른 손으로 불꽃을 보여 주듯 들어 올림.
- 금지: 과한 노출, 공포스러운 분위기, 서양식 악마 뿔.

### 앵커(영문, 모든 프롬프트에 포함됨)

```
a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; accent color coral red #ff6f5e on her eyes, flame and embroidery
```

### 프롬프트


**S0 캐릭터 시트 (레퍼런스용, 1차 생성)** · 크기 1536×1024 · 쓰이는 곳: 레퍼런스 전용(앱에 넣지 않음)

```
Character design sheet of a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; accent color coral red #ff6f5e on her eyes, flame and embroidery. Layout on one canvas: left half shows a full-body turnaround in three poses (front, three-quarter facing left, side), right half shows four head studies with these expressions: confident one-sided smirk, eyes half-lidded; warm open smile with raised eyebrow, flame glowing brighter; narrowed eyes, lips closed, warning look, embers in her hair flaring; mouth slightly open mid-sentence as if telling a secret. Include a small swatch of the accent color #ff6f5e. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain off-white background, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**full.png 전신** · 크기 1024×1536 · 쓰이는 곳: 홈 카드 · 캐릭터 소개 · 리딩

```
Same character as the attached reference sheet. Full-body illustration of a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; accent color coral red #ff6f5e on her eyes, flame and embroidery. Pose: standing three-quarter view facing slightly left, left hand on her hip, right hand raised chest-high showing the small flame, weight on one leg, hair drifting. Leave about 5 percent empty margin above the head and below the feet. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face.png 얼굴 · neutral** · 크기 1024×1024 · 쓰이는 곳: 결과 초상 기본 · 리포트 칩

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: confident one-sided smirk, eyes half-lidded. Subject: a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; accent color coral red #ff6f5e on her eyes, flame and embroidery. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_smile.png 얼굴 · smile** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 2번째 문장(강점)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: warm open smile with raised eyebrow, flame glowing brighter. Subject: a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; accent color coral red #ff6f5e on her eyes, flame and embroidery. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_serious.png 얼굴 · serious** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 3번째 문장(약점·경고)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: narrowed eyes, lips closed, warning look, embers in her hair flaring. Subject: a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; accent color coral red #ff6f5e on her eyes, flame and embroidery. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_talk.png 얼굴 · talk** · 크기 1024×1024 · 쓰이는 곳: 말풍선 타이핑 중 입 교차

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: mouth slightly open mid-sentence as if telling a secret. Subject: a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; accent color coral red #ff6f5e on her eyes, flame and embroidery. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**emblem.png 엠블럼** · 크기 1024×1024 → 512 · 쓰이는 곳: 카드 모서리 · 공유 카드 · 파비콘 대체

```
Flat vector emblem icon: a single stylized flame with a smaller pale inner flame, two-tone coral red and off-white, flat vector style, centered, no face. Accent color #ff6f5e with a dark navy #0b0e18 or off-white #f2ecdc as the second tone. Thick clean shapes readable at 32 pixels. Transparent background, no text, no gradient, no 3D, no face.
```


**card.png 공유 카드용 반신** · 크기 1024×1536 → 4:5 크롭 → 1080×1350 · 쓰이는 곳: 공유 카드 캔버스 합성

```
Same character as the attached reference sheet. Half-body illustration of a goddess-like Korean woman in her late twenties, long dark-crimson hair whose tips fade into coral embers and drift upward like sparks, coral-red irises, upturned eyes, a confident one-sided smirk, wearing a modern reinterpretation of a hanbok dress in deep crimson with an asymmetric bare shoulder and small ember-shaped gold embroidery along the hem, a gold ear cuff, a red thread of fate wrapped around her left wrist, a small flame hovering above her right fingertips; accent color coral red #ff6f5e on her eyes, flame and embroidery. Composition: half-body from the waist up, placed in the right third of the frame, turned toward the empty left side, holding the flame up as if lighting the blank space. The left two thirds of the frame must stay completely empty (text will be placed there later). Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**idle.webm 대기 영상 (선택, Sora/Runway/Kling용)** · 크기 1024×1536, 4s 루프 · 쓰이는 곳: 캐릭터 소개 화면(있으면 full.png 대신 재생)

```
Animate the attached full-body illustration as a seamless 4-second loop at 24 fps, camera locked, transparent or solid #00FF00 background for keying. Motion: hair embers drift upward slowly, the fingertip flame flickers, she breathes gently, a faint smirk settles. Movement amplitude very small, no camera move, no new elements, loop start and end frames identical. Keep the exact illustration style, no 3D conversion.
```


**배경 플레이트 (선택)** · 크기 1024×1536 · 쓰이는 곳: 캐릭터 소개 화면 뒤 배경(지금은 CSS 글로우가 대신함)

```
Atmospheric background plate with no characters: dark crimson haze with slow-rising ember particles and a soft warm glow at the bottom center, no figures. Very low contrast so a character can be placed on top, darker toward the top, Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, no text, no logo.
```


---

## 도사님 (`sage`) · 돈·사업·직업 · 강조색 #e2b74f

### 컨셉 시트

- 70대 남성 도사. 재물의 신이 아니라 '돈이 새는 자리'를 아는 산속 노인.
- 머리: 상투에 작은 흑립(갓), 흰 눈썹이 길고 흰 수염이 가슴까지.
- 눈: 거의 감은 듯 웃는 눈, 눈가 주름 깊음. 기본 표정은 '허허' 웃음.
- 의상: 낡아 보이는 황토색 도포, 소매가 넓음, 허리끈에 엽전 꿰미.
- 소품: 엽전 문양이 그려진 큰 부채, 허리의 호리병.
- 포즈 습관: 부채로 입을 반쯤 가리거나, 엽전 하나를 손가락으로 튕김.
- 금지: 담뱃대(흡연 이미지), 무서운 산신령, 중국풍 도교 복식.

### 앵커(영문, 모든 프롬프트에 포함됨)

```
a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim
```

### 프롬프트


**S0 캐릭터 시트 (레퍼런스용, 1차 생성)** · 크기 1536×1024 · 쓰이는 곳: 레퍼런스 전용(앱에 넣지 않음)

```
Character design sheet of a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim. Layout on one canvas: left half shows a full-body turnaround in three poses (front, three-quarter facing left, side), right half shows four head studies with these expressions: eyes nearly closed, gentle knowing chuckle; wide hearty laugh, head tilted back slightly, beard shaking; eyes open for once, sharp and clear, fan closed and pointed forward; mouth open mid-chuckle, one eyebrow lifted. Include a small swatch of the accent color #e2b74f. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain off-white background, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**full.png 전신** · 크기 1024×1536 · 쓰이는 곳: 홈 카드 · 캐릭터 소개 · 리딩

```
Same character as the attached reference sheet. Full-body illustration of a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim. Pose: standing three-quarter view facing slightly left, fan half-open in his right hand near his chin, left hand flicking a single brass coin into the air. Leave about 5 percent empty margin above the head and below the feet. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face.png 얼굴 · neutral** · 크기 1024×1024 · 쓰이는 곳: 결과 초상 기본 · 리포트 칩

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: eyes nearly closed, gentle knowing chuckle. Subject: a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_smile.png 얼굴 · smile** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 2번째 문장(강점)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: wide hearty laugh, head tilted back slightly, beard shaking. Subject: a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_serious.png 얼굴 · serious** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 3번째 문장(약점·경고)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: eyes open for once, sharp and clear, fan closed and pointed forward. Subject: a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_talk.png 얼굴 · talk** · 크기 1024×1024 · 쓰이는 곳: 말풍선 타이핑 중 입 교차

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: mouth open mid-chuckle, one eyebrow lifted. Subject: a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**emblem.png 엠블럼** · 크기 1024×1024 → 512 · 쓰이는 곳: 카드 모서리 · 공유 카드 · 파비콘 대체

```
Flat vector emblem icon: a single old brass coin with a square hole, two small bamboo leaves crossing behind it, flat vector style, two-tone gold and dark navy, centered. Accent color #e2b74f with a dark navy #0b0e18 or off-white #f2ecdc as the second tone. Thick clean shapes readable at 32 pixels. Transparent background, no text, no gradient, no 3D, no face.
```


**card.png 공유 카드용 반신** · 크기 1024×1536 → 4:5 크롭 → 1080×1350 · 쓰이는 곳: 공유 카드 캔버스 합성

```
Same character as the attached reference sheet. Half-body illustration of a Korean mountain sage in his seventies, a topknot under a small black gat hat, long white eyebrows, a white beard reaching his chest, eyes nearly closed in a knowing chuckle, deep laugh lines, wearing a worn ochre dopo robe with wide sleeves and a waist cord hung with a string of old brass coins, holding a large folding fan decorated with a coin pattern, a small gourd flask at his hip; accent color antique gold #e2b74f on the coins, fan and robe trim. Composition: seated cross-legged from the waist up, placed in the right third, fan resting on his knee, one coin balanced on his fingertip toward the empty left side. The left two thirds of the frame must stay completely empty (text will be placed there later). Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**idle.webm 대기 영상 (선택, Sora/Runway/Kling용)** · 크기 1024×1536, 4s 루프 · 쓰이는 곳: 캐릭터 소개 화면(있으면 full.png 대신 재생)

```
Animate the attached full-body illustration as a seamless 4-second loop at 24 fps, camera locked, transparent or solid #00FF00 background for keying. Motion: the fan sways slowly, the coin spins on his fingertip, his beard moves with a slow breath, eyes crinkle. Movement amplitude very small, no camera move, no new elements, loop start and end frames identical. Keep the exact illustration style, no 3D conversion.
```


**배경 플레이트 (선택)** · 크기 1024×1536 · 쓰이는 곳: 캐릭터 소개 화면 뒤 배경(지금은 CSS 글로우가 대신함)

```
Atmospheric background plate with no characters: misty mountain haze in deep navy with floating gold coin glints and a warm glow low in the frame, no figures. Very low contrast so a character can be placed on top, darker toward the top, Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, no text, no logo.
```


---

## 할머니 (`granny`) · 한 해·가족·인생 흐름 · 강조색 #b9a3ff

### 컨셉 시트

- 70대 여성. 무서운 점쟁이가 아니라 손을 잡아 주는 외할머니.
- 머리: 은백색 쪽진 머리, 비녀 하나.
- 눈: 주름진 눈웃음, 돋보기 안경을 목에 걸고 있음(쓰지 않음).
- 의상: 연보라 누비 한복 조끼 + 회색 치마, 무릎 위 손뜨개 담요.
- 소품: 손바닥만 한 달 모양 등불(보라빛), 손목의 묵주 같은 나무 염주.
- 포즈 습관: 두 손을 앞으로 내밀어 상대 손을 잡으려는 제스처.
- 금지: 쇠약하거나 슬픈 분위기, 무당 복식, 방울·칼.

### 앵커(영문, 모든 프롬프트에 포함됨)

```
a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow
```

### 프롬프트


**S0 캐릭터 시트 (레퍼런스용, 1차 생성)** · 크기 1536×1024 · 쓰이는 곳: 레퍼런스 전용(앱에 넣지 않음)

```
Character design sheet of a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow. Layout on one canvas: left half shows a full-body turnaround in three poses (front, three-quarter facing left, side), right half shows four head studies with these expressions: soft crinkled smile, eyes warm; eyes closed in a wide affectionate laugh, cheeks lifted; brows gently furrowed with concern, lips pressed, eyes still kind; mouth slightly open as if saying a soothing word, head tilted. Include a small swatch of the accent color #b9a3ff. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain off-white background, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**full.png 전신** · 크기 1024×1536 · 쓰이는 곳: 홈 카드 · 캐릭터 소개 · 리딩

```
Same character as the attached reference sheet. Full-body illustration of a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow. Pose: standing three-quarter view facing slightly left, both hands extended forward gently as if about to take the viewer's hands, the moon lantern hanging from her left wrist. Leave about 5 percent empty margin above the head and below the feet. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face.png 얼굴 · neutral** · 크기 1024×1024 · 쓰이는 곳: 결과 초상 기본 · 리포트 칩

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: soft crinkled smile, eyes warm. Subject: a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_smile.png 얼굴 · smile** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 2번째 문장(강점)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: eyes closed in a wide affectionate laugh, cheeks lifted. Subject: a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_serious.png 얼굴 · serious** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 3번째 문장(약점·경고)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: brows gently furrowed with concern, lips pressed, eyes still kind. Subject: a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_talk.png 얼굴 · talk** · 크기 1024×1024 · 쓰이는 곳: 말풍선 타이핑 중 입 교차

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: mouth slightly open as if saying a soothing word, head tilted. Subject: a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**emblem.png 엠블럼** · 크기 1024×1024 → 512 · 쓰이는 곳: 카드 모서리 · 공유 카드 · 파비콘 대체

```
Flat vector emblem icon: a crescent moon with one small star beside it, flat vector style, two-tone lavender and deep indigo, centered. Accent color #b9a3ff with a dark navy #0b0e18 or off-white #f2ecdc as the second tone. Thick clean shapes readable at 32 pixels. Transparent background, no text, no gradient, no 3D, no face.
```


**card.png 공유 카드용 반신** · 크기 1024×1536 → 4:5 크롭 → 1080×1350 · 쓰이는 곳: 공유 카드 캔버스 합성

```
Same character as the attached reference sheet. Half-body illustration of a Korean grandmother in her seventies, silver-white hair in a low bun with a single binyeo hairpin, deep smile lines, warm crinkled eyes, reading glasses hanging on a cord around her neck, wearing a lavender quilted hanbok vest over a grey skirt, a hand-knitted blanket folded over her lap or arm, holding a small palm-sized crescent-moon lantern glowing soft violet, a wooden bead bracelet on her wrist; accent color lavender #b9a3ff on the lantern, vest and glow. Composition: half-body from the waist up, placed in the right third, leaning toward the empty left side, offering the glowing moon lantern with both hands. The left two thirds of the frame must stay completely empty (text will be placed there later). Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**idle.webm 대기 영상 (선택, Sora/Runway/Kling용)** · 크기 1024×1536, 4s 루프 · 쓰이는 곳: 캐릭터 소개 화면(있으면 full.png 대신 재생)

```
Animate the attached full-body illustration as a seamless 4-second loop at 24 fps, camera locked, transparent or solid #00FF00 background for keying. Motion: the moon lantern glows in a slow pulse, she nods slightly, the blanket edge moves, eyes blink softly. Movement amplitude very small, no camera move, no new elements, loop start and end frames identical. Keep the exact illustration style, no 3D conversion.
```


**배경 플레이트 (선택)** · 크기 1024×1536 · 쓰이는 곳: 캐릭터 소개 화면 뒤 배경(지금은 CSS 글로우가 대신함)

```
Atmospheric background plate with no characters: deep indigo night with soft violet moonlight from the upper left and drifting fireflies, no figures. Very low contrast so a character can be placed on top, darker toward the top, Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, no text, no logo.
```


---

## 애기동자 (`child`) · 자녀·기질 · 강조색 #ff9ab5

### 컨셉 시트

- 5~6세 동자(남아). 신령스러운 아이. 무섭지 않고 신나 있음.
- 머리: 양 갈래로 땋아 올린 댕기머리, 이마에 잔머리.
- 눈: 크고 반짝이는 눈, 볼에 홍조, 기본 표정은 입 벌린 신난 웃음.
- 의상: 연분홍 색동저고리(소매 줄무늬), 흰 바지, 꽃신.
- 소품: 품에 안은 분홍 연꽃 등, 머리 위에 작은 별 하나가 떠 있음.
- 포즈 습관: 발뒤꿈치 들고 검지로 무언가를 가리키며 외침.
- 금지: 공포 동자 이미지, 노출, 성인 비율.

### 앵커(영문, 모든 프롬프트에 포함됨)

```
a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height
```

### 프롬프트


**S0 캐릭터 시트 (레퍼런스용, 1차 생성)** · 크기 1536×1024 · 쓰이는 곳: 레퍼런스 전용(앱에 넣지 않음)

```
Character design sheet of a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height. Layout on one canvas: left half shows a full-body turnaround in three poses (front, three-quarter facing left, side), right half shows four head studies with these expressions: bright curious look, small open smile; huge open-mouthed laugh, eyes squeezed shut, star bouncing; pouting lips, brows down, suspicious squint, still cute; mouth wide open mid-shout, eyes bright. Include a small swatch of the accent color #ff9ab5. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain off-white background, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**full.png 전신** · 크기 1024×1536 · 쓰이는 곳: 홈 카드 · 캐릭터 소개 · 리딩

```
Same character as the attached reference sheet. Full-body illustration of a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height. Pose: standing three-quarter view facing slightly left, up on tiptoes, pointing forward with the right index finger, lotus lantern tucked under the left arm. Leave about 5 percent empty margin above the head and below the feet. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face.png 얼굴 · neutral** · 크기 1024×1024 · 쓰이는 곳: 결과 초상 기본 · 리포트 칩

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: bright curious look, small open smile. Subject: a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_smile.png 얼굴 · smile** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 2번째 문장(강점)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: huge open-mouthed laugh, eyes squeezed shut, star bouncing. Subject: a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_serious.png 얼굴 · serious** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 3번째 문장(약점·경고)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: pouting lips, brows down, suspicious squint, still cute. Subject: a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_talk.png 얼굴 · talk** · 크기 1024×1024 · 쓰이는 곳: 말풍선 타이핑 중 입 교차

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: mouth wide open mid-shout, eyes bright. Subject: a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**emblem.png 엠블럼** · 크기 1024×1024 → 512 · 쓰이는 곳: 카드 모서리 · 공유 카드 · 파비콘 대체

```
Flat vector emblem icon: a stylized lotus flower with three petals and a small four-pointed star above it, flat vector style, two-tone pink and off-white, centered. Accent color #ff9ab5 with a dark navy #0b0e18 or off-white #f2ecdc as the second tone. Thick clean shapes readable at 32 pixels. Transparent background, no text, no gradient, no 3D, no face.
```


**card.png 공유 카드용 반신** · 크기 1024×1536 → 4:5 크롭 → 1080×1350 · 쓰이는 곳: 공유 카드 캔버스 합성

```
Same character as the attached reference sheet. Half-body illustration of a Korean spirit child about five years old, hair in two braided buns with ribbon ties (daenggi), wisps on the forehead, very large sparkling eyes, rosy cheeks, an excited open-mouthed grin, wearing a pale pink saekdong jeogori with striped sleeves, white pants and small flower-embroidered shoes, hugging a glowing pink lotus lantern, a tiny star floating above the head; accent color pink #ff9ab5 on the lotus, cheeks and sleeve stripes; child body proportions, head about one third of total height. Composition: half-body, placed in the right third, leaning into the empty left side and pointing at it with a delighted expression, lotus glowing. The left two thirds of the frame must stay completely empty (text will be placed there later). Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**idle.webm 대기 영상 (선택, Sora/Runway/Kling용)** · 크기 1024×1536, 4s 루프 · 쓰이는 곳: 캐릭터 소개 화면(있으면 full.png 대신 재생)

```
Animate the attached full-body illustration as a seamless 4-second loop at 24 fps, camera locked, transparent or solid #00FF00 background for keying. Motion: bounces on tiptoes, the star above the head bobs, the lotus lantern pulses pink, braids sway. Movement amplitude very small, no camera move, no new elements, loop start and end frames identical. Keep the exact illustration style, no 3D conversion.
```


**배경 플레이트 (선택)** · 크기 1024×1536 · 쓰이는 곳: 캐릭터 소개 화면 뒤 배경(지금은 CSS 글로우가 대신함)

```
Atmospheric background plate with no characters: soft rose-pink twilight with floating lotus petals and small sparkles, no figures. Very low contrast so a character can be placed on top, darker toward the top, Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, no text, no logo.
```


---

## 냉철한 헤드헌터 (`hunter`) · 커리어·이직 · 강조색 #5fb0ff

### 컨셉 시트

- 30대 후반 여성. 감정을 빼고 시장 가치를 말하는 사람.
- 머리: 턱선 단발, 한쪽 귀 뒤로 넘김.
- 눈: 얇은 금속테 안경, 시선이 정확히 정면, 입은 다물고 있음.
- 의상: 차콜 슈트 재킷, 스틸블루 블라우스, 손목시계.
- 소품: 왼팔에 낀 얇은 태블릿(화면은 비어 있음), 오른손 펜.
- 포즈 습관: 팔짱 또는 태블릿을 보다가 고개만 들어 응시.
- 금지: 웃는 영업 미소, 과한 화장, 서류에 글자.

### 앵커(영문, 모든 프롬프트에 포함됨)

```
a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; accent color steel blue #5fb0ff on the blouse, glasses reflection and pen
```

### 프롬프트


**S0 캐릭터 시트 (레퍼런스용, 1차 생성)** · 크기 1536×1024 · 쓰이는 곳: 레퍼런스 전용(앱에 넣지 않음)

```
Character design sheet of a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; accent color steel blue #5fb0ff on the blouse, glasses reflection and pen. Layout on one canvas: left half shows a full-body turnaround in three poses (front, three-quarter facing left, side), right half shows four head studies with these expressions: calm neutral face, lips closed, steady gaze; restrained approving half-smile, one corner of the mouth, eyes slightly softened; brows lowered, stern assessing stare over the glasses; lips parted mid-sentence, delivering a verdict, eyebrows level. Include a small swatch of the accent color #5fb0ff. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain off-white background, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**full.png 전신** · 크기 1024×1536 · 쓰이는 곳: 홈 카드 · 캐릭터 소개 · 리딩

```
Same character as the attached reference sheet. Full-body illustration of a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; accent color steel blue #5fb0ff on the blouse, glasses reflection and pen. Pose: standing three-quarter view facing slightly left, arms crossed with the tablet held against her chest, chin level, weight even. Leave about 5 percent empty margin above the head and below the feet. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face.png 얼굴 · neutral** · 크기 1024×1024 · 쓰이는 곳: 결과 초상 기본 · 리포트 칩

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: calm neutral face, lips closed, steady gaze. Subject: a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; accent color steel blue #5fb0ff on the blouse, glasses reflection and pen. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_smile.png 얼굴 · smile** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 2번째 문장(강점)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: restrained approving half-smile, one corner of the mouth, eyes slightly softened. Subject: a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; accent color steel blue #5fb0ff on the blouse, glasses reflection and pen. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_serious.png 얼굴 · serious** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 3번째 문장(약점·경고)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: brows lowered, stern assessing stare over the glasses. Subject: a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; accent color steel blue #5fb0ff on the blouse, glasses reflection and pen. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_talk.png 얼굴 · talk** · 크기 1024×1024 · 쓰이는 곳: 말풍선 타이핑 중 입 교차

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: lips parted mid-sentence, delivering a verdict, eyebrows level. Subject: a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; accent color steel blue #5fb0ff on the blouse, glasses reflection and pen. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**emblem.png 엠블럼** · 크기 1024×1024 → 512 · 쓰이는 곳: 카드 모서리 · 공유 카드 · 파비콘 대체

```
Flat vector emblem icon: a hexagon outline with an upward arrow inside, flat vector style, two-tone steel blue and dark navy, centered. Accent color #5fb0ff with a dark navy #0b0e18 or off-white #f2ecdc as the second tone. Thick clean shapes readable at 32 pixels. Transparent background, no text, no gradient, no 3D, no face.
```


**card.png 공유 카드용 반신** · 크기 1024×1536 → 4:5 크롭 → 1080×1350 · 쓰이는 곳: 공유 카드 캔버스 합성

```
Same character as the attached reference sheet. Half-body illustration of a Korean woman in her late thirties, a sharp chin-length bob tucked behind one ear, thin metal-rimmed glasses, direct level gaze, lips closed, wearing a charcoal tailored suit jacket over a steel-blue blouse, a slim wristwatch, holding a thin tablet with a blank dark screen under her left arm and a pen in her right hand; accent color steel blue #5fb0ff on the blouse, glasses reflection and pen. Composition: half-body, placed in the right third, turned toward the empty left side, pen raised as if about to annotate the blank space, tablet in the other hand. The left two thirds of the frame must stay completely empty (text will be placed there later). Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**idle.webm 대기 영상 (선택, Sora/Runway/Kling용)** · 크기 1024×1536, 4s 루프 · 쓰이는 곳: 캐릭터 소개 화면(있으면 full.png 대신 재생)

```
Animate the attached full-body illustration as a seamless 4-second loop at 24 fps, camera locked, transparent or solid #00FF00 background for keying. Motion: she looks down at the tablet then back up to the viewer, the pen taps once, glasses catch a glint. Movement amplitude very small, no camera move, no new elements, loop start and end frames identical. Keep the exact illustration style, no 3D conversion.
```


**배경 플레이트 (선택)** · 크기 1024×1536 · 쓰이는 곳: 캐릭터 소개 화면 뒤 배경(지금은 CSS 글로우가 대신함)

```
Atmospheric background plate with no characters: cool slate-blue gradient with faint thin grid lines and a soft light beam from the top-left, no figures. Very low contrast so a character can be placed on top, darker toward the top, Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, no text, no logo.
```


---

## 정경진 (전문가) (`master`) · 종합 명식 풀이 · K-천문명리학 협회 회장 · 강조색 #d8b45f

### 컨셉 시트

- 40~50대 남성 전문가. 전문적이지만 친근. '어려운 말을 쉽게 풀어 주는 선생님'.
- 머리: 단정한 짧은 머리, 옆머리 살짝 희끗.
- 눈: 둥근 뿔테 안경, 눈가 미소, 기본 표정은 설명하는 중의 따뜻한 미소.
- 의상: 남색 개량 한복 재킷(금색 실 포인트), 안에 흰 라운드 셔츠.
- 소품: 만세력 책(표지 글자 없음), 손에 든 붓 또는 나침반 형태의 패철.
- 포즈 습관: 한 손으로 설명하는 제스처, 다른 손에 책.
- 실존 인물: 본인 서면 동의와 레퍼런스 사진이 있을 때만 '닮게' 만든다. 동의 전에는 아래 앵커의 일반 인상으로만 생성하고 얼굴을 닮게 하지 않는다.
- 금지: 무속 복식, 과장된 권위, 동의 없는 실제 얼굴 복제.

### 앵커(영문, 모든 프롬프트에 포함됨)

```
a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge
```

### 프롬프트


**S0 캐릭터 시트 (레퍼런스용, 1차 생성)** · 크기 1536×1024 · 쓰이는 곳: 레퍼런스 전용(앱에 넣지 않음)

```
Character design sheet of a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge. Layout on one canvas: left half shows a full-body turnaround in three poses (front, three-quarter facing left, side), right half shows four head studies with these expressions: warm attentive smile while explaining; broad friendly laugh, eyes crinkled behind the glasses; calm, focused, lips closed, slight nod of concern; mouth open mid-explanation, hand gesture active. Include a small swatch of the accent color #d8b45f. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain off-white background, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**full.png 전신** · 크기 1024×1536 · 쓰이는 곳: 홈 카드 · 캐릭터 소개 · 리딩

```
Same character as the attached reference sheet. Full-body illustration of a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge. Pose: standing three-quarter view facing slightly left, right hand open in a gentle explaining gesture at chest height, book held at his side. Leave about 5 percent empty margin above the head and below the feet. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face.png 얼굴 · neutral** · 크기 1024×1024 · 쓰이는 곳: 결과 초상 기본 · 리포트 칩

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: warm attentive smile while explaining. Subject: a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_smile.png 얼굴 · smile** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 2번째 문장(강점)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: broad friendly laugh, eyes crinkled behind the glasses. Subject: a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_serious.png 얼굴 · serious** · 크기 1024×1024 · 쓰이는 곳: 3줄 결과 3번째 문장(약점·경고)

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: calm, focused, lips closed, slight nod of concern. Subject: a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**face_talk.png 얼굴 · talk** · 크기 1024×1024 · 쓰이는 곳: 말풍선 타이핑 중 입 교차

```
Same character as the attached reference sheet. bust shot from the chest up, the face occupying about 55 percent of the frame height, head centered, three-quarter view facing slightly left, looking at the viewer, identical framing to the other face images of this character. Expression: mouth open mid-explanation, hand gesture active. Subject: a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge. Keep hair, clothing, lighting and crop exactly identical to the other three expression images; change only the facial expression. Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**emblem.png 엠블럼** · 크기 1024×1024 → 512 · 쓰이는 곳: 카드 모서리 · 공유 카드 · 파비콘 대체

```
Flat vector emblem icon: a geomantic compass dial: two concentric circles with eight radial ticks and a center dot, flat vector style, two-tone gold and navy, centered. Accent color #d8b45f with a dark navy #0b0e18 or off-white #f2ecdc as the second tone. Thick clean shapes readable at 32 pixels. Transparent background, no text, no gradient, no 3D, no face.
```


**card.png 공유 카드용 반신** · 크기 1024×1536 → 4:5 크롭 → 1080×1350 · 쓰이는 곳: 공유 카드 캔버스 합성

```
Same character as the attached reference sheet. Half-body illustration of a Korean male scholar in his late forties, neat short hair slightly greying at the temples, round horn-rimmed glasses, kind eyes with smile lines, a warm explaining smile, wearing a navy modernized hanbok jacket with fine gold thread accents over a white collarless shirt, holding a thick almanac book with a plain cover in his left hand and a brass compass-like geomantic dial (paecheol) in his right; accent color antique gold #d8b45f on the thread, dial and glasses frame edge. Composition: half-body, placed in the right third, turned toward the empty left side, hand extended as if presenting the blank space, dial glinting. The left two thirds of the frame must stay completely empty (text will be placed there later). Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, eye-level camera, centered composition, looking at the viewer, plain transparent background, no background scenery, no text, no letters, no logo, no watermark. Avoid: photorealism, 3D render look, extra fingers, text of any kind, gradient or scenery background, duplicate characters, cropped head, heavy blur.
```


**idle.webm 대기 영상 (선택, Sora/Runway/Kling용)** · 크기 1024×1536, 4s 루프 · 쓰이는 곳: 캐릭터 소개 화면(있으면 full.png 대신 재생)

```
Animate the attached full-body illustration as a seamless 4-second loop at 24 fps, camera locked, transparent or solid #00FF00 background for keying. Motion: he turns a page of the almanac, adjusts his glasses, nods and smiles, the dial glints. Movement amplitude very small, no camera move, no new elements, loop start and end frames identical. Keep the exact illustration style, no 3D conversion.
```


**배경 플레이트 (선택)** · 크기 1024×1536 · 쓰이는 곳: 캐릭터 소개 화면 뒤 배경(지금은 CSS 글로우가 대신함)

```
Atmospheric background plate with no characters: deep navy with faint gold constellation lines and a warm lamp glow from the lower right, no figures. Very low contrast so a character can be placed on top, darker toward the top, Korean webtoon-style character illustration, clean cel shading with two-tone shadows, key light from the top-left at 45 degrees, a thin rim light in the character's accent color along the right silhouette, clean 3px outlines, slightly desaturated mid-tones with one saturated accent color, subtle paper grain, no text, no logo.
```


---

## MBTI 사주 상품 비주얼


**mbti_tiles.png** · 크기 1024×1024 · 쓰이는 곳: 홈의 MBTI 사주 카드(지금은 CSS 타일이 대신함)

```
Four square tiles arranged two by two, each tile a dark navy #121829 rounded square with a thin teal #7fd1c7 border, each showing one large bold serif letter: E, N, F, P in teal, slight perspective tilt as if the tiles are floating, soft teal glow beneath, transparent background, no other text.
```

## 검수 체크리스트

- [ ] 시트와 각 파일의 얼굴·머리·의상이 같은 사람으로 보이는가 (다르면 레퍼런스를 다시 첨부하고 재생성)
- [ ] face 4종을 겹쳐 봤을 때 눈 위치가 같은가
- [ ] 전신이 왼쪽을 향한 3/4인가 (말풍선이 오른쪽에 붙음)
- [ ] 배경이 진짜 투명인가 (체커보드 확인), 이미지에 글자가 없는가
- [ ] 강조색이 의상·소품·눈 중 두 곳 이상에 들어갔는가
- [ ] card.png 왼쪽 2/3가 비어 있는가
- [ ] `master`는 본인 동의서 없이는 실제 얼굴을 닮게 만들지 않았는가

