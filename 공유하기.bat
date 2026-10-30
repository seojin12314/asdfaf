@echo off
chcp 65001 >nul
title 사주도감 임시 공유
rem 로컬 정적 서버(3195) + cloudflared 임시 터널. 창을 닫으면 링크가 끊긴다. Vercel 등 배포 없음.
set CF=C:\Users\User\Documents\AI saju\tools\cloudflared.exe
cd /d "%~dp0mvp\saju"
start "saju-dogam server" /min python "%~dp0tools\serve.py" 3195
timeout /t 2 >nul
echo 아래에 https://....trycloudflare.com 주소가 뜨면 그 링크를 친구에게 보내면 됩니다. (로그인 불필요)
"%CF%" tunnel --url http://127.0.0.1:3195 --no-autoupdate
