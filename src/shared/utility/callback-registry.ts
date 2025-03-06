/**
 * Utility code for a pattern where a special data attribute is used to specify a list of
 * JavaScript handlers to be called in some event
 */
import { type Falsey } from '~/shared/utility/type-helpers';

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
		create(id: string, callback: TRegistryCallback) {
			function register() {
				registry[id] = function (this: any, ...params) {
					return register.do.apply(this, params);
				} as TRegistryCallback;
				return id;
			}
			register.do = callback;
			register.rm = () => delete registry[id];
			return register;
		},

		/**
		 * Creates a props object with the specified attribute and IDs.
		 *
		 * @param attr - The attribute to use for the props object.
		 * @param idsOrProps - The IDs or props to include in the props object.
		 * @returns A props object with the specified attribute and IDs.
		 */
		props(...idsOrProps: (Record<string, any> | string | (() => string) | Falsey)[]) {
			const ids: string[] = [];
			for (const idOrProps of idsOrProps) {
				if (!idOrProps) continue;
				switch (typeof idOrProps) {
					case 'string':
						ids.push(idOrProps);
						break;
					case 'function':
						ids.push(idOrProps());
						break;
					case 'object':
						if (idOrProps[attr]) ids.push(idOrProps[attr] as string);
						break;
				}
			}
			return { [attr]: ids.join(' ') };
		},

		/**
		 * Extends a props object with additional IDs.
		 *
		 * @param attr - The attribute to use for the props object.
		 * @param idsOrProps - The IDs or props to include in the props object.
		 * @returns A function that extends the props object with additional IDs.
		 */
		extendProps(...idsOrProps: (string | (() => string) | Falsey)[]) {
			return {
				[attr]: (prevIds: string | undefined) => {
					const ids = prevIds ? [prevIds] : [];
					for (const id of idsOrProps) {
						if (!id) continue;
						if (typeof id === 'string') ids.push(id);
						else ids.push(id());
					}
					return ids.join(' ');
				},
			} as Record<TAttr, (prevIds: string | undefined) => string>;
		},
	};
}
