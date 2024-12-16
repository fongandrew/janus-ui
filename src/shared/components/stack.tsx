import cx from 'classix';
import { type JSX } from 'solid-js';

export function Stack(props: JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>) {
	return <div {...props} class={cx('c-stack', props.class)} />;
}
