import cx from 'classix';
import { children, createEffect, createSignal, type JSX, useContext } from 'solid-js';

import { FormControlContext } from '~/shared/components/form-control-context';
import { generateId } from '~/shared/utility/id-generator';
import { spanify } from '~/shared/utility/solid/spanify';

export function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
	const [forId, setForId] = createSignal<string | undefined>();
	const context = useContext(FormControlContext);
	createEffect(() => {
		const input = context?.input();
		if (!input) {
			setForId(undefined);
			return;
		}

		let id = input.id;
		if (!id) {
			id = generateId('input');
			if (id) input.id = id;
		}
		setForId(id);
	});

	const resolved = children(() => props.children);

	return (
		<label for={forId()} {...props} class={cx('c-label', props.class)}>
			{
				// Wrap text nodes and strings in spans to make it easier to apply
				// overflow in a way that doesn't result in focus ring clipping
				spanify(resolved.toArray())
			}
		</label>
	);
}
