$nodePath = "$PSScriptRoot\node-v20.11.1-win-x64"
$env:PATH = "$nodePath;$env:PATH"

Set-Location $PSScriptRoot
echo "Starting backend server..."
& "$nodePath\npx.cmd" tsx watch backend/server.ts