/** `Password` (§13.7) — `Input` plus a show/hide toggle. */

import { Eye, EyeOff } from 'lucide-solid';
import { createSignal } from 'solid-js';

import { IconButton } from '~/lib2/solid/button';
import { Input, type InputProps } from '~/lib2/solid/input';

export type PasswordProps = Omit<InputProps, 'type'>;

export function Password(props: PasswordProps) {
	const [show, setShow] = createSignal(false);
	return (
		<div class="o-row">
			<Input {...props} type={show() ? 'text' : 'password'} />
			<IconButton
				type="button"
				label={show() ? 'Hide password' : 'Show password'}
				onClick={() => setShow((prev) => !prev)}
			>
				{show() ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
			</IconButton>
		</div>
	);
}
