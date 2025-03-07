/**
 * Utility code for a pattern where a special data attribute is used to specify a list of
 * JavaScript handlers to be called in some event
 */
import { type Falsey } from '~/shared/utility/type-helpers';

export interface RegisteredCallback<TCallback extends (...args: any[]) => any> {
	/** Return the ID used for the attribute */
	(): string;
	/** The attribute this ID should be assigned to */
	attr: string;
	/** Calls the callback */
	do(...args: Parameters<TCallback>): ReturnType<TCallback>;
	/** Removes the callback from the registry */
	rm(): void;
}

/**
 * Creates a registry for managing callbacks by string IDs.
 *
 * @param attr - The data attribute we're using for this
 * @returns An object with methods to add, remove, get, create, and manage props for callbacks.
 */
export function createCallbackRegistry<
	TAttr extends string,
	TRegistryCallback extends (...args: any[]) => any,
>(attr: TAttr) {
	const registry: Record<string, TRegistryCallback> = {};

	return {
		/**
		 * Gets a callback from the registry.
		 *
		 * @param id - The ID of the callback to get.
		 * @returns The callback function associated with the ID, or undefined if not found.
		 */
		get(id: string): TRegistryCallback | undefined {
			return registry[id];
		},

		/**
		 * Iterate over all callbacks in the registry.
		 *
		 * @param elm - The element to use as the context for the callback.
		 * @returns An iterable of all callbacks in the registry for this element
		 */
		*iter(elm: HTMLElement): Iterable<TRegistryCallback> {
			for (const id of elm.getAttribute(attr)?.split(/\s/) ?? []) {
				const callback = registry[id];
				if (!callback) continue;
				yield callback;
			}
		},

		/**
		 * Creates a function that registers a callback with the registry and returns the ID.
		 *
		 * @param id - The ID to associate with the callback.
		 * @param callback - The callback function to register.
		 * @returns A function that registers the callback and returns the ID.
		 */
		create(id: string, callback: TRegistryCallback): RegisteredCallback<TRegistryCallback> {
			function register() {
				registry[id] = function (this: any, ...params) {
					return register.do.apply(this, params);
				} as TRegistryCallback;
				return id;
			}
			register.attr = attr;
			register.do = callback;
			register.rm = () => delete registry[id];
			return register;
		},
	};
}

export type CallbackRegistry<
	TAttr extends string,
	TCallback extends (...args: any[]) => any,
> = ReturnType<typeof createCallbackRegistry<TAttr, TCallback>>;

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
		| Falsey
	)[]
) {
	// We want to ignore most of the attributes on prop objects and include only
	// those implicated by any callback args. So let's make a first pass and
	// collect just those.
	const attrs: string[] = [];
	for (const idOrProps of idsOrProps) {
		if (typeof idOrProps === 'function' && (idOrProps as RegisteredCallback<any>).attr) {
			attrs.push((idOrProps as RegisteredCallback<any>).attr);
		}
	}

	// Second pass: Now we collect all the actual ID values we're going to return
	const idsByAttr: Record<string, string[]> = {};
	for (const idOrProps of idsOrProps) {
		if (!idOrProps) continue;

		if (typeof idOrProps === 'function' && (idOrProps as RegisteredCallback<any>).attr) {
			const attr = (idOrProps as RegisteredCallback<any>).attr;
			(idsByAttr[attr] ??= []).push(idOrProps());
		}

		if (typeof idOrProps === 'object') {
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
export function callbackAttrMods(...idOrProps: (RegisteredCallback<any> | Falsey)[]) {
	const idsByAttr: Record<string, string[]> = {};
	const ret: Record<string, (prevIds: string | undefined) => string> = {};
	for (const idOrProp of idOrProps) {
		if (!idOrProp) continue;
		if (idOrProp.attr) {
			(idsByAttr[idOrProp.attr] ??= []).push(idOrProp());
			ret[idOrProp.attr] ??= (prev: string | undefined) =>
				prev
					? [prev, ...idsByAttr[idOrProp.attr]!].join(' ')
					: idsByAttr[idOrProp.attr]!.join(' ');
		}
	}
	return ret;
}

/**
 * Returns a selector to find a given registered callback
 */
export function callbackSelector(callback: RegisteredCallback<any>) {
	return `[${callback.attr}~="${callback()}"]`;
}
