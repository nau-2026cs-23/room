$nodePath = "$PSScriptRoot\node-v20.11.1-win-x64"
$env:PATH += ";$nodePath"

echo "Installing backend dependencies..."
Set-Location $PSScriptRoot
& "$nodePath\npm.cmd" install

if ($LASTEXITCODE -eq 0) {
    echo "Backend dependencies installed successfully!"
    echo "Installing frontend dependencies..."
    Set-Location "frontend"
    & "$nodePath\npm.cmd" install
    
    if ($LASTEXITCODE -eq 0) {
        echo "Frontend dependencies installed successfully!"
    } else {
        echo "Failed to install frontend dependencies."
    }
} else {
    echo "Failed to install backend dependencies."
}

Read-Host "Press Enter to exit"