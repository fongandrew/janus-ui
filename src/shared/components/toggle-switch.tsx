import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { mergeFormControlProps } from '~/shared/components/merge-form-control-props';

export interface ToggleSwitchProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	/** Force callback ref */
	ref?: (el: HTMLInputElement) => void;
}

export function ToggleSwitch(props: ToggleSwitchProps) {
	const [local, rest] = splitProps(props, ['class']);
	const formProps = mergeFormControlProps(rest);

	// Enter conflicts with form submit but toggle generally isn't used in forms
	// and treated more like a button
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			(event.target as HTMLInputElement)?.toggleAttribute('checked');
		}
	};

	return (
		<div class={cx('c-toggle-switch', local.class)}>
			<input
				type="checkbox"
				role="switch"
				aria-checked={props.checked}
				aria-readonly={props.readOnly}
				onKeyDown={handleKeyDown}
				{...formProps}
			/>
			<div class="c-toggle-switch__thumb" />
		</div>
	);
}
