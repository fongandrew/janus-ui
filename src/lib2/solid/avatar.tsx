/**
 * Avatar (§13.7) — `c-avatar o-square`; `<img>` when src is given, else an
 * initials/icon fallback `<span>`.
 */
import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
	src?: string | undefined;
	alt?: string | undefined;
	/** Initials string or icon JSX, shown when src is absent. */
	fallback?: JSX.Element;
}

export function Avatar(props: AvatarProps) {
	const [local, rest] = splitProps(props, ['src', 'alt', 'fallback', 'class']);
	return (
		<Show
			when={local.src}
			fallback={
				<span
					{...rest}
					role="img"
					aria-label={local.alt}
					class={cx('c-avatar o-square', local.class)}
				>
					{local.fallback}
				</span>
			}
		>
			{(src) => (
				<img
					{...(rest as ComponentProps<'img'>)}
					src={src()}
					alt={local.alt ?? ''}
					class={cx('c-avatar o-square', local.class)}
				/>
			)}
		</Show>
	);
}
