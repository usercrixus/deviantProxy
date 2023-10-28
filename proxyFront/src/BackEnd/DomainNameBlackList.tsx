import * as fs from "fs";
import * as readline from "readline";
import LRUCache from "./LRUCache";


export default class DomainNameBlackList {
    private static blackList: DomainNameBlackList;

    sourceFile: string[]
    urlCache = new LRUCache(1000);

    private constructor() {
        this.sourceFile = [];
    }

    public static getDomainNameBlackList(): DomainNameBlackList {
        if (!DomainNameBlackList.blackList) {
            DomainNameBlackList.blackList = new DomainNameBlackList();
        }
        return DomainNameBlackList.blackList;
    }

    setSourceFile(path: string[]) {
        this.sourceFile = path;
        console.log("black list path : " + path);
    }

    async blackListedAnalysis(url: string): Promise<boolean> {
        for (let sourceFile of this.sourceFile) {
            const isBlackListed = await this.isBlackListed(url, sourceFile);
            if (isBlackListed) {
                return true;
            }
        }
        return false
    }

    async isBlackListed(urlTarget: string, blackListPath: string): Promise<boolean> {
        const fileStream = fs.createReadStream(blackListPath);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity // to handle various End of Line (EOL) characters.
        });

        return new Promise<boolean>((resolve, reject) => {
            rl.on('line', (line) => {
                if (!line.startsWith("#")) {

                    line = line.toLowerCase().trim();
                    urlTarget = urlTarget.toLowerCase().trim();
                    if (line.includes(" ")) line = line.split(" ")[1];

                    if (line == urlTarget) {
                        console.log("Blacklisted : " + line);
                        resolve(true);
                    }
                }
            });

            rl.on('close', () => {
                resolve(false); // resolve false when the end of the file is reached
            });

            rl.on('error', (err: NodeJS.ErrnoException) => {
                reject(err); // reject the promise with the error object
            });
        });
    }

    async isBlackListError(host: string): Promise<boolean> {
        if (this.isBlackListCheckingNeeded(host)) {
            const isBlackListed = await this.blackListedAnalysis(host)
            if (isBlackListed) return true;
            this.urlCache.put(host, new Date());
        }
        return false;
    }

    /*
     * Check if the url has been used recently.
     * If so, their isnt in the black list as only authorized url can be store in the cache
     * 
     * Return true if the url need to be checked against the black list
     */
    isBlackListCheckingNeeded(url: string): boolean {
        let isRecentlyUsed = this.urlCache.get(url);
        if (isRecentlyUsed) {
            return false;
        } else {
            return true;
        }
    }

}