@echo off
setlocal
cd /d "%~dp0"

git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo Nothing to commit - working tree clean.
  goto :done
)

if "%~1"=="" (
  set "MSG=Update site"
) else (
  set "MSG=%*"
)

git commit -m "%MSG%"
if errorlevel 1 (
  echo Commit failed.
  goto :done
)

git push
if errorlevel 1 (
  echo Push failed.
  goto :done
)

echo.
echo Done - Cloudflare should rebuild shortly.

:done
pause
