import { IpcRendererEvent } from "electron";
import { AdressData } from "personnal-shared/Class/Type/ProxyType";

export interface IPCProxy {
    connection: (outputIp: string, outputPort: number, inputPort: number) => Promise<boolean>,
    disconnection: () => void,
    getConnectionStatus: () => Promise<boolean>,
    getDataJson: () => Promise<AdressData>
    trafficAnalyzerHistory: () => Promise<string[]>,
    setBlackListPath: (path: string[]) => void,
    getBlackListPath: () => Promise<string[]>
}

export interface IPCApi {
    send: (channel: string, data: any) => void;
    receive: (channel: string, func: (event: IpcRendererEvent, ...args: any[]) => void) => void;
}
declare global {
    interface Window {
        proxy: IPCProxy;
        api: IPCApi;
    }
}