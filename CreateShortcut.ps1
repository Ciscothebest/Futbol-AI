$DesktopPath = [Environment]::GetFolderPath('Desktop')
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\FutbolAI.lnk")
$Shortcut.TargetPath = "C:\Users\franc\.gemini\antigravity\scratch\football-ai-platform\Iniciar FutbolAI.bat"
$Shortcut.WorkingDirectory = "C:\Users\franc\.gemini\antigravity\scratch\football-ai-platform"
$Shortcut.Description = "Iniciar plataforma FutbolAI"
$Shortcut.IconLocation = "shell32.dll,13"
$Shortcut.Save()
Write-Host "✅ Acceso directo creado en: $DesktopPath"
