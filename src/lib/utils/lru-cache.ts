class CacheNode<TKey, TValue> {
	public key: TKey;
	public value: TValue;
	public prev: CacheNode<TKey, TValue> | null;
	public next: CacheNode<TKey, TValue> | null;

	constructor(key: TKey, value: TValue) {
		this.key = key;
		this.value = value;
		this.prev = null;
		this.next = null;
	}
}

/** Linked list implementation of least-recently-used cache */
export class LRUCache<TKey, TValue> {
	private cache = new Map<TKey, CacheNode<TKey, TValue>>();
	private head: CacheNode<TKey, TValue> | null = null;
	private tail: CacheNode<TKey, TValue> | null = null;

	constructor(private capacity: number) {}

	clear() {
		this.cache.clear();
		this.head = null;
		this.tail = null;
	}

	get(key: TKey): TValue | undefined {
		const node = this.cache.get(key);
		if (!node) {
			return undefined;
		}

		this.removeNode(node);
		this.addToHead(node);

		return node.value;
	}

	has(key: TKey): boolean {
		return this.cache.has(key);
	}

	set(key: TKey, value: TValue): void {
		const node = this.cache.get(key);
		if (node) {
			node.value = value;
			this.removeNode(node);
			this.addToHead(node);
		} else {
			const newNode = new CacheNode(key, value);
			if (this.cache.size === this.capacity) {
				const tail = this.tail!;
				this.removeNode(tail);
				this.cache.delete(tail.key);
			}
			this.addToHead(newNode);
			this.cache.set(key, newNode);
		}
	}

	delete(key: TKey): void {
		const node = this.cache.get(key);
		if (!node) {
			return;
		}

		this.removeNode(node);
		this.cache.delete(key);
	}

	private addToHead(node: CacheNode<TKey, TValue>): void {
		node.prev = null;
		node.next = this.head;
		if (this.head) {
			this.head.prev = node;
		}
		this.head = node;
		if (!this.tail) {
			this.tail = node;
		}
	}

	private removeNode(node: CacheNode<TKey, TValue>): void {
		if (node.prev) {
			node.prev.next = node.next;
		} else {
			this.head = node.next;
		}

		if (node.next) {
			node.next.prev = node.prev;
		} else {
			this.tail = node.prev;
		}

		node.prev = null;
		node.next = null;
	}

	size(): number {
		return this.cache.size;
	}

	oldestEntries(): Iterable<[TKey, TValue]> {
		let current = this.tail;
		return {
			[Symbol.iterator](): Iterator<[TKey, TValue]> {
				return {
					next: () => {
						if (current) {
							const value = [current.key, current.value] as [TKey, TValue];
							current = current.prev;
							return { value, done: false };
						} else {
							return { value: undefined, done: true };
						}
					},
				};
			},
		};
	}
}
