@echo off
REM =============================================================================
REM  patch-demo.bat - Re-apply site customizations after a Unity WebGL export.
REM
REM  Unity overwrites demo/index.html and demo/TemplateData/style.css on each
REM  build. This script copies our customized versions from demo-site-template/.
REM
REM  WORKFLOW
REM    1. Build WebGL in Unity (Compression Format: Gzip)
REM    2. Copy Unity output into demo/ (Build, StreamingAssets, TemplateData, etc.)
REM    3. Run patch-demo.bat   (or let push-site.bat run it automatically)
REM    4. Run push-site.bat
REM =============================================================================
setlocal
cd /d "%~dp0"

set "TEMPLATE=demo-site-template"
set "DEMO=demo"

if not exist "%TEMPLATE%\index.html" (
  echo ERROR: Missing %TEMPLATE%\index.html
  exit /b 1
)

if not exist "%TEMPLATE%\TemplateData\style.css" (
  echo ERROR: Missing %TEMPLATE%\TemplateData\style.css
  exit /b 1
)

if not exist "%DEMO%\Build\demo.loader.js" (
  echo WARNING: %DEMO%\Build\demo.loader.js not found.
  echo          Copy your Unity build into demo\ before pushing.
)

echo Applying demo customizations...

copy /Y "%TEMPLATE%\index.html" "%DEMO%\index.html" >nul
copy /Y "%TEMPLATE%\TemplateData\style.css" "%DEMO%\TemplateData\style.css" >nul

REM Remove assets Unity re-adds that we do not use
if exist "%DEMO%\TemplateData\unity-logo-dark.png" del /q "%DEMO%\TemplateData\unity-logo-dark.png"
if exist "%DEMO%\TemplateData\progress-bar-empty-dark.png" del /q "%DEMO%\TemplateData\progress-bar-empty-dark.png"
if exist "%DEMO%\TemplateData\progress-bar-full-dark.png" del /q "%DEMO%\TemplateData\progress-bar-full-dark.png"
if exist "%DEMO%\TemplateData\webgl-logo.png" del /q "%DEMO%\TemplateData\webgl-logo.png"
if exist "%DEMO%\TemplateData\MemoryProfiler.png" del /q "%DEMO%\TemplateData\MemoryProfiler.png"
if exist "%DEMO%\TemplateData\webmemd-icon.png" del /q "%DEMO%\TemplateData\webmemd-icon.png"

echo Done. Patched %DEMO%\index.html and %DEMO%\TemplateData\style.css
exit /b 0
