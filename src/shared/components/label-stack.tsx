import cx from 'classix';
import { type JSX } from 'solid-js';

import { FormElementProvider } from '~/shared/components/form-element-provider';

/** A stack of labels for form elements. */
export function LabelStack(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return (
		<FormElementProvider>
			<div {...props} class={cx('c-label-stack', props.class)} />
		</FormElementProvider>
	);
}
