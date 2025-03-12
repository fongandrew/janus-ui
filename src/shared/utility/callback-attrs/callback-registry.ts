/**
 * Utility code for a pattern where a special data attribute is used to specify a list of
 * JavaScript handlers to be called in some event
 */
import { getDefaultLogger } from '~/shared/utility/logger';
import { type Falsey } from '~/shared/utility/type-helpers';

/**
 * Used to parse attribute strings that maybe have args:
 *
 * Given something like `data-on-click="do-foo (arg1,arg2) do-bar"`, this will give us
 * `['do-foo', 'arg1,arg2']` in the first match and `['do-bar']` in the second.
 */
const CALLBACK_REGEX = /([^\s(]+)(?:\s+\(([^)]*)\))?/g;

export interface RegisteredCallback<
	TCallback extends (this: TThis, ...args: any[]) => any,
	TArgs extends string[] = [],
	TThis extends HTMLElement = HTMLElement,
> {
	/** Return object mapping attribute to ID / args tuple */
	(...args: TArgs): [string, string];
	/** The attribute this ID should be assigned to */
	attr: string;
	/** The raw ID string */
	id: string;
	/** Calls the callback */
	do(this: TThis, ...args: [...TArgs, ...Parameters<TCallback>]): ReturnType<TCallback>;
	/** Adds the callback to the registry, returns false if already exists */
	add(): boolean;
	/** Removes the callback from the registry */
	rm(): void;
}

/**
 * Creates a registry for managing callbacks by string IDs.
 *
 * @param attr - The data attribute we're using for this
 * @returns An object with methods to add, remove, get, create, and manage props for callbacks.
 */
export function createCallbackRegistry<TRegistryCallback extends (...args: any[]) => any>(
	attr: string,
) {
	const registry: Record<string, (...args: any[]) => any> = {};

	return {
		attr,

		/**
		 * Gets a callback from the registry.
		 *
		 * @param id - The ID of the callback to get.
		 * @returns The callback function associated with the ID, or undefined if not found.
		 */
		get(id: string) {
			return registry[id];
		},

		/**
		 * Iterate over all callbacks in the registry.
		 *
		 * @param elm - The element to use as the context for the callback.
		 * @returns An iterable of all callbacks in the registry for this element
		 */
		*iter(elm: HTMLElement): Iterable<TRegistryCallback> {
			const str = elm.getAttribute(attr);
			if (!str) return;

			for (const match of str.matchAll(CALLBACK_REGEX)) {
				const [_completeMatch, callbackName, argsString] = match;
				if (!callbackName) continue;

				const callback = registry[callbackName];
				if (!callback) continue;

				if (argsString) {
					const args = argsString.split(',');
					yield callback.bind(elm, ...args) as TRegistryCallback;
					continue;
				}

				yield callback.bind(elm) as TRegistryCallback;
			}
		},

		/**
		 * Creates a function that registers a callback with the registry and returns the ID.
		 *
		 * @param id - The ID to associate with the callback.
		 * @param callback - The callback function to register.
		 * @returns A function that registers the callback and returns the ID.
		 */
		create<TArgs extends string[] = [], TThis extends HTMLElement = HTMLElement>(
			id: string,
			callback: (
				this: TThis,
				...args: [...TArgs, ...Parameters<TRegistryCallback>]
			) => ReturnType<TRegistryCallback>,
		): RegisteredCallback<TRegistryCallback, TArgs> {
			function attrStr(...args: TArgs): [string, string] {
				attrStr.add();
				if (args.length) return [attr, `${id} (${args.join(',')})`];
				return [attr, id];
			}
			attrStr.attr = attr;
			attrStr.id = id;
			attrStr.do = callback;
			attrStr.add = () => {
				if (registry[id]) return false;
				registry[id] = function (this: any, ...args) {
					return attrStr.do.apply(this, args as any);
				} as TRegistryCallback;
				return true;
			};
			attrStr.rm = () => delete registry[id];
			return attrStr;
		},
	};
}

export type CallbackRegistry<TCallback extends (...args: any[]) => any> = ReturnType<
	typeof createCallbackRegistry<TCallback>
>;

/**
 * Creates a props object with the specified attribute and IDs that can be merged in
 * with other element props.
 */
export function callbackAttrs(
	...idsOrProps: (
		| (Record<string, any> & {
				/* Hack to exclude functions from union */ call?: undefined | never;
		  })
		| RegisteredCallback<any>
		| [string, string]
		| Falsey
	)[]
) {
	// We want to ignore most of the attributes on prop objects and include only
	// those implicated by any callback args. So let's make a first pass and
	// collect just those.
	const attrs = new Set<string>();
	for (const idOrProps of idsOrProps) {
		if (typeof idOrProps === 'function' && (idOrProps as RegisteredCallback<any>).attr) {
			attrs.add((idOrProps as RegisteredCallback<any>).attr);
		} else if (Array.isArray(idOrProps)) {
			attrs.add(idOrProps[0]);
		}
	}

	// Second pass: Now we collect all the actual ID values we're going to return
	const idsByAttr: Record<string, string[]> = {};
	for (const idOrProps of idsOrProps) {
		if (!idOrProps) continue;

		if (typeof idOrProps === 'function' && (idOrProps as RegisteredCallback<any>).attr) {
			const attr = (idOrProps as RegisteredCallback<any>).attr;
			(idsByAttr[attr] ??= []).push(idOrProps()[1]);
		} else if (Array.isArray(idOrProps)) {
			(idsByAttr[idOrProps[0]] ??= []).push(idOrProps[1]);
		} else if (typeof idOrProps === 'object') {
			for (const attr of attrs) {
				if (idOrProps[attr]) (idsByAttr[attr] ??= []).push(idOrProps[attr]);
			}
		}
	}

	// Return concatenated strings
	const result: Record<string, string> = {};
	for (const attr in idsByAttr) {
		result[attr] = idsByAttr[attr]!.join(' ');
	}

	return result;
}

/**
 * Returns an object with functions to modify (append) IDs onto an existing callback attribute
 */
export function callbackAttrMods(
	...idOrProps: ((() => [string, string]) | [string, string] | Falsey)[]
) {
	const idsByAttr: Record<string, string[]> = {};
	const ret: Record<string, (prevIds: string | undefined) => string> = {};
	for (const idOrProp of idOrProps) {
		if (!idOrProp) continue;

		const [attr, value] = typeof idOrProp === 'function' ? idOrProp() : idOrProp;
		(idsByAttr[attr] ??= []).push(value);
		ret[attr] ??= (prev: string | undefined) =>
			prev ? [prev, ...idsByAttr[attr]!].join(' ') : idsByAttr[attr]!.join(' ');
	}
	return ret;
}

/**
 * Returns a selector to find a given registered callback
 */
export function callbackSelector(callback: RegisteredCallback<any>) {
	return `[${callback.attr}~="${callback.id}"]`;
}

/** Type-guard to check if something is a registered callback */
export function isRegisteredCallback(val: any): val is RegisteredCallback<any, any> {
	return !!(typeof val === 'function' && val.attr && val.id && val.add);
}

/**
 * Auto-load callbacks from a module (or other object containing callbacks)
 */
export function loadCallbacks(...mods: Record<string, any>[]) {
	for (const mod of mods) {
		for (const value of Object.values(mod)) {
			if (isRegisteredCallback(value)) {
				if (value.add() === false) {
					getDefaultLogger().warn(`Callback already exists: ${value.id}`);
				}
			}
		}
	}
}
