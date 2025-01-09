import cx from 'classix';
import { type JSX } from 'solid-js';

import { FormControlGroup } from '~/shared/components/form-control-group';

export function LabelStack(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return (
		<FormControlGroup>
			<div {...props} class={cx('c-label-stack', props.class)} />
		</FormControlGroup>
	);
}
