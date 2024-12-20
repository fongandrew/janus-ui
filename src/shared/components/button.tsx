import cx from 'classix';
import { type JSX } from 'solid-js';

import { useFormControl } from '~/shared/utility/use-form-control';

export function Button(
	props: JSX.IntrinsicAttributes & JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) {
	const rest = useFormControl(props);
	return <button {...rest} class={cx('c-button', props.class)} />;
}
