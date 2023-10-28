import { IpcMainInvokeEvent, ipcMain } from "electron";
import Data from "./Data";
import InputSocket from "./InputSocket";
import DomainNameBlackList from "./DomainNameBlackList";

ipcMain.handle('connection', (event: IpcMainInvokeEvent, outputIp: string, outputPort: number, inputPort: number) => {
    Data.getData().setData(outputIp, outputPort, inputPort);
    let socket = InputSocket.getInputSocket();
    return socket.startInputSocket();
});

ipcMain.handle('disconnection', (event: IpcMainInvokeEvent) => {
    let socket = InputSocket.getInputSocket();
    socket.stopInputSocket();
});

ipcMain.handle('getConnectionStatus', (event: IpcMainInvokeEvent) => {
    let socket = InputSocket.getInputSocket();
    return socket.server ? true : false;
});

ipcMain.handle('getDataJson', (event: IpcMainInvokeEvent) => {
    return Data.getData().getDataJson();
});

ipcMain.handle('request-trafficAnalyze', (event) => {
    return InputSocket.getInputSocket().trafficAnalyze;
});

ipcMain.handle('setBlackListPath', (event, path: string[]) => {
    DomainNameBlackList.getDomainNameBlackList().setSourceFile(path);
});

ipcMain.handle('getBlackListPath', (event) => {
    return DomainNameBlackList.getDomainNameBlackList().sourceFile
});