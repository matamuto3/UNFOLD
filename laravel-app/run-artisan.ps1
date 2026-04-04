$ErrorActionPreference = 'Stop'

$php = 'C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe'

Remove-Item Env:\https_proxy -ErrorAction SilentlyContinue
Remove-Item Env:\HTTPS_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:\http_proxy -ErrorAction SilentlyContinue
Remove-Item Env:\HTTP_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:\all_proxy -ErrorAction SilentlyContinue
Remove-Item Env:\ALL_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_HTTP_PROXY -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_HTTPS_PROXY -ErrorAction SilentlyContinue

& $php artisan @args
