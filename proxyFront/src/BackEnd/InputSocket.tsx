import { Server, createServer, Socket, connect } from 'net';
import { mainWindow } from '../index';
import Data from './Data';
import DomainNameBlackList from './DomainNameBlackList';
import * as ProxyType from "personnal-shared/src/Type/ProxyType"
import * as Utilities from "personnal-shared/src/Class/Utilities"
import * as crypto from "crypto"
import KeyFactory from 'personnal-shared/src/Class/KeyFactory';

export default class InputSocket {
    private static inputSocket: InputSocket;

    server: Server | null;
    trafficAnalyze: string[] = ["Traffic -------->>\n\n"];
    allConnections: Set<Socket> = new Set();

    private constructor() {
        this.server = null;
    }

    public static getInputSocket(): InputSocket {
        if (!InputSocket.inputSocket) {
            InputSocket.inputSocket = new InputSocket();
        }
        return InputSocket.inputSocket;
    }

    stopInputSocket() {
        if (this.server) {
            this.server.close();
        }
        this.allConnections.forEach((socket: Socket) => {
            socket.destroy()
        })
        this.allConnections.clear();
        console.log("server stopped\n\n")
        this.server = null;
    }

    startInputSocket() {
        this.server = createServer((clientSocket: Socket) => {
            console.log("Client connected : " + clientSocket.localAddress + "\n\n");
            this.allConnections.add(clientSocket);
            this.connectionSequence(clientSocket)
        });

        try {
            this.server.listen(Data.getData().inputPort, "127.0.0.1", () => {
                console.log("Server started on 127.0.0.1:" + Data.getData().inputPort + "\n\n");
            });
            return true;
        } catch (error) {
            return false;
        }

    }

    initializationSequence(targetSocket: Socket, clientSocket: Socket, initialPayload: Buffer) {
        let initialized = false;
        let sourcePayloadBuffer: Buffer = Buffer.from("");
        targetSocket.on('data', (sourcePayload) => {
            if (!initialized) {
                sourcePayloadBuffer = Buffer.concat([sourcePayloadBuffer, sourcePayload]);
                try {
                    let packetRest: ProxyType.PacketRest = Utilities.isPacketFull(sourcePayloadBuffer.toString(), "----END----");
                    if (!packetRest.packet.length) throw new Error("Target packet isnt full : \n" + sourcePayloadBuffer.toString() + "\n\n");
                    sourcePayloadBuffer = Buffer.from(packetRest.remaining);

                    packetRest.packet.forEach((value) => {
                        let json: ProxyType.Packet | undefined = Utilities.decodeBufferedJsonPacket(Buffer.from(value));
                        if (!json) {
                            throw new Error("Json Parsing error :\n" + value.toString() + "\n\n");
                        }

                        if (json.type == ProxyType.PacketType.INITIALIZATION) {
                            initialized = true;
                            let symetricKey = crypto.privateDecrypt(Data.getData().RSAPrivateKey, Buffer.from(json.encryptedSymetricKey as string, "base64"))

                            clientSocket.on('data', (clientData) => {
                                targetSocket.write(this.createEncryptedPacket(clientData, symetricKey) + "----END----");
                            });

                            this.bridgeTargetClient(targetSocket, clientSocket, symetricKey);

                            const data = this.createEncryptedPacket(initialPayload, symetricKey)
                            if (!data) {
                                console.error("data is undefined on create bridge\n\n");
                            } else {
                                targetSocket.write(data + "----END----");
                            }
                        }
                    })
                } catch (error) {
                    console.log(error)
                }
            }
        });
    }

    connectionSequence(clientSocket: Socket) {
        let connected: boolean = false;
        let initialPayloadBuffer: Buffer = Buffer.from("");
        clientSocket.on('data', (initialPayload) => {
            if (!connected) {
                initialPayloadBuffer = Buffer.concat([initialPayloadBuffer, initialPayload]);
                try {
                    let packetRest: ProxyType.PacketRest = Utilities.isPacketFull(initialPayloadBuffer.toString(), "\r\n\r\n");
                    if (!packetRest.packet.length) throw new Error("Source packet isnt full : \n" + initialPayloadBuffer.toString().substring(0, 10) + "\n\n");
                    initialPayloadBuffer = Buffer.from(packetRest.remaining);

                    connected = true;
                    this.createBridge(clientSocket, Buffer.from(packetRest.packet[0])).catch((error) => {
                        if (error instanceof ErrorBlackList || error instanceof ErrorHost) {
                            console.log(error + "\n\n")
                            clientSocket.end();
                        } else {
                            console.log(error + "\n\n")
                        }

                    });
                } catch (error) {
                    console.log(error + "\n\n")
                }
            };
        })
    }

    async createBridge(clientSocket: Socket, initialPayload: Buffer) {
        let host: ProxyType.HostHeader | undefined = Utilities.getHost(initialPayload.toString());
        if (!host) throw new ErrorHost("Host is undefined\n\n")

        const isError = await DomainNameBlackList.getDomainNameBlackList().isBlackListError(host.host);
        if (isError) throw new ErrorBlackList("Black listed url : " + host.host + " Request not handled\n\n");

        this.handleFontProxyDataSending(initialPayload.toString());

        let targetSocket = connect(Data.getData().outputPort, Data.getData().outputIp, () => {
            console.log("Target socket on " + Data.getData().outputIp + ":" + Data.getData().outputPort + " for " + host!.host + "\n\n")
            targetSocket.write(
                Utilities.createBufferedJsonPacket(
                    ProxyType.PacketType.INITIALIZATION,
                    undefined,
                    "",
                    Data.getData().RSAKey
                ) + "----END----"
            );

            this.initializationSequence(targetSocket, clientSocket, initialPayload)

            targetSocket.on('error', (err) => {
                console.error('Error on target socket:\n' + err + "\n\n");
                clientSocket.end();
            });

            targetSocket.on('end', () => {
                console.error('Target disconnected\n\n');
                clientSocket.end();
            });

            clientSocket.on('error', (err) => {
                console.error('\n\nError on client socket:', err);
                targetSocket.end();
                this.allConnections.delete(clientSocket);
            });

            clientSocket.on('end', () => {
                console.log('Client disconnected\n\n');
                targetSocket.end();
                this.allConnections.delete(clientSocket);
            });
        });
    };



    handleFontProxyDataSending(proxyData: string) {
        if (mainWindow) {
            mainWindow.webContents.send('proxyData', proxyData);
            this.trafficAnalyze.unshift(proxyData);
            if (this.trafficAnalyze.length > 40) this.trafficAnalyze = this.trafficAnalyze.slice(0, 38);
        }
    }


    bridgeTargetClient(sourceSocket: Socket, destinationSocket: Socket, symetricKey: Buffer) {
        let sourcePayloadBuffer: Buffer = Buffer.from("");
        sourceSocket.on('data', (sourcePayload) => {
            sourcePayloadBuffer = Buffer.concat([sourcePayloadBuffer, sourcePayload]);
            try {
                let packetRest: ProxyType.PacketRest = Utilities.isPacketFull(sourcePayloadBuffer.toString(), "----END----");
                if (!packetRest.packet.length) throw new Error("Target packet isnt full : \n" + sourcePayloadBuffer.toString().substring(0, 100) + "\n\n");

                sourcePayloadBuffer = Buffer.from(packetRest.remaining);

                packetRest.packet.forEach((value) => {
                    let json: ProxyType.Packet | undefined = Utilities.decodeBufferedJsonPacket(Buffer.from(value));
                    if (!json) throw new Error("Json Parsing error :\n" + value.toString() + "\n\n");

                    let data: Buffer | undefined = this.customDecipher(json.symetricEncryptionData, symetricKey)
                    if (!data) {
                        console.error("data is undefined on bridge target client\n\n");
                    }
                    else {
                        destinationSocket.write(data);
                    }
                })
            } catch (error) {
                console.log(error + "\n\n")
            }
        });
    }

    customDecipher(symetricEncryptionData: ProxyType.SymmetricEncryptionData, symetricKey: Buffer): Buffer | undefined {
        let symetricEncryptionDataB = {
            authTag: Buffer.from(symetricEncryptionData.authTag as string, "base64"),
            encryptedData: Buffer.from(symetricEncryptionData.encryptedData as string, "base64"),
            iv: Buffer.from(symetricEncryptionData.iv as string, "base64")
        }

        return KeyFactory.getKeyFactory().decryptSymmetric(symetricEncryptionDataB, symetricKey);
    }

    getDecryptedPacket(jsonPayload: ProxyType.Packet): Buffer | undefined {

        let symetricEncryptionData: ProxyType.SymmetricEncryptionData = {
            iv: Buffer.from(jsonPayload.symetricEncryptionData.iv as string, "base64"),
            encryptedData: Buffer.from(jsonPayload.symetricEncryptionData.encryptedData as string, "base64"),
            authTag: Buffer.from(jsonPayload.symetricEncryptionData.authTag as string, "base64")

        }

        return KeyFactory.getKeyFactory().decryptSymmetric(
            symetricEncryptionData,
            crypto.privateDecrypt(Data.getData().RSAPrivateKey, Buffer.from(jsonPayload.encryptedSymetricKey as string, "base64"))
        );
    }

    createEncryptedPacket(targetData: Buffer, symetricKey: Buffer): Buffer | undefined {
        let encryptedPayload = KeyFactory.getKeyFactory().encryptSymmetric(targetData, symetricKey);
        if (!encryptedPayload) return undefined;

        encryptedPayload.authTag = encryptedPayload.authTag.toString("base64")
        encryptedPayload.encryptedData = encryptedPayload.encryptedData.toString("base64")
        encryptedPayload.iv = encryptedPayload.iv.toString("base64")

        return Utilities.createBufferedJsonPacket(
            ProxyType.PacketType.DATA,
            encryptedPayload,
            "",
            Data.getData().RSAKey
        );
    }
}

class ErrorBlackList extends Error { }
class ErrorHost extends Error { }