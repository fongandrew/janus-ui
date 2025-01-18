import { createRenderEffect, createSignal, type JSX, mergeProps, onCleanup } from 'solid-js';

import { pullLast } from '~/shared/utility/list';
import { bindProp, combineEventHandlers } from '~/shared/utility/solid/combine-event-handlers';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { createIncrSignal } from '~/shared/utility/solid/create-incr-signal';

/**
 * A class used to additively declare props that should be merged onto a given
 * component or element. Expected usage is for a much higher parent or sibling
 * element to try and assign props, or if we want to refactor some prop logic
 * across multiple components.
 */
export class PropBuilder<T extends HTMLElement = HTMLElement> {
	// Disable linter below because it's complaining it wants the destructured values
	// from `createSignal` but we know what we're doing here.
	// eslint-disable-next-line solid/reactivity
	private readonly idSig = createSignal<string>();
	// eslint-disable-next-line solid/reactivity
	private readonly refSig = createSignal<T>();

	/** Extra ref assignment callbacks */
	private readonly refCbs: ((val: T) => void)[] = [];
	/** Callbacks that return a non-exclusive list item to a prop */
	private readonly attrListCbs: Record<string, (() => string | undefined)[]> = {};
	/** Callbacks that exclusively set the value of a prop */
	private readonly attrCbs: Record<string, (() => string | boolean | number | undefined)[]> = {};
	/** Event handler callbacks */
	private readonly evtCbs: Record<string, JSX.EventHandlerUnion<T, Event>[]> = {};

	/** Signal accessor that updates when the prop ID changes */
	id = this.idSig[0];

	/** Signal accessor that returns a ref to the underlying element */
	ref = this.refSig[0];

	/** Add a ref function that will be added to the underlying component */
	addRef(callback: ((val: T) => void) | T | null | undefined) {
		if (typeof callback === 'function') {
			this.refCbs.push(callback);
		}
		return this;
	}

	/** Add a string ID to an attribute that is a list of IDs */
	extAttr<TAttr extends keyof JSX.HTMLAttributes<T>>(
		attr: TAttr & (JSX.HTMLAttributes<T>[TAttr] extends string | undefined ? TAttr : never),
		callback: () => JSX.HTMLAttributes<T>[TAttr],
	) {
		const list = (this.attrListCbs[attr] ??= []);
		list.push(callback);
		onCleanup(() => pullLast(list, callback));
	}

	/** Assign a string attribute to an element */
	setAttr<TAttr extends keyof JSX.HTMLAttributes<T>>(
		attr: TAttr &
			(JSX.HTMLAttributes<T>[TAttr] extends boolean | number | string | undefined
				? TAttr
				: never),
		callback: () => JSX.HTMLAttributes<T>[TAttr],
	) {
		const list = (this.attrCbs[attr] ??= []);
		list.push(callback);
		onCleanup(() => pullLast(list, callback));
	}

	/** Add to a callback prop like onClick */
	handle<TProp extends keyof JSX.CustomEventHandlersCamelCase<T>>(
		prop: TProp,
		handler: JSX.CustomEventHandlersCamelCase<T>[TProp],
	) {
		if (!handler) return;
		const list = (this.evtCbs[prop] ??= []);
		list.push(handler as JSX.EventHandlerUnion<T, Event>);
		onCleanup(() => pullLast(list, handler as JSX.EventHandlerUnion<T, Event>));
	}

	/**
	 * Merge props based on all the extensions that have been added.
	 */
	merge<TProps extends JSX.HTMLAttributes<T>>(
		props: TProps & Record<`data-${string}`, string>,
	): TProps {
		const [track, signalUpdate] = createIncrSignal();
		const ret = {} as Record<string, unknown> & Record<`data-${string}`, string>;
		const update = (key: string, value: unknown) => {
			if (ret[key] !== value) {
				ret[key] = value;
				signalUpdate();
			}
		};

		// Set up ref to capture element
		const [, setRef] = this.refSig;
		ret['ref'] = combineRefs(
			setRef,
			...(this.refCbs as (((val: T) => void) | T | null | undefined)[]),
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
				bindProp(props, prop as keyof JSX.HTMLAttributes<T>) as JSX.EventHandlerUnion<
					T,
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
