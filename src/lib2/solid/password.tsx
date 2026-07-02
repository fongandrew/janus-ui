import cx from 'classix';
import { createSignal, splitProps } from 'solid-js';

import { IconButton } from '~/lib2/solid/button';
import { Input, type InputProps } from '~/lib2/solid/input';

export interface PasswordProps extends Omit<InputProps, 'type'> {
	showLabel?: string;
	hideLabel?: string;
}

/** Password (§13.7) — an `Input` with a show/hide toggle `IconButton`. */
export function Password(props: PasswordProps) {
	const [local, rest] = splitProps(props, ['class', 'showLabel', 'hideLabel']);
	const [visible, setVisible] = createSignal(false);
	return (
		<div class={cx('o-row', local.class)}>
			<Input {...rest} type={visible() ? 'text' : 'password'} />
			<IconButton
				type="button"
				aria-label={
					visible()
						? (local.hideLabel ?? 'Hide password')
						: (local.showLabel ?? 'Show password')
				}
				aria-pressed={visible() ? 'true' : 'false'}
				onClick={() => setVisible((value) => !value)}
			>
				{visible() ? '🙈' : '👁'}
			</IconButton>
		</div>
	);
}
