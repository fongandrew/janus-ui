/** `Avatar` (§13.7) — `c-avatar`, a 1:1 image or initials/icon fallback. */

import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
	src?: string | undefined;
	alt?: string | undefined;
	/** Shown when `src` is absent: initials text or an icon. */
	fallback?: JSX.Element | undefined;
}

export function Avatar(props: AvatarProps) {
	const [local, rest] = splitProps(props, ['src', 'alt', 'fallback', 'class']);
	return (
		<span {...rest} class={cx('c-avatar', local.class)}>
			<Show when={local.src} fallback={local.fallback}>
				<img src={local.src} alt={local.alt ?? ''} />
			</Show>
		</span>
	);
}
