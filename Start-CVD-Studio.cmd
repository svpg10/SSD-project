@echo off
title CVD Studio - Local Workbench
cd /d "%~dp0"
set "CVD_NODE=%ProgramFiles%\nodejs\node.exe"
if exist "%CVD_NODE%" goto launch
for /f "delims=" %%N in ('where node 2^>nul') do set "CVD_NODE=%%N"
if exist "%CVD_NODE%" goto launch
echo Node.js was not found. > outputs\startup-diagnostic.log
echo Node.js was not found. See outputs\startup-diagnostic.log.
pause
exit /b 1
:launch
"%CVD_NODE%" scripts/launch.mjs
pause
