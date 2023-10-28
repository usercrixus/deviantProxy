export type HostHeader = {
    header: string;
    host: string;
    port: number;
}

export type Packet = {
    type: PacketType;
    symetricEncryptionData: SymmetricEncryptionData;
    encryptedSymetricKey: Buffer | string;
    asymetricPublicKey: string;
}

export type PacketRest = {
    packet: string[];
    remaining: string;
}

export type Keys = {
    publicKey: string;
    privateKey: string;

}

export type SymmetricEncryptionData = {
    iv: Buffer | string;
    encryptedData: Buffer | string;
    authTag: Buffer | string;
}

export function createSymmetricEncryptionData(
    iv: Buffer = Buffer.alloc(0),
    encryptedData: Buffer = Buffer.alloc(0),
    authTag: Buffer = Buffer.alloc(0)
): SymmetricEncryptionData {
    return { iv, encryptedData, authTag };
}

export enum PacketType {
    INITIALIZATION,
    DATA,
}

export type AdressData = {
    inputPort: number;
    outputIp: string;
    outputPort: number
}