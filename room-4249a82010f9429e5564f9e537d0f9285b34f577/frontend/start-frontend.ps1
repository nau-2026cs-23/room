$nodePath = "..\node-v20.11.1-win-x64"
$env:PATH = "$nodePath;$env:PATH"

echo "Starting frontend server..."
& "$nodePath\npm.cmd" run dev