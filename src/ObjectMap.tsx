export class ObjectMap<K, V> {
    private map = new Map<string, V>();

    set(key: K, value: V): this {
        this.map.set(JSON.stringify(key), value);
        return this;
    }

    get(key: K): V | undefined {
        return this.map.get(JSON.stringify(key));
    }

    clear() {
        this.map.clear();
    }

    delete(key: K): boolean {
        return this.map.delete(JSON.stringify(key));
    }

    has(key: K): boolean {
        return this.map.has(JSON.stringify(key));
    }

    values(): IterableIterator<V> {
        return this.map.values();
    }

    get size() {
        return this.map.size;
    }

    forEach(callbackfn: (value: V, key: K) => void, thisArg?: any): void {
        this.map.forEach((value, key) => {
            callbackfn.call(thisArg, value, JSON.parse(key));
        });
    }
}
