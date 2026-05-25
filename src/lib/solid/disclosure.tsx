import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface DisclosureProps extends JSX.DetailsHtmlAttributes<HTMLDetailsElement> {
	summary: JSX.Element;
}

export function Disclosure(props: DisclosureProps) {
	const [local, rest] = splitProps(props, ['summary', 'class', 'children']);
	return (
		<details class={attrs('c-disclosure', local.class)} {...rest}>
			<summary>{local.summary}</summary>
			{local.children}
		</details>
	);
}
