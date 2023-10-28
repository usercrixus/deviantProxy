import * as ProxyType from "../Type/ProxyType"

export function getHost(dataStr: string): ProxyType.HostHeader | undefined {
    const hostHeaderMatch = RegExp(/Host: (.+?)(?::(\d+))?(\r\n|$)/i).exec(dataStr);
    if (!hostHeaderMatch) {
        console.error('Invalid HTTP request: No Host header found\n\n');
        return undefined;
    }

    return {
        header: hostHeaderMatch[0]?.trim(),
        host: hostHeaderMatch[1]?.trim(),
        port: hostHeaderMatch[2]?.trim() ? Number.parseInt(hostHeaderMatch[2]) : 80
    };
}

export function createBufferedJsonPacket(type: ProxyType.PacketType, symetricEncryptionData: ProxyType.SymmetricEncryptionData | undefined, encryptedSymetricKey: string, asymetricPublicKey: string): Buffer {
    if (!symetricEncryptionData) symetricEncryptionData = ProxyType.createSymmetricEncryptionData();
    const json: ProxyType.Packet = {
        type,
        symetricEncryptionData,
        encryptedSymetricKey,
        asymetricPublicKey
    }
    return Buffer.from(JSON.stringify(json));
}

export function decodeBufferedJsonPacket(packet: Buffer): ProxyType.Packet | undefined {
    try {
        const json: ProxyType.Packet = JSON.parse(packet.toString());
        return json;
    } catch (error) {
        console.error('Error decoding JSON packet:\n' + error + "\n\n");
        return undefined;
    }
}

export function isPacketFull(payload: string, delimiter: string): ProxyType.PacketRest {
    let packet: string[] = payload.split(delimiter);
    const isFull: boolean = payload.endsWith(delimiter);
    let remaining: string;
    if (isFull) {
        packet = packet.slice(0, -1);
        remaining = "";
    } else {
        remaining = packet[packet.length - 1];
        packet = packet.slice(0, -1);
    }

    return { packet, remaining }
}