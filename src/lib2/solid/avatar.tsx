import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

export interface AvatarProps extends ComponentProps<'span'> {
	src?: string;
	alt?: string;
	/** Initials string or icon JSX shown when `src` is absent. */
	fallback?: JSX.Element;
}

/** Avatar (§10.1) — `c-avatar o-square`; `<img>` when `src` is set, else fallback. */
export function Avatar(props: AvatarProps) {
	const [local, rest] = splitProps(props, ['src', 'alt', 'fallback', 'class']);
	return (
		<Show
			when={local.src}
			fallback={
				<span {...rest} class={cx('c-avatar o-square', local.class)}>
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
