// import '~/shared/components/box.css';

import '~/shared/components/box.css';

import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export type BoxProps = JSX.HTMLAttributes<HTMLDivElement> & {
	as?: 'main' | 'section' | 'div' | 'header' | 'footer' | 'aside' | 'nav';
};

/** A box with basic padding for form elements */
export function Box(props: BoxProps) {
	const [local, rest] = splitProps(props, ['as']);
	return <Dynamic component={local.as || 'div'} {...rest} class={cx('c-box', props.class)} />;
}

/** A box with padding for text */
export function TextBox(props: BoxProps) {
	const [local, rest] = splitProps(props, ['as']);
	return (
		<Dynamic component={local.as || 'div'} {...rest} class={cx('c-text-box', props.class)} />
	);
}
