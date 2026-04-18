@echo off
set NODE_PATH=%~dp0node-v20.11.1-win-x64
set PATH=%PATH%;%NODE_PATH%

echo Installing backend dependencies...
cd %~dp0
%NODE_PATH%\npm.cmd install

if %errorlevel% equ 0 (
    echo Backend dependencies installed successfully!
    echo Installing frontend dependencies...
    cd frontend
    %NODE_PATH%\npm.cmd install
    
    if %errorlevel% equ 0 (
        echo Frontend dependencies installed successfully!
    ) else (
        echo Failed to install frontend dependencies.
    )
) else (
    echo Failed to install backend dependencies.
)

pause