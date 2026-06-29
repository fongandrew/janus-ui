/**
 * `Disclosure` (§13.7). Native `<details><summary>` chrome.
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
			<summary>
				{local.summary}
				<span class="c-disclosure__chevron">›</span>
			</summary>
			<div class="c-disclosure__content">{local.children}</div>
		</details>
	);
}
