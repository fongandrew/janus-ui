import {
	createRenderEffect,
	createSignal,
	type JSX,
	mapArray,
	mergeProps,
	onCleanup,
} from 'solid-js';

import { useLogger } from '~/shared/utility/logger';
import { combineEventHandlers } from '~/shared/utility/solid/combine-event-handlers';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { createIncrSignal } from '~/shared/utility/solid/create-incr-signal';

/**
 * Helper class that maps attributes to a list of items for that attribute
 * that should be merged into a single item.
 */
class AttrMap<TValue> {
	/** Internal counter for unique-ish IDs */
	private count = 0;
	/**
	 * Record that maps attr strings to a map of IDs to values -- we use ID on the latter
	 * because we care about the order in which an item is inserted *and* want an easy way
	 * to look up and modify that item.
	 */
	private readonly maps: Record<string, Map<number, TValue>> = {};
	/**
	 * Record of signals for each attribute that fire when the attribute is updated.
	 */
	private readonly sigs: Record<string, ReturnType<typeof createIncrSignal>> = {};
	/**
	 * Signal when new attrs are added or removed.
	 */
	private readonly attrSig = createIncrSignal();

	/**
	 * Helper method to get or create map for attribute.
	 */
	private getMap(attr: string) {
		return (this.maps[attr] ??= new Map<number, TValue>());
	}

	/**
	 * Helper method to get or create signal for attribute.
	 */
	private getSig(attr: string) {
		if (this.sigs[attr]) {
			return this.sigs[attr];
		}
		const ret = createIncrSignal();
		this.sigs[attr] = ret;
		this.attrSig[1]();
		return ret;
	}

	/**
	 * Add a new value to an attribute list.
	 */
	add(attr: string, value: TValue) {
		const id = this.count++;
		this.set(attr, id, value);
		return id;
	}

	/**
	 * Remove a value from an attribute list.
	 */
	rm(attr: string, id: number) {
		this.maps[attr]?.delete(id);
		this.sigs[attr]?.[1]();
	}

	/**
	 * Update a value in an attribute list.
	 */
	set(attr: string, id: number, value: TValue) {
		const map = this.getMap(attr);
		map.set(id, value);
		this.getSig(attr)[1]();
	}

	/**
	 * Reactive accessor for an array of all attrs associated with this map
	 */
	attrs() {
		this.attrSig[0]();
		return Object.keys(this.maps);
	}

	/**
	 * Reactive accessor for an iterable of all values associated with an attribute.
	 */
	values(attr: string) {
		this.getSig(attr)[0]();
		return this.getMap(attr).values();
	}

	/**
	 * Create an effect to add and update a value for an attribute. Set `unwrap=true` if
	 * passing an accessor that should be called (but do not do this if the value itself
	 * is a function, like an event handler).
	 */
	effect(attr: string, value: TValue, unwrap?: false): void;
	effect(attr: string, value: TValue | (() => TValue), unwrap: true): void;
	effect(attr: string, value: TValue | (() => TValue), unwrap = false) {
		let id: number | undefined;
		createRenderEffect(() => {
			const resolved =
				unwrap && typeof value === 'function'
					? (value as () => TValue)()
					: (value as TValue);
			if (id !== undefined) {
				this.set(attr, id, resolved);
			} else {
				id = this.add(attr, resolved);
			}
		});

		// This clean up goes here instead of inside the effect because we want to
		// remove the value when the effect is disposed (i.e. component is unmounted),
		// not when the value changes.
		onCleanup(() => {
			if (id !== undefined) {
				this.rm(attr, id);
			}
		});
	}
}

/**
 * A class used to additively declare props that should be merged onto a given
 * component or element. Expected usage is for a much higher parent or sibling
 * element to try and assign props, or if we want to refactor some prop logic
 * across multiple components.
 */
export class PropBuilder<
	TTag extends keyof JSX.HTMLElementTags = keyof JSX.HTMLElementTags,
	// TTag & keyof JSX.HTMLElementTags shouldn't be necessary since TTag extends it
	// but the index type doesn't seem to work without it otherwise
	TAttributes = JSX.HTMLElementTags[TTag & keyof JSX.HTMLElementTags],
	TElement extends HTMLElement = TAttributes extends JSX.HTMLAttributes<infer T>
		? T & HTMLElement
		: HTMLElement,
> {
	// Disable linter below because it's complaining it wants the destructured values
	// from `createSignal` but we know what we're doing here.
	/* eslint-disable solid/reactivity */
	/** Signal for ID of element */
	private readonly idSig = createSignal<string>();
	/** Signal for ref to element */
	private readonly refSig = createSignal<TElement>();
	/* eslint-enable solid/reactivity */

	/** Extra ref assignment callbacks */
	private readonly refCbs: ((val: TElement) => void)[] = [];
	/** Callbacks that return a non-exclusive list item to a prop */
	private readonly attrListVals = new AttrMap<string | undefined>();
	/** Callbacks that exclusively set the value of a prop */
	private readonly attrVals = new AttrMap<string | boolean | number | undefined>();
	/** Callbacks that set default values for props */
	private readonly defaultAttrVals = new AttrMap<string | boolean | number | undefined>();
	/** Event handler callbacks */
	private readonly evtCbs = new AttrMap<JSX.EventHandlerUnion<TElement, Event>>();
	/** Extra functions for modifying props after merge */
	private readonly mods: (<TProps extends TAttributes>(props: TProps) => Partial<TProps>)[] = [];

	/** Signal accessor that updates when the prop ID changes */
	id = this.idSig[0];

	/** Signal accessor that returns a ref to the underlying element */
	ref = this.refSig[0];

	/** Add a ref function that will be added to the underlying component */
	addRef(callback: ((val: TElement) => void) | TElement | null | undefined) {
		if (typeof callback === 'function') {
			this.refCbs.push(callback as (val: TElement) => void);
		}
		return this;
	}

	/** Set a default attribute value that only applies if no prop value is provided */
	defaultAttr(
		attr: `data-${string}`,
		value: string | undefined | (() => string | undefined),
	): void;
	defaultAttr<TAttr extends keyof TAttributes>(
		attr: TAttr &
			(TAttributes[TAttr] extends boolean | number | string | undefined ? TAttr : never),
		callback: TAttributes[TAttr] | (() => TAttributes[TAttr]),
	): void;
	// Should be unnecessary but TypeScript doesn't reliably infer with generics
	defaultAttr<TAttr extends keyof JSX.HTMLElementTags[keyof JSX.HTMLElementTags]>(
		attr: TAttr &
			(JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr] extends
				| boolean
				| number
				| string
				| undefined
				? TAttr
				: never),
		callback:
			| JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr]
			| (() => JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr]),
	): void;
	defaultAttr(attr: any, value: any) {
		this.defaultAttrVals.effect(attr, value, true);
	}

	/** Add a string ID to an attribute that is a list of IDs */
	extAttr(attr: `data-${string}`, value: string | (() => string | undefined)): void;
	extAttr<TAttr extends keyof TAttributes>(
		attr: TAttr & (TAttributes[TAttr] extends string | undefined ? TAttr : never),
		value: TAttributes[TAttr] | (() => TAttributes[TAttr]),
	): void;
	// Should be unnecessary but TypeScript doesn't reliably infer with generics
	extAttr<TAttr extends keyof JSX.HTMLElementTags[keyof JSX.HTMLElementTags]>(
		attr: TAttr &
			(JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr] extends string | undefined
				? TAttr
				: never),
		value:
			| JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr]
			| (() => JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr]),
	): void;
	extAttr(attr: any, value: any) {
		this.attrListVals.effect(attr, value, true);
	}

	/** Assign a string attribute to an element */
	setAttr(attr: `data-${string}`, value: string | undefined | (() => string | undefined)): void;
	setAttr<TAttr extends keyof TAttributes>(
		attr: TAttr &
			(TAttributes[TAttr] extends boolean | number | string | undefined ? TAttr : never),
		callback: TAttributes[TAttr] | (() => TAttributes[TAttr]),
	): void;
	// Should be unnecessary but TypeScript doesn't reliably infer with generics
	setAttr<TAttr extends keyof JSX.HTMLElementTags[keyof JSX.HTMLElementTags]>(
		attr: TAttr &
			(JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr] extends
				| boolean
				| number
				| string
				| undefined
				? TAttr
				: never),
		callback:
			| JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr]
			| (() => JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr]),
	): void;
	setAttr(attr: any, value: any) {
		if (attr === 'id') {
			this.idSig[1](value);
		}
		this.attrVals.effect(attr, value, true);
	}

	/**
	 * Add a prop remover -- more loosely typed since it's used to remove non-standard
	 * HTML attributes and props
	 */
	rmAttr(attr: string) {
		this.setAttr(attr as any, undefined);
	}

	/** Add to a callback prop like onClick */
	handle<TProp extends `on${string}` & keyof JSX.DOMAttributes<TElement>>(
		prop: TProp,
		handler: JSX.DOMAttributes<TElement>[TProp],
	) {
		this.evtCbs.effect(prop, handler as JSX.EventHandlerUnion<TElement, Event>, false);
	}

	/** Add an extra callback for modifying props after merge */
	mod<TProps extends TAttributes>(
		mod: (props: TProps & Record<`data-${string}`, string | undefined>) => Partial<TProps>,
	) {
		this.mods.push(mod as any);
	}

	/**
	 * (Non-reactive) variable for tracking whether merge has already been called within
	 * the curren scope.
	 */
	private merged = false;

	/**
	 * Merge props based on all the extensions that have been added.
	 */
	merge<TProps extends TAttributes>(
		props?: TProps & Record<`data-${string}`, string | undefined>,
	): TProps {
		if (this.merged) {
			// If you see this error while running SSR, you may need to memoize or move
			// the .merge() call outside of the JSX (which seems to get called more often
			// than it is in client code)
			useLogger().warn('PropBuilder should only be used for a single component at a time');
			return props ?? ({} as TProps);
		}

		const [track, signalUpdate] = createIncrSignal();
		const ret = {} as Record<string, unknown> & Record<`data-${string}`, string>;
		const update = (key: string, value: unknown) => {
			// Solid intentionally does not override undefined props with mergeProps
			// (https://github.com/solidjs/solid/issues/1383), so switch to null
			// If this ever breaks, we move to something using `splitProps`
			const next = value ?? null;
			if (ret[key] !== next) {
				ret[key] = next;
				signalUpdate();
			}
		};

		// Set up ref to capture element
		const [, setRef] = this.refSig;
		ret['ref'] = combineRefs(
			setRef as (elm: TElement | undefined) => void,
			...(this.refCbs as (
				| ((val: TElement | undefined) => void)
				| TElement
				| null
				| undefined
			)[]),
			// Uh, just don't change the ref prop. We can do something hacky if needed
			// but honestly it's a bit of hassle and overhead and all of the overhead
			// for this could live in the ref itself if need be.
			(props as any)?.ref,
		);

		// Unset ID and ref on unmount. PropBuilder may exist longer than the element
		// (e.g. via a parent component that conditionally renders the element) and
		// we don't want to keep stale references.
		onCleanup(() => {
			this.merged = false;
			const [, setRef] = this.refSig;
			setRef(undefined);
			const [, setId] = this.idSig;
			setId(undefined);
		});

		// Merge attribute lists
		createRenderEffect(
			mapArray(
				() => this.attrListVals.attrs(),
				(attr) =>
					createRenderEffect(() => {
						const propValue = props?.[attr as keyof typeof props] as string | undefined;
						const values = new Set<string>(propValue ? [propValue] : []);
						for (const val of this.attrListVals.values(attr)) {
							if (val) {
								values.add(val);
							}
						}
						update(attr, Array.from(values).join(' '));
					}),
			),
		);

		// Merge attributes and default attributes
		createRenderEffect(
			mapArray(
				() => [...new Set([...this.attrVals.attrs(), ...this.defaultAttrVals.attrs()])],
				(attr) =>
					createRenderEffect(() => {
						// Check for explicitly set attributes first
						const values = Array.from(this.attrVals.values(attr));
						if (values.length) {
							update(attr, values[values.length - 1]);
							return;
						}

						// If no explicit value, use prop value if it exists
						const propValue = props?.[attr as keyof typeof props];
						if (propValue !== undefined) {
							update(attr, propValue);
							return;
						}

						// Finally fall back to default values
						const defaultValues = Array.from(this.defaultAttrVals.values(attr));
						if (defaultValues.length) {
							update(attr, defaultValues[defaultValues.length - 1]);
						}
					}),
			),
		);

		// Merge event handlers
		createRenderEffect(
			mapArray(
				() => this.evtCbs.attrs(),
				(prop) =>
					createRenderEffect(() => {
						const handlers = Array.from(this.evtCbs.values(prop));
						const combinedHandler = combineEventHandlers(
							...handlers,
							props?.[prop as keyof typeof props] as
								| JSX.EventHandlerUnion<TElement, Event>
								| undefined,
						);
						update(prop, combinedHandler);
					}),
			),
		);

		this.merged = true;
		let merged = mergeProps(props, () => {
			track();
			// Spread object to ensure we're returning a new object
			return { ...(ret as TProps) };
		});

		for (const mod of this.mods) {
			// This is fine. We're basically just wrapping `mergeProps` with potentially
			// more `mergeProps`.
			// eslint-disable-next-line solid/reactivity
			merged = mod(merged as TProps) as typeof merged;
		}

		// Update ID signal when ID changes
		createRenderEffect(() => {
			const [, setId] = this.idSig;
			setId((merged as any).id);
		});

		return merged as TProps;
	}
}
