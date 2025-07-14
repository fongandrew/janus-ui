import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	asyncLocalStorage,
	asyncSessionStorage,
	getStoredValue,
	removeStoredValue,
	setStorage,
	setStoragePrefix,
	setStoredValue,
} from '~/lib/utility/storage';

describe('storage', () => {
	describe.each([
		['asyncLocalStorage', asyncLocalStorage],
		['asyncSessionStorage', asyncSessionStorage],
	])('%s', (_name, storageEngine) => {
		beforeEach(() => {
			setStorage(storageEngine);
		});

		afterEach(() => {
			// Clear localStorage after each test
			localStorage.clear();
			sessionStorage.clear();
			setStorage(asyncLocalStorage);
			setStoragePrefix('');
		});

		it('should set and get item from storage', async () => {
			await setStoredValue('test-key', 'test-value');
			const result = await getStoredValue('test-key');
			expect(result).toBe('test-value');
		});

		it('should remove item from storage', async () => {
			await setStoredValue('test-key', 'test-value');
			await removeStoredValue('test-key');
			const result = await getStoredValue('test-key');
			expect(result).toBeNull();
		});

		it('should return null for non-existing item', async () => {
			const result = await getStoredValue('non-existing-key');
			expect(result).toBeNull();
		});

		it('should use storage prefix when getting values', async () => {
			setStoragePrefix('prefix-');
			await setStoredValue('test-key', 'test-value');
			const result = await getStoredValue('test-key');
			expect(result).toBe('test-value');

			setStoragePrefix('prefix2-');
			const result2 = await getStoredValue('test-key');
			expect(result2).toBeNull();
		});
	});
});
