import '~/shared/components/toggle-switch.css';

import cx from 'classix';
import { splitProps } from 'solid-js';

import { handleClick } from '~/shared/components/checkbox';
import { mergeFormElementProps } from '~/shared/components/form-element-props';

export interface ToggleSwitchProps extends Omit<FormElementProps<'input'>, 'type'> {}

export function ToggleSwitch(props: ToggleSwitchProps) {
	const [local, rest] = splitProps(props, ['class']);
	const formProps = mergeFormElementProps<'input'>(rest);

	// Enter conflicts with form submit but toggle generally isn't used in forms
	// and treated more like a button
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			(event.target as HTMLInputElement)?.toggleAttribute('checked');
		}
	};

	return (
		<div class={cx('c-toggle-switch', local.class)} onClick={handleClick}>
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
