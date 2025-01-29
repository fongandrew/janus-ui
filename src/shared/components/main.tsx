import cx from 'classix';
import { type JSX } from 'solid-js';

export function Main(props: JSX.IntrinsicElements['main']) {
	return (
		<main {...props} class={cx('c-main', props.class)}>
			{props.children}
		</main>
	);
}
