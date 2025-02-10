import cx from 'classix';
import { createMemo, type JSX } from 'solid-js';

import { useFormElement } from '~/shared/components/form-element-context';
import { generateId } from '~/shared/utility/id-generator';

export interface DescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * Description text, generally following a label
 */
export function Description(props: DescriptionProps) {
	const id = createMemo(() => props.id || generateId('description'));

	const formElement = useFormElement();
	formElement?.extAttr('aria-describedby', () => id());

	return <div {...props} id={id()} class={cx('c-description', props.class)} />;
}
