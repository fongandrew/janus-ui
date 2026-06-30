/** `Disclosure` (§13.7) — `c-disclosure`, native `<details><summary>`. */

import cx from 'classix';
import { ChevronRight } from 'lucide-solid';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface DisclosureProps extends Omit<ComponentProps<'details'>, 'children'> {
	summary: JSX.Element;
	children?: JSX.Element;
}

export function Disclosure(props: DisclosureProps) {
	const [local, rest] = splitProps(props, ['summary', 'children', 'class']);
	return (
		<details {...rest} class={cx('c-disclosure', local.class)}>
			<summary>
				<ChevronRight class="c-disclosure__chevron" aria-hidden="true" />
				{local.summary}
			</summary>
			<div class="c-disclosure__content">{local.children}</div>
		</details>
	);
}
