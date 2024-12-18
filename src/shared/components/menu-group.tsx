import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { generateId } from '~/shared/utility/id-generator';

export interface MenuGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
	heading?: JSX.Element;
}

export function MenuGroup(props: MenuGroupProps) {
	const headingId = generateId('menu-heading');
	const [local, rest] = splitProps(props, ['heading']);
	return (
		<>
			{props.heading && (
				<div class="c-menu__heading" id={headingId}>
					{local.heading}
				</div>
			)}
			<div
				{...rest}
				class={cx('c-menu__group', props.class)}
				role="group"
				aria-labelledby={headingId}
			>
				{props.children}
			</div>
		</>
	);
}
