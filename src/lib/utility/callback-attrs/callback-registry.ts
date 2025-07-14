/**
 * Utility code for a pattern where a special data attribute is used to specify a list of
 * JavaScript handlers to be called in some event
 */
import { type Falsey } from '~/lib/utility/type-helpers';

/**
 * A registered callback is actually a getter function that returns attribute + ID + bound args.
 * It has a bunch of other stuff attached to it for managing the callback.
 */
export interface RegisteredCallback<
	TCallback extends (this: TThis, ...args: any[]) => any,
	/**
	 * Extra args that can be passed to the callback -- type is not quite right since
	 * undefined args will be passed back as empty strings when parsing attributes
	 * but we do this because it makes typing optional args easier.
	 */
	TExtra extends (string | undefined)[] = [],
	TThis extends HTMLElement = HTMLElement,
> {
	/** Return object mapping attribute to ID / extra args tuple */
	(...args: TExtra): [string, string];
	/** The attribute this ID should be assigned to */
	attr: string;
	/** The raw ID string */
	id: string;
	/** Calls the callback */
	do(this: TThis, ...args: [...Parameters<TCallback>, ...TExtra]): ReturnType<TCallback>;
	/** Adds the callback to the registry, returns false if already exists */
	add(): boolean;
	/** Removes the callback from the registry */
	rm(): void;
}

/**
 * Map from event types that can be listened to on the registry to the type of handler.
 * Just one right now, but maybe we add more later.
 */
export interface RegistryEventTypes {
	/** Render event called the RegisteredCallback func is invoked */
	render: (id: string) => void;
}

export type RegistryEventType = keyof RegistryEventTypes;

/**
 * Used to parse attribute strings that maybe have args:
 *
 * Given something like `data-on-click="do-foo (arg1,arg2) do-bar"`, this will give us
 * `['do-foo', 'arg1,arg2']` in the first match and `['do-bar']` in the second.
 */
const CALLBACK_REGEX = /([^\s(]+)(?:\s+\(([^)]*)\))?/g;

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

	/** Event listeners */
	const listeners = {
		render: new Set<RegistryEventTypes['render']>(),
	};

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

		/** Add an event callback of a given type */
		listen<T extends RegistryEventType>(type: T, listener: RegistryEventTypes[T]) {
			(listeners[type] as Set<any>).add(listener);
		},

		/** Remove an event callback of a given type */
		unlisten<T extends RegistryEventType>(type: T, listener: RegistryEventTypes[T]) {
			(listeners[type] as Set<any>).delete(listener);
		},

		/**
		 * Iterate over all callbacks in the registry.
		 *
		 * @param elm - The element to use as the context for the callback.
		 * @returns An iterable of all callbacks in the registry for this element bound
		 * to the element.
		 */
		*iter(
			elm: HTMLElement,
		): Iterable<(...params: Parameters<TRegistryCallback>) => ReturnType<TRegistryCallback>> {
			const str = elm.getAttribute(attr);
			if (!str) return;

			for (const match of str.matchAll(CALLBACK_REGEX)) {
				const [_completeMatch, callbackName, extraArgsString] = match;
				if (!callbackName) continue;

				const callback = registry[callbackName];
				if (!callback) continue;

				if (extraArgsString) {
					const extraArgs = extraArgsString.split(',');
					yield ((...args: any) =>
						callback.call(elm, ...args, ...extraArgs)) as TRegistryCallback;
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
		create<TExtra extends (string | undefined)[], TThis extends HTMLElement = HTMLElement>(
			id: string,
			callback: (
				this: TThis,
				...args: [...Parameters<TRegistryCallback>, ...TExtra]
			) => ReturnType<TRegistryCallback>,
		): RegisteredCallback<TRegistryCallback, TExtra> {
			function attrStr(...args: TExtra): [string, string] {
				attrStr.add();
				for (const listener of listeners.render) {
					listener(id);
				}
				if (args.length) {
					let lastDefinedIndex = args.length - 1;
					while (lastDefinedIndex >= 0 && args[lastDefinedIndex] === undefined) {
						lastDefinedIndex--;
					}
					if (lastDefinedIndex >= 0) {
						return [attr, `${id} (${args.slice(0, lastDefinedIndex + 1).join(',')})`];
					}
				}
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
