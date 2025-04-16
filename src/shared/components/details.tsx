import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

export interface DetailsProps
	extends Omit<JSX.DetailsHtmlAttributes<HTMLDetailsElement>, 'children'> {
	/** Two children in render funcs -- one for summary and one for details */
	children: [() => JSX.Element, () => JSX.Element];
}

/**
 * Expandable details component with summary and content sections
 *
 * @example
 * ```tsx
 * 	<Details>
 * 		{() => <>Click to expand</>}
 * 		{() => (
 * 			<>
 * 				<p>This is the first paragraph...</p>
 * 				<p>Here is another paragraph...</p>
 * 			</>
 * 		)}
 * 	</Details>
 * ```
 */
export function Details(props: DetailsProps) {
	const [local, rest] = splitProps(props, ['class', 'children']);
	return (
		<details {...rest} class={cx('c-details', local.class)}>
			<summary class="c-details__summary">{local.children[0]()}</summary>
			<div class="c-details__content">{local.children[1]()}</div>
		</details>
	);
}
