import * as crypto from "crypto";
import * as ProxyType from "../Type/ProxyType"

export default class KeyFactory {

    private static encryption: KeyFactory;

    private constructor() { }

    public static getKeyFactory() {
        if (!KeyFactory.encryption) {
            KeyFactory.encryption = new KeyFactory();
        }
        return KeyFactory.encryption;
    }

    async asymetricKeyGenerator(): Promise<ProxyType.Keys> {

        return new Promise<ProxyType.Keys>((resolve, reject) => {
            let publicKey: string = "";
            let privateKey: string = "";

            crypto.generateKeyPair('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                },
            }, (err, publicKey, privateKey) => {
                if (err) {
                    reject(err)
                } else {
                    resolve({ publicKey, privateKey })
                }
            });
        })
    }

    generateSymmetricKey(): Buffer {
        return crypto.randomBytes(32);
    }

    /**
     * As backend, we want to send the symetric key to our client encrypted.
     * We need to have the client public key.
     * 
     * @param symmetricKey the key key you want to encrypt
     * @param clientPublicKey the client public key
     * @returns the encrypted symetric key
     */
    encryptSymmetricKey(symmetricKey: Buffer, clientPublicKey: string): Buffer | undefined {
        try {
            const encryptedKey = crypto.publicEncrypt(clientPublicKey, symmetricKey);
            return encryptedKey;
        } catch (error) {
            console.log("Cipher error :\n" + error + "\n\n")
            return undefined
        }
    }

    encryptSymmetric(message: Buffer, symmetricKey: Buffer): ProxyType.SymmetricEncryptionData | undefined {
        try {
            const iv: Buffer = crypto.randomBytes(16);
            const cipher: crypto.CipherGCM = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);
            let encryptedData: Buffer = cipher.update(message);
            encryptedData = Buffer.concat([encryptedData, cipher.final()]);
            return { iv, encryptedData, authTag: cipher.getAuthTag() };
        } catch (error) {
            console.log("Cipher error : \n" + error + "\n\n")
            return undefined;
        }

    }

    decryptSymmetric(encryptedMessage: ProxyType.SymmetricEncryptionData, symmetricKey: Buffer): Buffer | undefined {
        try {
            const decipher: crypto.DecipherGCM = crypto.createDecipheriv('aes-256-gcm', symmetricKey, encryptedMessage.iv);
            decipher.setAuthTag(encryptedMessage.authTag as Buffer);
            let decryptedData: Buffer = decipher.update(encryptedMessage.encryptedData as Buffer);
            decryptedData = Buffer.concat([decryptedData, decipher.final()]);
            return decryptedData;
        } catch (error) {
            console.log("Decipher error :\n" + error + "\n\n")
            return undefined
        }
    }

}