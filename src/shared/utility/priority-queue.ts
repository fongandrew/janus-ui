import { createDeferred, type Deferred } from '~/shared/utility/deferred';

/**
 * Debounced queue for promises that supports concurrency and prioritization.
 * Lower priorities are executed first.
 */
export class PriorityQueue {
	protected debounceMs?: number;
	protected maxConcurrency: number;

	/** List of 2-tuples with callbacks and priorities to run */
	private queue: [() => Promise<void>, number][];
	/**
	 * Marker used to determine whether we've sorted the queue.
	 * Set to true when we sort it. Set to false when we add
	 * something that unsorts it.
	 */
	private isQueueSorted = true;
	/** Set of pending promises for tasks executed from queue */
	private pendingPromises = new Set<Promise<void>>();
	/**
	 * Lowest priority of currently pending promises (or Infinity
	 * if none)
	 */
	private currentPriority = Infinity;
	/** Pending debounce timeout for scheduling initial process */
	private debounceTimeout?: number | NodeJS.Timeout | undefined;
	/** Pending promise/deferred for when queue is done processing */
	private deferredDone?: Deferred<void>;

	constructor({
		debounceMs = 50,
		maxConcurrency = Infinity,
	}: {
		/**
		 * debounceMs is the number of milliseconds to wait before running
		 * tasks. This is to allow for prioritization.
		 */
		debounceMs?: number;
		/**
		 * maxConcurrency describes the number of simultaneous tasks that
		 * may be running at once. Tasks will only be run concurrently if
		 * they have the same or lower priority number than the lowest
		 * priority number of a task currently running. That is, in
		 * practice, the goal is to ensure that only task of the same
		 * priority are run concurrently, but if a task with a lower priority
		 * number is added to the queue, it may be run concurrently with any
		 * currently pending tasks with a higher priority number.
		 */
		maxConcurrency?: number;
	} = {}) {
		this.debounceMs = debounceMs;
		this.maxConcurrency = maxConcurrency;
		this.queue = [];
	}

	/** Adds a function to the queue with a given priority */
	push(cb: () => Promise<void>, priority: number): void {
		this.queue.push([cb, priority]);
		this.isQueueSorted = false;

		if (this.pendingPromises.size) {
			// Queue is already running, maybe start new promise
			this.process();
		} else if (!this.debounceTimeout) {
			// Queue is not running, start debounce timer
			this.debounceTimeout = setTimeout(() => {
				this.debounceTimeout = undefined;
				this.process();
			}, this.debounceMs);
		}
	}

	/** Returns a promise that resolves when the queue is empty */
	async done(): Promise<void> {
		if (this.pendingPromises.size === 0) {
			return Promise.resolve();
		}
		if (!this.deferredDone) {
			this.deferredDone = createDeferred();
		}
		return this.deferredDone;
	}

	/**
	 * Maybe pull things off the queue and add to set of currently
	 * processing tasks.
	 */
	process = () => {
		if (this.pendingPromises.size === 0) {
			this.currentPriority = Infinity;
			if (!this.queue.length) {
				this.deferredDone?.resolve();
				delete this.deferredDone;
				return;
			}
		}

		if (!this.isQueueSorted) {
			this.queue.sort(([, a], [, b]) => a - b);
			this.isQueueSorted = true;
		}

		let i: number;
		for (i = 0; i < this.queue.length && this.pendingPromises.size < this.maxConcurrency; i++) {
			const [cb, priority] = this.queue[i]!;
			if (priority > this.currentPriority) {
				break;
			}
			if (priority < this.currentPriority) {
				this.currentPriority = priority;
			}
			const pendingPromise = cb().finally(() => {
				// Clean up to make space for next task
				this.pendingPromises.delete(pendingPromise);
				// Maybe add a new task
				this.process();
			});
			this.pendingPromises.add(pendingPromise);
		}
		if (i) {
			this.queue.splice(0, i);
		}
	};
}
