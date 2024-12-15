// import '~/shared/components/box.css';

import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export type BoxProps = JSX.IntrinsicAttributes &
	JSX.HTMLAttributes<HTMLDivElement> & {
		as?: 'main' | 'section' | 'div' | 'header' | 'footer' | 'aside' | 'nav';
	};

export function Box(props: BoxProps) {
	const [local, rest] = splitProps(props, ['as']);
	return <Dynamic component={local.as || 'div'} {...rest} class={cx('boxo', props.class)} />;
}
