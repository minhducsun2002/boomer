export class Cache<K, V> {
    private cache = new Map<K, V>();
    private keyExtractionCallback : (value : V) => K;
    private valueResolutionCallback : (key : K) => Promise<V>;
    constructor(
        keyExtractionCallback : Cache<K, V>['keyExtractionCallback'],
        valueResolutionCallback : Cache<K, V>['valueResolutionCallback']
    ) {
        this.keyExtractionCallback = keyExtractionCallback;
        this.valueResolutionCallback = valueResolutionCallback;
    };

    get = async (key : K) =>
    {
        if (!this.cache.has(key)) {
            let value = await this.valueResolutionCallback(key);
            this.cache.set(this.keyExtractionCallback(value), value);
        }
        return this.cache.get(key);
    }
    delete = (key : K) => this.cache.delete(key);
    clear = () => this.cache.clear();
}