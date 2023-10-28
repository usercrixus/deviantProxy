export default class LRUCache {

    cache: Map<string, Date>;
    maxSize: number

    constructor(maxSize: number) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key: string) {
        if (!this.cache.has(key)) return null;

        // Move key to end to show that it was recently used
        const value = new Date();
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    put(key: string, value: Date) {
        // If key is in cache, remove it
        if (this.cache.has(key)) this.cache.delete(key);

        // If cache is full, remove least recently used item
        if (this.cache.size >= this.maxSize) {
            this.cache.delete(this.cache.keys().next().value);
        }

        this.cache.set(key, value);
    }
}

