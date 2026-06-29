/**
 * `Avatar` (§13.7). An image avatar, falling back to initials / icon when `src`
 * is absent. Composes `o-square`.
 */
import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
	src?: string;
	alt?: string;
	fallback?: JSX.Element;
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
