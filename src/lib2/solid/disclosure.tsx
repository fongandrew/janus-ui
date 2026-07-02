import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface DisclosureProps extends ComponentProps<'details'> {
	/** Content of the always-visible `<summary>`. */
	summary: JSX.Element;
}

/** Disclosure (§10.1) — `<details class="c-disclosure">` with a `<summary>`. */
export function Disclosure(props: DisclosureProps) {
	const [local, rest] = splitProps(props, ['summary', 'class', 'children']);
	return (
		<details {...rest} class={cx('c-disclosure', local.class)}>
			<summary>{local.summary}</summary>
			{local.children}
		</details>
	);
}
