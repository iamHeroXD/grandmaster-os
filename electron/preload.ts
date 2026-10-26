import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openPgnDialog: () => ipcRenderer.invoke('dialog:openPgn'),
  savePgnDialog: (defaultFilename: string, content: string) =>
    ipcRenderer.invoke('dialog:savePgn', defaultFilename, content),
});
