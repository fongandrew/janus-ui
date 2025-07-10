import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface DetailsProps extends Omit<ComponentProps<'details'>, 'children'> {
	/** Summary props */
	summary?: ComponentProps<'summary'>;
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
	const [local, rest] = splitProps(props, ['class', 'summary', 'children']);
	return (
		<details {...rest} class={cx('c-details', local.class)}>
			<summary {...local.summary} class={cx('c-details__summary', local.summary?.class)}>
				{local.children[0]()}
			</summary>
			<div class="c-details__content">{local.children[1]()}</div>
		</details>
	);
}
