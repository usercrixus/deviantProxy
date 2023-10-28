import KeyFactory from "../Class/KeyFactory";
import crypto from "crypto"



describe('KeyFactory Class', () => {

    test('Singleton Instance', () => {
        const instance1 = KeyFactory.getKeyFactory();
        const instance2 = KeyFactory.getKeyFactory();
        expect(instance1).toBe(instance2);
    });

    test('Symetric cupher/decipher', () => {
        const keyFactory = KeyFactory.getKeyFactory();


        let msg = Buffer.from("my mesage to encrypt");
        let symKey = keyFactory.generateSymmetricKey();

        let symData = keyFactory.encryptSymmetric(msg, symKey);
        console.log("Encrypted data : \n" + symData!.encryptedData.toString())

        let decr = keyFactory.decryptSymmetric(symData!, symKey);
        console.log("decryptedData :\n" + decr?.toString());

        expect(msg).toEqual(decr)
    });

    test('Key Generation', async () => {
        const keyFactory = KeyFactory.getKeyFactory();
        const keys = await keyFactory.asymetricKeyGenerator();
        console.log(keys);

        let keysFromMap: any = keys

        let encryptedMsg = crypto.publicEncrypt(keysFromMap.publicKey, Buffer.from("Hello world"));
        console.log("Encrypted msg :\n" + encryptedMsg.toString());
        let decryptedMsg = crypto.privateDecrypt(keysFromMap.privateKey, encryptedMsg);
        console.log("Decrypted msg :\n" + decryptedMsg.toString());

        expect(decryptedMsg.toString()).toEqual("Hello world")
    });

});