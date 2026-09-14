$root = "E:\Desktop\nxtgensec-ctf-platform"

Start-Process powershell -WorkingDirectory "$root\backend" -ArgumentList @(
    "-NoExit",
    "-Command",
    "npm run dev"
)

Start-Process powershell -WorkingDirectory "$root\frontend" -ArgumentList @(
    "-NoExit",
    "-Command",
    "npm run dev -- --host 127.0.0.1 --port 4444"
)

Write-Host ""
Write-Host "NXTGENSEC local development started."
Write-Host "Frontend: http://localhost:4444"
Write-Host "Backend : http://localhost:4445"
