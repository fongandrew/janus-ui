import { LRUCache } from '~/shared/utility/lru-cache';

describe('LRUCache', () => {
	it('should return undefined for missing keys', () => {
		const cache = new LRUCache<string, number>(2);
		expect(cache.get('a')).toBeUndefined();
	});

	it('should return the value for a key', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		expect(cache.get('a')).toBe(1);
	});

	it('should evict the least recently used key', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.get('a');
		cache.set('c', 3);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('can delete a key', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.delete('b');
		cache.set('c', 3);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('can be cleared', () => {
		const cache = new LRUCache<string, number>(2);
		cache.set('a', 1);
		cache.set('b', 2);

		cache.clear();
		expect(cache.get('a')).toBeUndefined();
		expect(cache.get('b')).toBeUndefined();
	});

	it('works with undefined and null keys', () => {
		const cache = new LRUCache<string | null | undefined, number>(2);
		cache.set(null, 1);
		cache.set(undefined, 2);
		expect(cache.get(null)).toBe(1);
		expect(cache.get(undefined)).toBe(2);
	});

	it('should iterate over entries from oldest to newest', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);

		const entries: [string, number][] = [];
		for (const [key, value] of cache.oldestEntries()) {
			entries.push([key, value]);
		}

		expect(entries).toEqual([
			['a', 1],
			['b', 2],
			['c', 3],
		]);
	});

	it('should handle deleting next key during iteration without errors', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);

		const entries: [string, number][] = [];
		for (const [key, value] of cache.oldestEntries()) {
			entries.push([key, value]);
			if (key === 'c') {
				cache.delete('b');
			}
		}

		expect(entries).toEqual([
			['a', 1],
			['b', 2],
			['c', 3],
		]);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('should handle deleting current key during iteration without errors', () => {
		const cache = new LRUCache<string, number>(3);
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('c', 3);

		const entries: [string, number][] = [];
		for (const [key, value] of cache.oldestEntries()) {
			entries.push([key, value]);
			if (key === 'b') {
				cache.delete('b');
			}
		}

		expect(entries).toEqual([
			['a', 1],
			['b', 2],
			['c', 3],
		]);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeUndefined();
		expect(cache.get('c')).toBe(3);
	});

	it('should return the correct size', () => {
		const cache = new LRUCache<string, number>(3);
		expect(cache.size()).toBe(0);

		cache.set('a', 1);
		expect(cache.size()).toBe(1);

		cache.set('b', 2);
		expect(cache.size()).toBe(2);

		cache.set('c', 3);
		expect(cache.size()).toBe(3);

		cache.set('d', 4);
		expect(cache.size()).toBe(3); // Capacity is 3, so one item should be evicted

		cache.delete('c');
		expect(cache.size()).toBe(2);

		cache.clear();
		expect(cache.size()).toBe(0);
	});
});
