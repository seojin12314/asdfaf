캐릭터 이미지 폴더. 스펙은 `docs/character-art-brief.md`, 재생성용 한글 프롬프트는 `docs/character-prompts-ko.md`, 납품 검수 결과는 `docs/character-asset-audit.json` 참고.

구조 (캐릭터당 12장):
  <id>/full.png, face.png, face_smile.png, face_serious.png, face_talk.png, emblem.png, card.png
  <id>/bg_intro_far.png, bg_intro_mid.png, bg_intro_near.png, bg_header.png, bg_card.png
  id ∈ flame, sage, granny, child, hunter, master

현재 6명 × 12장 = 72장 적용됨 (2026-10-30, 사주도감 V2 납품본). 각 PNG 1MB 이하, sRGB.
파일이 없으면 앱은 SVG 엠블럼으로 대체한다(코드 수정 불필요).
