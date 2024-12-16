import cx from 'classix';
import { type JSX } from 'solid-js';

export function LabelStack(
	props: JSX.IntrinsicAttributes & JSX.LabelHTMLAttributes<HTMLDivElement>,
) {
	return <div {...props} class={cx('c-label-stack', props.class)} />;
}
