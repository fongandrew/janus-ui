import cx from 'classix';
import { splitProps } from 'solid-js';

import { checkboxClick, checkboxEnter } from '~/shared/components/callbacks/checkbox';
import { toggleSwitchChange } from '~/shared/components/callbacks/toggle-switch';
import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export interface ToggleSwitchProps extends Omit<FormElementProps<'input'>, 'type'> {}

/**
 * Toggle switch component for binary on/off selection
 *
 * @example
 * ```tsx
 * // Basic toggle switch
 * 	<ToggleSwitch name="toggle" />
 *
 * // Pre-checked
 * 	<ToggleSwitch name="active" checked />
 *
 * // With event handlers
 * 	<ToggleSwitch
 * 		name="mode"
 * 		onChange={(e) => console.log('Toggle changed:', e.currentTarget.checked)}
 * />
 * ```
 */
export function ToggleSwitch(props: ToggleSwitchProps) {
	const [local, rest] = splitProps(props, ['class']);
	const formProps = mergeFormElementProps<'input'>(rest);

	return (
		<div class={cx('c-toggle-switch', local.class)} {...callbackAttrs(checkboxClick)}>
			<input
				type="checkbox"
				role="switch"
				aria-checked={props.checked}
				aria-readonly={props.readOnly}
				{...formProps}
				{...callbackAttrs(props, checkboxEnter, toggleSwitchChange)}
			/>
			<div class="c-toggle-switch__thumb" />
		</div>
	);
}
