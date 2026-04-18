$nodePath = "$PSScriptRoot\node-v20.11.1-win-x64"
$env:PATH = "$nodePath;$env:PATH"

Set-Location "$PSScriptRoot\frontend"
echo "Starting frontend server..."
& "$nodePath\npm.cmd" run dev