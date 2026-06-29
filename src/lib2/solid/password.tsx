/**
 * `Password` (§13.7). Extends `Input` with a show/hide toggle button.
 */
import cx from 'classix';
import { createSignal, splitProps } from 'solid-js';

import { IconButton } from '~/lib2/solid/button';
import { Input, type InputProps } from '~/lib2/solid/input';

export interface PasswordProps extends Omit<InputProps, 'type'> {}

export function Password(props: PasswordProps) {
	const [local, rest] = splitProps(props, ['class']);
	const [shown, setShown] = createSignal(false);
	return (
		<span class={cx('o-row', local.class)}>
			<Input {...rest} type={shown() ? 'text' : 'password'} />
			<IconButton
				label={shown() ? 'Hide password' : 'Show password'}
				aria-pressed={shown()}
				onClick={() => setShown((s) => !s)}
			>
				{shown() ? '🙈' : '👁'}
			</IconButton>
		</span>
	);
}
