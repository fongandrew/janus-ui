import cx from 'classix';
import { createEffect, type JSX, onCleanup, useContext } from 'solid-js';

import { FormControlContext } from '~/shared/components/form-control-context';
import { updateAttributeList } from '~/shared/utility/attribute-list';
import { generateId } from '~/shared/utility/id-generator';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';

export interface DescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * Description text, generally following a label
 */
export function Description(props: DescriptionProps) {
	const defaultId = generateId('description');
	const id = () => props.id || defaultId;

	const isMounted = createMountedSignal();
	const context = useContext(FormControlContext);
	createEffect(() => {
		if (!isMounted()) return;

		const input = context?.input();
		if (!input) return;

		const descriptionId = id();
		updateAttributeList(input, 'aria-describedby', [descriptionId]);
		onCleanup(() => {
			updateAttributeList(input, 'aria-describedby', [], [descriptionId]);
		});
	});

	return <div {...props} id={id()} class={cx('c-description', props.class)} />;
}
