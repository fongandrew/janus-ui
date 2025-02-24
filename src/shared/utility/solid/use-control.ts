import { createEffect, createUniqueId, mergeProps, onCleanup } from 'solid-js';

import { type Control } from '~/shared/utility/controls/control';
import { useWindow } from '~/shared/utility/solid/window-context';

/**
 * Assigns initial attributes to a Control and updates on change
 */
export function useControl<TElement extends HTMLElement, TProps, TInitProps>(
	ControlCls: typeof Control<TElement, TProps> & { initProps: (props: TProps) => TInitProps },
	props: (TProps & { id?: string | undefined }) | (() => TProps & { id?: string | undefined }),
) {
	const retProps = mergeProps(
		() => ({ id: createUniqueId() }),
		() => ControlCls.initProps(props),
	);
	const window = useWindow();

	let control: Control<TElement, TProps> | undefined;

	createEffect(() => {
		const resolved = typeof props === 'function' ? props() : props;

		// Access all props so this effect re-runs when any of them change
		// This breaks fine-grained reactivity but controls are meant to operate
		// outside of Solid's reactivity system (i.e. can be used in standalone scripts)
		for (const prop in props) {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			(props as Record<string, any>)[prop];
		}

		if (control) {
			control.update(resolved);
			return;
		}

		const elm = window?.document.getElementById(retProps.id);
		if (!elm) return;
		control = new ControlCls(elm as TElement, resolved);
	});

	onCleanup(() => {
		control?.cleanUp();
	});

	return retProps as TInitProps & { id: string };
}
