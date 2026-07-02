/**
 * Disclosure (§13.7) — native `<details><summary>` (`c-disclosure`).
 */
import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface DisclosureProps extends ComponentProps<'details'> {
	summary: JSX.Element;
}

export function Disclosure(props: DisclosureProps) {
	const [local, rest] = splitProps(props, ['summary', 'class', 'children']);
	return (
		<details {...rest} class={cx('c-disclosure', local.class)}>
			<summary>{local.summary}</summary>
			<div class="c-disclosure__content">{local.children}</div>
		</details>
	);
}
