@echo off
REM =============================================================================
REM  push-site.bat - Commit local changes and push to GitHub (triggers Cloudflare).
REM
REM  USAGE
REM    Double-click, or:  push-site.bat
REM    Custom message:     push-site.bat Fixed typo on hero
REM
REM  GITHUB (who / where)
REM    Sign in as:     llamatech-unity
REM    Repository:     llamatech-unity / llamatech-site
REM    Remote URL:     https://github.com/llamatech-unity/llamatech-site.git
REM
REM  AUTH - Git does NOT accept the GitHub account password for push anymore.
REM    Use a Personal Access Token (PAT) as the "Password" when git prompts.
REM
REM    Create or edit token (logged in as llamatech-unity):
REM      GitHub.com -> Profile (top right) -> Settings
REM      -> Developer settings -> Personal access tokens -> Fine-grained tokens
REM      -> Generate new token (or edit existing)
REM        - Resource owner: llamatech-unity
REM        - Repository access: include llamatech-site
REM        - Repository permissions -> Contents: Read and write
REM      (Classic tokens also work: scope "repo".)
REM
REM    First push after token change: git may ask:
REM      Username: llamatech-unity
REM      Password: <paste the token, NOT the GitHub login password>
REM    Windows often saves this in Credential Manager so you only paste once.
REM    If push fails with 403 after changing token: Win key -> Credential Manager
REM      -> Windows Credentials -> remove git:https://github.com -> try again.
REM
REM  PARTNER (different person / different GitHub login)
REM    Repo owner adds them: llamatech-site -> Settings -> Collaborators -> Write
REM    Partner creates their own fine-grained token (Contents: Read and write
REM    on llamatech-site only). They use their GitHub username + that token
REM    when git prompts. Or clone via SSH with their own SSH key on GitHub.
REM
REM  LIVE SITE
REM    Pushes go to branch "main". Cloudflare Pages rebuilds from that repo.
REM =============================================================================
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
