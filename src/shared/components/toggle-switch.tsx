import cx from 'classix';
import { splitProps } from 'solid-js';

import { toggleSwitchChange, toggleSwitchEnter } from '~/shared/components/callbacks/toggle-switch';
import { handleClick } from '~/shared/components/checkbox';
import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export interface ToggleSwitchProps extends Omit<FormElementProps<'input'>, 'type'> {}

export function ToggleSwitch(props: ToggleSwitchProps) {
	const [local, rest] = splitProps(props, ['class']);
	const formProps = mergeFormElementProps<'input'>(rest);

	return (
		<div class={cx('c-toggle-switch', local.class)} onClick={handleClick}>
			<input
				type="checkbox"
				role="switch"
				aria-checked={props.checked}
				aria-readonly={props.readOnly}
				{...formProps}
				{...callbackAttrs(props, toggleSwitchChange, toggleSwitchEnter)}
			/>
			<div class="c-toggle-switch__thumb" />
		</div>
	);
}
