/**
 * PropModContext is used by parent(s) to assign prop mods to children and dynamically
 * merge in prior values without clobbering them.
 */
import {
	type Context,
	createContext,
	type JSX,
	mergeProps,
	splitProps,
	useContext,
} from 'solid-js';

/** Mapped type that expects a function that returns a modified value for a prop, excluding `children` */
export type PropModGeneric<T> = {
	[K in Exclude<keyof T, 'children'>]?: (value: T[K] | undefined) => T[K];
};

/**
 * Array of prop mod maps, with the mods from the top-most ancestors coming first and
 * deeper ancestors coming later.
 */
export type PropModContextShape<T> = PropModGeneric<T>[];

/**
 * Create a new type of prop mod context
 */
export function createPropModContext<T = JSX.HTMLAttributes<HTMLElement>>() {
	const Context = createContext<PropModContextShape<T>>([]);

	/** Pass props on provider down to targeted element */
	function Provider(props: PropModGeneric<T> & { children: JSX.Element }) {
		const parentContext = useContext(Context) ?? [];
		const [local, rest] = splitProps(props, ['children']);
		return (
			<Context.Provider value={[rest as any, ...parentContext]} children={local.children} />
		);
	}

	/** Reset is used to unset props provided by ancestors */
	function Reset(props: { children: JSX.Element }) {
		return <Context.Provider value={[]} children={props.children} />;
	}

	const { Provider: _originalProvider, ...rest } = Context;
	return {
		Provider,
		Reset,
		...rest,
	};
}

export type PropModContextType<T> = Context<PropModContextShape<T>>;

/**
 * Merge any prop mods from context with given props
 */
export function mergePropMods<T = JSX.HTMLAttributes<HTMLElement>>(
	context: PropModContextType<T>,
	props: T,
): T {
	const propMods = useContext(context);
	if (!propMods?.length) return props;

	const merged = mergeProps(props, () => {
		const ret: Partial<T> = {};
		for (let i = 0; i < propMods.length; i++) {
			const modMap = propMods[i];
			for (const propKey in modMap) {
				// Already processed this prop
				if (propKey in ret) continue;

				// Mod prop, then check all subequent mod maps in array
				ret[propKey as keyof T] = props[propKey as keyof T];
				for (let j = i; j < propMods.length; j++) {
					const mod = propMods[j]?.[propKey as Exclude<keyof T, 'children'>];
					if (mod) {
						ret[propKey as keyof T] = mod(ret[propKey as Exclude<keyof T, 'children'>]);
					}
				}
			}
		}

		// Solid intentionally does not override undefined props with mergeProps
		// (https://github.com/solidjs/solid/issues/1383), so switch to null
		// If this ever breaks, we move to something using `splitProps` maybe
		for (const key in ret) {
			ret[key] = (ret[key] ?? null) as any;
		}

		return ret;
	}) as T;
	return merged;
}

/**
 * Grab a single prop from context (e.g. an ID)
 */
export function useSingleProp<
	TKey extends Exclude<keyof T, 'children'>,
	T = JSX.HTMLAttributes<HTMLElement>,
>(
	context: PropModContextType<T>,
	propKey: TKey,
	initialValue?: T[typeof propKey] | undefined,
): T[TKey] | undefined {
	const propMods = useContext(context);
	if (!propMods?.length) return undefined;

	let ret: T[typeof propKey] | undefined = initialValue;
	for (const modMap of propMods) {
		const mod = modMap?.[propKey as TKey];
		if (mod) {
			ret = mod(ret);
		}
	}
	return ret;
}
