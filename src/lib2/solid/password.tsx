/**
 * Password (§13.7) — Input plus a show/hide IconButton. Client-only
 * behavior, so a local signal is fine here.
 */
import cx from 'classix';
import { createSignal, splitProps } from 'solid-js';

import { IconButton } from '~/lib2/solid/button';
import { Input, type InputProps } from '~/lib2/solid/input';

export interface PasswordProps extends Omit<InputProps, 'type'> {}

export function Password(props: PasswordProps) {
	const [local, rest] = splitProps(props, ['class']);
	const [show, setShow] = createSignal(false);
	return (
		<div class={cx('o-group', local.class)}>
			<Input {...rest} type={show() ? 'text' : 'password'} class="t-flex-fill" />
			<IconButton
				aria-label={show() ? 'Hide password' : 'Show password'}
				aria-pressed={show()}
				onClick={() => setShow((prev) => !prev)}
			>
				{show() ? '🙈' : '👁'}
			</IconButton>
		</div>
	);
}
