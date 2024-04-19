import { Server, createServer, Socket, connect } from 'net';
import KeyFactory from "personnal-shared/src/Class/KeyFactory"
import * as ProxyType from "personnal-shared/src/Type/ProxyType"
import * as Utilities from "personnal-shared/src/Class/Utilities"

export default class InputSocket {
    port: number;
    static server: Server;

    constructor(port: number) {
        this.port = port;
        this.serverInitialisation();
    }

    serverInitialisation() {
        InputSocket.server = createServer((clientSocket: Socket) => {
            console.log('Client connected\n\n');
            let connected: boolean = false;
            let clientSocketDataBuffer: Buffer = Buffer.from("");
            let symetricKey: Buffer = Buffer.from("");
            clientSocket.on('data', (dataInitialization) => {
                if (!connected) {
                    clientSocketDataBuffer = Buffer.concat([clientSocketDataBuffer, dataInitialization]);
                    try {
                        let packetRest: ProxyType.PacketRest = Utilities.isPacketFull(clientSocketDataBuffer.toString(), "----END----");
                        if (!packetRest.packet) throw new Error("Packet isnt full :\n" + clientSocketDataBuffer.toString() + "\n\n");
                        const jsonInitialization = Utilities.decodeBufferedJsonPacket(Buffer.from(packetRest.packet[0]));
                        if (!jsonInitialization) throw new Error("Json parsing error connection initialization\n\n");
                        clientSocketDataBuffer = Buffer.from(packetRest.remaining);

                        if (jsonInitialization.type == ProxyType.PacketType.INITIALIZATION) {
                            try {
                                if (!clientSocket.localAddress) throw new Error("Client socket local adress (ip) undefined\n\n")
                                symetricKey = this.sendInitializationPacket(clientSocket, jsonInitialization);
                            } catch (error) {
                                console.log(error + "\n\n");
                                throw new ErrorInitialization("Failed to send initialization packet\n\n")
                            }
                        } else if (jsonInitialization.type == ProxyType.PacketType.DATA) {
                            connected = this.dataRooting(clientSocket, jsonInitialization, symetricKey);
                        }
                    } catch (error) {
                        if (error instanceof ErrorInitialization) {
                            console.log(error.message + "\n\n");
                            clientSocket.end();
                        } else {
                            console.log(error + "\n\n")
                        }
                    }
                }
            });
            clientSocket.on('end', () => {
                console.log('Client disconnected\n\n');
            });
            clientSocket.on('error', (err) => {
                console.error('Error on client socket:\n' + err + "\n\n");
            });
        });
        InputSocket.server.listen(this.port, "0.0.0.0", () => {
            console.log("Server started\n\n");
        });
    }

    dataRooting(clientSocket: Socket, jsonInitialization: ProxyType.Packet, symetricKey: Buffer): boolean {
        let decryptedPayloadBuffer = this.decryptPacket(jsonInitialization, clientSocket, symetricKey);
        if (!decryptedPayloadBuffer) throw new Error("Decrypted initial payload failed\n\n");

        let decryptedPayloadString: string = decryptedPayloadBuffer.toString()
        if (decryptedPayloadString.startsWith('CONNECT')) {
            this.httpsBridge(clientSocket, decryptedPayloadString, jsonInitialization, symetricKey)
            return true;
        } else if (decryptedPayloadString.startsWith('GET') || decryptedPayloadString.startsWith('POST') || decryptedPayloadString.startsWith('PUT') || decryptedPayloadString.startsWith('DELETE') || decryptedPayloadString.startsWith('OPTIONS')) {
            this.httpBridge(clientSocket, decryptedPayloadString, jsonInitialization, symetricKey);
            return true;
        } else {
            console.error('Unsupported method:\n' + decryptedPayloadString + "\n\n");
            clientSocket.end();
            return false
        }
    }

    httpBridge(clientSocket: Socket, decryptedPayload: string, jsonInitialization: ProxyType.Packet, symetricKey: Buffer) {
        const host: ProxyType.HostHeader | undefined = Utilities.getHost(decryptedPayload);
        if (!host) throw new Error("Http host header is null\n\n");

        console.log('HTTP request to Host : ' + host.host + ':' + host.port + "\n\n");
        let targetSocket = connect(host.port, host.host, () => {
            this.bridgeClientTarget(clientSocket, targetSocket, symetricKey)
            targetSocket.write(Buffer.from(decryptedPayload) + "\r\n\r\n");
        });

        targetSocket.on('data', (targetData) => {
            clientSocket.write(this.createEncryptedPacket(clientSocket, targetData, jsonInitialization, symetricKey) + "----END----");
        });

        targetSocket.on('error', (err) => {
            console.error('Error on target socket:' + err + "\n\n");
            clientSocket.end();
        });

    }

    httpsBridge(clientSocket: Socket, decryptedPayload: string, jsonInitialization: ProxyType.Packet, symetricKey: Buffer) {
        const host: ProxyType.HostHeader | undefined = Utilities.getHost(decryptedPayload);
        if (!host) throw new Error("Https host header is null\n\n");

        console.log('Connecting to Host:' + host.host + ':' + host.port + "\n\n");

        // OK---------------------
        let targetSocket = connect(host.port, host.host, () => {

            this.bridgeClientTarget(clientSocket, targetSocket, symetricKey);
            const data = this.createEncryptedPacket(clientSocket, Buffer.from('HTTP/1.1 200 Connection Established\r\n\r\n'), jsonInitialization, symetricKey);
            if (!data) {
                console.error("data is undefined on https bridge\n\n");
            }
            else {
                clientSocket.write(data + "----END----");
            }
        });

        targetSocket.on('data', (targetData) => {
            const data = this.createEncryptedPacket(clientSocket, targetData, jsonInitialization, symetricKey);
            if (!data) {
                console.error("data is undefined on https bridge\n\n");
            }
            else {
                clientSocket.write(data + "----END----");
            }
        });

        targetSocket.on('error', (error) => {
            console.log(error + "\n\n");
            targetSocket.end();
        });

    }

    bridgeClientTarget(clientSocket: Socket, targetSocket: Socket, symetricKey: Buffer) {
        let clientPayloadBuffer: Buffer = Buffer.from("");
        clientSocket.on('data', (clientPayload) => {
            clientPayloadBuffer = Buffer.concat([clientPayloadBuffer, clientPayload]);
            try {
                let packetRest: ProxyType.PacketRest = Utilities.isPacketFull(clientPayloadBuffer.toString(), "----END----");
                if (!packetRest.packet.length) throw new Error("Source packet isnt full : \n" + clientPayloadBuffer.toString().substring(0, 50) + "\n\n");
                clientPayloadBuffer = Buffer.from(packetRest.remaining);

                packetRest.packet.forEach((value) => {
                    let json = Utilities.decodeBufferedJsonPacket(Buffer.from(value));
                    if (!json) throw new Error("Json Parsing error :\n" + value.toString() + "\n\n");

                    let decryptedPayloadBuffer = this.decryptPacket(json, clientSocket, symetricKey)
                    if (!decryptedPayloadBuffer) throw new Error("Decrypted bridge client target payload failed\n\n");

                    targetSocket.write(decryptedPayloadBuffer);
                });
            } catch (error) {
                console.log(error + "\n\n")
            }
        });
    }

    sendInitializationPacket(clientSocket: Socket, jsonInitialization: ProxyType.Packet) {
        try {
            let symetricKey = KeyFactory.getKeyFactory().generateSymmetricKey();
            let encryptedSymetricKey = KeyFactory.getKeyFactory().encryptSymmetricKey(
                symetricKey,
                jsonInitialization.asymetricPublicKey
            );
            if (!encryptedSymetricKey) throw new ErrorCipher("EncryptedSymetricKey is null\n\n")

            clientSocket.write(Utilities.createBufferedJsonPacket(
                ProxyType.PacketType.INITIALIZATION,
                undefined,
                encryptedSymetricKey.toString("base64"),
                ""
            ) + "----END----")

            return symetricKey;
        } catch (error) {
            console.log(error + "\n\n");
            throw new ErrorInitialization("Initialization packet has not been sent\n\n")
        }
    }

    createEncryptedPacket(targetSocket: Socket, targetData: Buffer, jsonInitialization: ProxyType.Packet, symetricKey: Buffer): Buffer | undefined {
        try {
            let encryptedPayload: ProxyType.SymmetricEncryptionData | undefined = KeyFactory.getKeyFactory().encryptSymmetric(targetData, symetricKey);
            if (!encryptedPayload) throw new ErrorCipher("encryptedPayload is null\n\n")

            encryptedPayload.authTag = encryptedPayload.authTag.toString("base64")
            encryptedPayload.encryptedData = encryptedPayload.encryptedData.toString("base64")
            encryptedPayload.iv = encryptedPayload.iv.toString("base64")
            let encryptedSymetricKey = KeyFactory.getKeyFactory().encryptSymmetricKey(
                symetricKey,
                jsonInitialization.asymetricPublicKey
            );
            if (!encryptedSymetricKey) throw new ErrorCipher("encryptedSymetricKey is null\n\n")

            return Utilities.createBufferedJsonPacket(
                ProxyType.PacketType.DATA,
                encryptedPayload,
                encryptedSymetricKey.toString("base64"),
                ""
            );
        } catch (error) {
            console.log(error + "\n\n")
            return undefined
        }
    }

    decryptPacket(jsonPayload: ProxyType.Packet, clientSocket: Socket, symetricKey: Buffer): Buffer | undefined {

        let symetricEncryptionData: ProxyType.SymmetricEncryptionData = {
            iv: Buffer.from(jsonPayload.symetricEncryptionData.iv as string, "base64"),
            encryptedData: Buffer.from(jsonPayload.symetricEncryptionData.encryptedData as string, "base64"),
            authTag: Buffer.from(jsonPayload.symetricEncryptionData.authTag as string, "base64")
        }

        return KeyFactory.getKeyFactory().decryptSymmetric(
            symetricEncryptionData,
            symetricKey
        )!;
    }
}

class ErrorInitialization extends Error { }
class ErrorCipher extends Error { }
class ErrorDecipher extends Error { }