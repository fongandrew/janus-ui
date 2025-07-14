import cx from 'classix';
import { CheckIcon, CircleIcon } from 'lucide-solid';
import { splitProps } from 'solid-js';

import { checkboxClick, checkboxEnter } from '~/lib/components/callbacks/checkbox';
import { TOGGLE_ICON_ATTR, toggleSwitchChange } from '~/lib/components/callbacks/toggle-switch';
import { type FormElementProps, mergeFormElementProps } from '~/lib/components/form-element-props';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

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
		<div
			class={cx('c-toggle-switch', local.class)}
			{...callbackAttrs(checkboxClick, toggleSwitchChange)}
		>
			<input
				type="checkbox"
				role="switch"
				aria-checked={props.checked}
				aria-readonly={props.readOnly}
				{...formProps}
				{...callbackAttrs(props, checkboxEnter)}
			/>
			<div class="c-toggle-switch__thumb">
				<CheckIcon
					{...{ [TOGGLE_ICON_ATTR]: 'on' }}
					class={cx(!props.checked && 't-hidden')}
				/>

				<CircleIcon
					{...{ [TOGGLE_ICON_ATTR]: 'off' }}
					class={cx(props.checked && 't-hidden')}
				/>
			</div>
		</div>
	);
}
