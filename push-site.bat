@echo off
setlocal
cd /d "%~dp0"

git add -A
git diff --cached --quiet
if errorlevel 1 (
  if "%~1"=="" (
    git commit -m "Update site"
  ) else (
    git commit -m "%*"
  )
  if errorlevel 1 echo Commit failed - check messages above.
) else (
  echo Nothing new to commit - pushing anyway in case a previous push failed.
)

echo.
git push
if errorlevel 1 (
  echo Push failed.
) else (
  echo Push OK - Cloudflare will rebuild if new commits reached GitHub.
)

pause
