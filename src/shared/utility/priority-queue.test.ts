import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDeferred } from '~/shared/utility/deferred';
import { PriorityQueue } from '~/shared/utility/priority-queue';

describe('PriorityQueue', () => {
	let started: number[] = [];

	/** Test helper to create a task / deferred combo */
	const createTask = (id: number) => {
		const deferred = createDeferred<void>();

		function task() {
			started.push(id);
			return deferred;
		}
		task.promise = deferred;
		task.resolve = deferred.resolve;
		task.reject = deferred.reject;

		return task;
	};

	beforeEach(() => {
		started = [];
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should process tasks in order of priority after debounce', async () => {
		const queue = new PriorityQueue({ maxConcurrency: 1, debounceMs: 10 });

		const task1 = createTask(1);
		const task2 = createTask(2);
		const task3 = createTask(3);

		queue.push(task1, 1);
		queue.push(task2, 3);
		queue.push(task3, 2);
		expect(started).toEqual([]);

		vi.advanceTimersByTime(10);
		expect(started).toEqual([1]);

		task1.resolve();
		await task1.promise;
		expect(started).toEqual([1, 3]);

		task3.resolve();
		await task3.promise;
		expect(started).toEqual([1, 3, 2]);

		task2.resolve();
		await queue.done();
	});

	it('should process tasks of the same priority concurrently with maxConcurrency', async () => {
		const queue = new PriorityQueue({ maxConcurrency: 2, debounceMs: 10 });

		const task1 = createTask(1);
		const task2 = createTask(2);
		const task3 = createTask(3);
		const task4 = createTask(4);

		queue.push(task1, 1);
		queue.push(task2, 2);
		queue.push(task3, 1);
		queue.push(task4, 1);
		expect(started).toEqual([]);

		vi.advanceTimersByTime(10);
		expect(started).toEqual([1, 3]);

		// Resolving first task allows next task to start because it has the
		// the same priority
		task1.resolve();
		await task1.promise;
		expect(started).toEqual([1, 3, 4]);

		// Resolving the next task does not allow the remaining task to start
		// because it has a higher priority number
		task3.resolve();
		await task3.promise;
		expect(started).toEqual([1, 3, 4]);

		// Resolve all tasks of a priority allows the next priority to start
		task4.resolve();
		await task4.promise;
		expect(started).toEqual([1, 3, 4, 2]);

		task2.resolve();
		await queue.done();
	});

	it('allows tasks to be added while queue is processing', async () => {
		const queue = new PriorityQueue({ maxConcurrency: 2, debounceMs: 10 });

		const task1 = createTask(1);
		const task2 = createTask(2);

		queue.push(task1, 1);
		queue.push(task2, 2);
		expect(started).toEqual([]);

		// Only first task because of priority
		vi.advanceTimersByTime(10);
		expect(started).toEqual([1]);

		// Adding a task before the task is done immediately starts it because
		// the queue is already processing that priority level and total
		// number of current tasks is less than maxConcurrency
		const task3 = createTask(3);
		queue.push(task3, 1);
		expect(started).toEqual([1, 3]);

		task1.resolve();
		task3.resolve();
		task2.resolve();
		await queue.done();
	});

	it('will execute newly added tasks with a lower priority number concurrently with higher priority number that are already running', async () => {
		const queue = new PriorityQueue({ maxConcurrency: 2, debounceMs: 10 });

		const task1 = createTask(1);
		const task2 = createTask(2);
		const task3 = createTask(3);

		queue.push(task1, 2);
		queue.push(task2, 2);
		queue.push(task3, 2);
		expect(started).toEqual([]);

		vi.advanceTimersByTime(10);
		expect(started).toEqual([1, 2]);

		// Adding a task with a lower priority number will start as soon as
		// there's space in the queue
		const task4 = createTask(4);
		queue.push(task4, 1);
		expect(started).toEqual([1, 2]);
		task1.resolve();
		await task1.promise;
		expect(started).toEqual([1, 2, 4]);

		// So long as the lower priority number task is running, we don't start
		// any concurrent tasks with a higher priority number
		task2.resolve();
		await task2.promise;
		expect(started).toEqual([1, 2, 4]);

		// Once the lower priority number task is done, we can resume processing
		// the higher priority number tasks again
		task4.resolve();
		await task4.promise;
		expect(started).toEqual([1, 2, 4, 3]);

		task3.resolve();
		await queue.done();
	});
});
