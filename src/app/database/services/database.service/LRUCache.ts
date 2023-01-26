//TODO: MOVE THIS TO SDK WHEN FINISH THE EPIC
export interface ICacheStorage<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, size: number): void;
  delete(key: string): void;
  has(key: string): Promise<boolean>;
  getSize(key: string): Promise<number>;
}

export type LRUCacheStruture = { lruKeyList: string[]; itemsListSize: number };

export class LRUCache<T> {
  private cache: ICacheStorage<T>;
  private lruList: string[];
  private size: number;
  private currentSize: number;

  constructor(cache: ICacheStorage<T>, size: number, lRUCacheStruture?: LRUCacheStruture) {
    this.cache = cache;
    this.lruList = lRUCacheStruture?.lruKeyList ?? [];
    this.size = size;
    this.currentSize = lRUCacheStruture?.itemsListSize ?? 0;
  }

  async get(key: string): Promise<T | undefined> {
    const existsInCache = await this.cache.has(key);
    if (!existsInCache) {
      return undefined;
    }

    this.updateLRU(key);
    return await this.cache.get(key);
  }

  async set(key: string, value: T, size: number): Promise<void> {
    if (size < this.size) {
      const existsItem = await this.cache.has(key);

      if (existsItem) {
        this.updateLRU(key);
      } else {
        while (this.currentSize + size > this.size) {
          const evictedKey = this.lruList.shift();

          if (evictedKey !== undefined) {
            this.currentSize -= await this.cache.getSize(evictedKey);
            this.cache.delete(evictedKey);
          }
        }
        this.lruList.push(key);
        this.currentSize += size;
      }
      this.cache.set(key, value, size);
    }
  }

  async delete(key: string, size: number): Promise<void> {
    const existsInCache = await this.cache.has(key);
    if (!existsInCache) {
      return;
    }

    const keyIndex = this.lruList.indexOf(key);
    if (keyIndex > -1) {
      this.lruList.splice(keyIndex, 1);
    }

    this.currentSize -= size;
    this.cache.delete(key);
  }

  private updateLRU(key: string) {
    const index = this.lruList.indexOf(key);
    if (index > -1) {
      this.lruList.splice(index, 1);
    }
    this.lruList.push(key);
  }
}
