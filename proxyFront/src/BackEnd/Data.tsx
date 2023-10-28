import KeyFactory from "personnal-shared/src/Class/KeyFactory";
import { AdressData } from "personnal-shared/src/Type/ProxyType";

export default class Data {
    outputIp: string;
    outputPort: number;
    inputPort: number;
    RSAKey: string;
    RSAPrivateKey: string;

    private static data: Data;

    private constructor() {
        this.outputIp = '127.0.0.1';
        this.outputPort = 0;
        this.inputPort = 0;
        this.RSAKey = "";
        this.RSAPrivateKey = "";


        this.setAsymetricPublicKey();
        Data.data = this;
    }

    async setAsymetricPublicKey() {
        let keys = await KeyFactory.getKeyFactory().asymetricKeyGenerator();
        this.RSAPrivateKey = keys.privateKey;
        this.RSAKey = keys.publicKey;
    }

    public static getData(): Data {
        if (!Data.data) {
            Data.data = new Data();
        }
        return Data.data;
    }

    setData(outputIp: string, outputPort: number, inputPort: number) {
        this.outputIp = outputIp;
        this.outputPort = outputPort;
        this.inputPort = inputPort;
    }

    getDataJson(): AdressData {
        return {
            inputPort: this.inputPort,
            outputIp: this.outputIp,
            outputPort: this.outputPort
        }
    }
}