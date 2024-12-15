import cx from 'classix';
import { type JSX } from 'solid-js';

import { btn } from '~/shared/components/button.module.css';
import { useFormControl } from '~/shared/utility/use-form-control';

export function Button(
	props: JSX.IntrinsicAttributes & JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) {
	const rest = useFormControl(props);
	return <button {...rest} class={cx(btn, props.class)} />;
}
