/**
 * Thin async wrapper around localStorage that we can swap for other storage mechanisms
 */

import { parentWindow } from '~/lib/utility/multi-view';

/** Async storage interface */
export interface Storage {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string) => Promise<void>;
	remove: (key: string) => Promise<void>;
}

/** Local storage implementation */
export const asyncLocalStorage: Storage = {
	get: async (key: string) => parentWindow?.localStorage.getItem(key) ?? null,
	set: async (key: string, value: string) => parentWindow?.localStorage.setItem(key, value),
	remove: async (key: string) => parentWindow?.localStorage.removeItem(key),
};

/** Session storage implementation */
export const asyncSessionStorage: Storage = {
	get: async (key: string) => parentWindow?.sessionStorage.getItem(key) ?? null,
	set: async (key: string, value: string) => parentWindow?.sessionStorage.setItem(key, value),
	remove: async (key: string) => parentWindow?.sessionStorage.removeItem(key),
};

/** Prefix for storage */
let storagePrefix = '';

/** Set storage prefix */
export const setStoragePrefix = (prefix: string): void => {
	storagePrefix = prefix;
};

/** Current storage mechanism */
let storage: Storage = asyncLocalStorage;

/** Set current storage mechanism */
export const setStorage = (newStorage: Storage): void => {
	storage = newStorage;
};

/** Get a value from storage */
export const getStoredValue = async (key: string): Promise<string | null> =>
	storage.get(storagePrefix + key);

/** Set a value in storage */
export const setStoredValue = async (key: string, value: string): Promise<void> =>
	storage.set(storagePrefix + key, value);

/** Remove a value from storage */
export const removeStoredValue = async (key: string): Promise<void> =>
	storage.remove(storagePrefix + key);
