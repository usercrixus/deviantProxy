import KeyFactory from "personnal-shared/src/Class/KeyFactory";
import { AdressData } from "personnal-shared/src/Type/ProxyType";
import * as fs from 'fs';

export default class Data {
    outputIp: string;
    outputPort: number;
    inputPort: number;
    RSAKey: string;
    RSAPrivateKey: string;

    private static data: Data;

    private constructor() {
        try {
            let dataJson = this.loadSavedData();
            this.outputIp = dataJson.outputIp;
            this.outputPort = dataJson.outputPort;
            this.inputPort = dataJson.inputPort;
        } catch (error) {
            this.outputIp = '127.0.0.1';
            this.outputPort = 0;
            this.inputPort = 0;
        }

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
        this.saveData();
    }

    getDataJson(): AdressData {
        return {
            inputPort: this.inputPort,
            outputIp: this.outputIp,
            outputPort: this.outputPort
        }
    }

    saveData(): void {
        const dataJson = this.getDataJson();
        const dataString = JSON.stringify(dataJson);
        fs.writeFile('data.txt', dataString, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    }

    loadSavedData(): AdressData {
        try {
            const dataString = fs.readFileSync('data.txt', 'utf8');
            const dataJson: AdressData = JSON.parse(dataString);
            return dataJson;
        } catch (err) {
            console.error('Error reading file:', err);
            throw err;
        }
    }
}