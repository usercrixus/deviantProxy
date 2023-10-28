// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('proxy', {
    connection: (outputIp: string, outputPort: number, inputPort: number) => ipcRenderer.invoke('connection', outputIp, outputPort, inputPort),
    disconnection: () => ipcRenderer.invoke('disconnection'),
    getConnectionStatus: () => ipcRenderer.invoke('getConnectionStatus'),
    getDataJson: () => ipcRenderer.invoke('getDataJson'),
    trafficAnalyzerHistory: () => ipcRenderer.invoke('request-trafficAnalyze'),
    setBlackListPath: (path: string[]) => ipcRenderer.invoke('setBlackListPath', path),
    getBlackListPath: () => ipcRenderer.invoke('getBlackListPath')
});


contextBridge.exposeInMainWorld(
    'api', {
    send: (channel: any, data: any) => ipcRenderer.send(channel, data),
    receive: (channel: any, func: any) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});