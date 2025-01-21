import { createRenderEffect, createSignal, type JSX, mergeProps, onCleanup } from 'solid-js';

import { pullLast } from '~/shared/utility/list';
import { useLogger } from '~/shared/utility/logger';
import { bindProp, combineEventHandlers } from '~/shared/utility/solid/combine-event-handlers';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { createIncrSignal } from '~/shared/utility/solid/create-incr-signal';

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
	private readonly idSig = createSignal<string>();
	private readonly refSig = createSignal<TElement>();
	/* eslint-enable solid/reactivity */

	/** Extra ref assignment callbacks */
	private readonly refCbs: ((val: TElement) => void)[] = [];
	/** Callbacks that return a non-exclusive list item to a prop */
	private readonly attrListCbs: Record<string, (() => string | undefined)[]> = {};
	/** Callbacks that exclusively set the value of a prop */
	private readonly attrCbs: Record<string, (() => string | boolean | number | undefined)[]> = {};
	/** Event handler callbacks */
	private readonly evtCbs: Record<string, JSX.EventHandlerUnion<TElement, Event>[]> = {};

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

	/** Add a string ID to an attribute that is a list of IDs */
	extAttr(attr: `data-${string}`, callback: () => string | undefined): void;
	extAttr<TAttr extends keyof TAttributes>(
		attr: TAttr & (TAttributes[TAttr] extends string | undefined ? TAttr : never),
		callback: () => TAttributes[TAttr],
	): void;
	// Should be unnecessary but TypeScript doesn't reliably infer with generics
	extAttr<TAttr extends keyof JSX.HTMLElementTags[keyof JSX.HTMLElementTags]>(
		attr: TAttr &
			(JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr] extends string | undefined
				? TAttr
				: never),
		callback: () => JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr],
	): void;
	extAttr(attr: any, callback: () => any) {
		const list = (this.attrListCbs[attr] ??= []);
		list.push(callback);
		onCleanup(() => pullLast(list, callback));
	}

	/** Assign a string attribute to an element */
	setAttr(attr: `data-${string}`, callback: () => string | undefined): void;
	setAttr<TAttr extends keyof TAttributes>(
		attr: TAttr &
			(TAttributes[TAttr] extends boolean | number | string | undefined ? TAttr : never),
		callback: () => TAttributes[TAttr],
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
		callback: () => JSX.HTMLElementTags[keyof JSX.HTMLElementTags][TAttr],
	): void;
	setAttr(attr: any, callback: () => any) {
		const list = (this.attrCbs[attr] ??= []);
		list.push(callback);
		onCleanup(() => pullLast(list, callback));
	}

	/** Add to a callback prop like onClick */
	handle<TProp extends keyof JSX.CustomEventHandlersCamelCase<TElement>>(
		prop: TProp,
		handler: JSX.CustomEventHandlersCamelCase<TElement>[TProp],
	) {
		if (!handler) return;
		const list = (this.evtCbs[prop] ??= []);
		list.push(handler as JSX.EventHandlerUnion<TElement, Event>);
		onCleanup(() => pullLast(list, handler as JSX.EventHandlerUnion<TElement, Event>));
	}

	/**
	 * Merge props based on all the extensions that have been added.
	 */
	merge<
		TProps extends {
			id?: string | undefined;
			ref?: any | ((el: any) => void) | undefined;
		},
	>(props: TProps & Record<`data-${string}`, string | undefined>): TProps {
		if (this.ref()) {
			useLogger().warn('PropBuilder should only be used for a single component at a time');
			return props;
		}

		const [track, signalUpdate] = createIncrSignal();
		const ret = {} as Record<string, unknown> & Record<`data-${string}`, string>;
		const update = (key: string, value: unknown) => {
			if (ret[key] !== value) {
				// Solid intentionally does not override undefined props with mergeProps
				// (https://github.com/solidjs/solid/issues/1383), so switch to null
				// If this ever breaks, we move to something using `splitProps`
				ret[key] = value ?? null;
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
			// eslint-disable-next-line solid/reactivity
			props.ref,
		);

		// Update ID signal when ID changes
		createRenderEffect(() => {
			const [, setId] = this.idSig;
			setId(props.id);
		});

		// Unset ID and ref on unmount. PropBuilder may exist longer than the element
		// (e.g. via a parent component that conditionally renders the element) and
		// we don't want to keep stale references.
		onCleanup(() => {
			const [, setRef] = this.refSig;
			setRef(undefined);
			const [, setId] = this.idSig;
			setId(undefined);
		});

		// Merge attribute lists
		for (const [attr, callbacks] of Object.entries(this.attrListCbs)) {
			createRenderEffect(() => {
				const propValue = props[attr as keyof typeof props] as string | undefined;
				const values: string[] = propValue ? [propValue] : [];
				for (const callback of callbacks) {
					const ret = callback();
					if (ret) {
						values.push(ret);
					}
				}
				update(attr, values.join(' '));
			});
		}

		// Merge attributes
		for (const [attr, callbacks] of Object.entries(this.attrCbs)) {
			createRenderEffect(() => {
				const last = callbacks[callbacks.length - 1];
				update(attr, last?.());
			});
		}

		// Merge event handlers
		for (const [prop, handlers] of Object.entries(this.evtCbs)) {
			ret[prop] = combineEventHandlers(
				...handlers,
				bindProp(props, prop as keyof typeof props) as JSX.EventHandlerUnion<
					TElement,
					Event
				>,
			);
		}

		const merged = mergeProps(props, () => {
			track();
			// Spread object to ensure we're returning a new object
			return { ...(ret as TProps) };
		});
		return merged as TProps;
	}
}
