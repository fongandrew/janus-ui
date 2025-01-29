import cx from 'classix';
import { type JSX } from 'solid-js';

export function Header(props: JSX.IntrinsicElements['header']) {
	return (
		<header {...props} class={cx('c-header', props.class)}>
			{props.children}
		</header>
	);
}
