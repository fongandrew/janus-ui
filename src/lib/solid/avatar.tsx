import { type JSX, Show, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface AvatarProps extends JSX.HTMLAttributes<HTMLSpanElement> {
	src?: string;
	alt?: string;
	fallback?: string;
}

export function Avatar(props: AvatarProps) {
	const [local, rest] = splitProps(props, ['src', 'alt', 'fallback', 'class']);
	return (
		<span class={attrs('c-avatar o-square', local.class)} {...rest}>
			<Show when={local.src} fallback={<span class="c-avatar__fallback">{local.fallback}</span>}>
				<img class="c-avatar__img" src={local.src} alt={local.alt ?? ''} />
			</Show>
		</span>
	);
}
