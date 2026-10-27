Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strScriptPath = WScript.ScriptFullName
strScriptDir = fso.GetParentFolderName(strScriptPath)
strProjectRoot = fso.GetParentFolderName(strScriptDir)

WshShell.CurrentDirectory = strProjectRoot
WshShell.Run "node """ & strProjectRoot & "\scripts\desktop-server.js""", 0, False
