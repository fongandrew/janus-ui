import cx from 'classix';
import { type JSX } from 'solid-js';

export function Label(props: JSX.IntrinsicAttributes & JSX.LabelHTMLAttributes<HTMLLabelElement>) {
	return <label {...props} class={cx('c-label', props.class)} />;
}
