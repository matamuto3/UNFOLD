@echo off
setlocal

set "NODE_EXE="
for /f "usebackq delims=" %%F in (`powershell -NoProfile -Command "$c=@(); $c += Join-Path $env:ProgramFiles 'nodejs\\node.exe'; $c += Join-Path $env:LocalAppData 'nvm\\nodejs\\node.exe'; $c += Join-Path $env:UserProfile 'AppData\\Local\\Volta\\bin\\node.exe'; $c += 'C:\\laragon\\bin\\nodejs\\node.exe'; $c += Get-ChildItem (Join-Path $env:LocalAppData 'Microsoft\\WinGet\\Packages') -Directory -Filter 'OpenJS.NodeJS.LTS_*' -ErrorAction SilentlyContinue | ForEach-Object { Get-ChildItem $_.FullName -Recurse -Filter 'node.exe' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName }; $c | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1"`) do (
  set "NODE_EXE=%%F"
)

if not defined NODE_EXE (
  echo Standalone Node.js was not found.
  echo Run: winget install OpenJS.NodeJS.LTS --scope user
  exit /b 1
)

"%NODE_EXE%" %*
exit /b %errorlevel%
