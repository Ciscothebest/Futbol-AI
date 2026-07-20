$DesktopPath = [Environment]::GetFolderPath('Desktop')
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\FutbolAI Local.lnk")
$Shortcut.TargetPath = "$PSScriptRoot\Iniciar FutbolAI.bat"
$Shortcut.WorkingDirectory = "$PSScriptRoot"
$Shortcut.Description = "Iniciar plataforma FutbolAI Local"
$Shortcut.IconLocation = "shell32.dll,13"
$Shortcut.Save()
Write-Host "Shortcut created for Futbol AI Local."
