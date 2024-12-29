import cx from 'classix';
import { createEffect, createSignal, type JSX, useContext } from 'solid-js';

import { FormControlContext } from '~/shared/components/form-control-context';
import { generateId } from '~/shared/utility/id-generator';

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

	return <label for={forId()} {...props} class={cx('c-label', props.class)} />;
}
