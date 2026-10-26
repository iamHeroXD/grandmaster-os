Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
strRoot = fso.GetParentFolderName(strPath)
WshShell.CurrentDirectory = strRoot
WshShell.Run "node scripts/desktop-server.js", 0, False
