import { type Placement } from '@floating-ui/dom';
import cx from 'classix';
import { createContext, type JSX, splitProps, useContext } from 'solid-js';

import { GhostButton } from '~/shared/components/button';
import {
	dropdownBeforeToggleOpen,
	dropdownClose,
	dropdownToggleClosed,
} from '~/shared/components/callbacks/dropdown';
import {
	FormElementButtonPropsProvider,
	FormElementResetProvider,
} from '~/shared/components/form-element-context';
import { T } from '~/shared/components/t-components';
import { attrs } from '~/shared/utility/attribute-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { createAuto } from '~/shared/utility/solid/auto-prop';

// Omit the `id` attribute from the HTMLDivElement interface because it should be assigned
// via context
export interface DropdownPopoverProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'id'> {
	/** Fixed width dropdown (vs expanding to fill available space up to some CSS max) */
	fixedWidth?: boolean | undefined;
	/** Placement of dropdown */
	placement?: Placement | undefined;
	/** Make children required */
	children: JSX.Element;
}

export interface DropdownProps {
	/** Trigger ID (set here instead of on button so elements can reference each other) */
	triggerId?: string | undefined;
	/** Popover ID (set here instead of on popover so elements can reference each other) */
	popoverId?: string | undefined;
	/**
	 * Make children required -- should be two (trigger + popover) but a bit awkward
	 * to type that since we can have intervening components rendering both
	 */
	children: JSX.Element;
}

export const DropdownContext = createContext<{
	triggerId: () => string;
	popoverId: () => string;
}>();

/** A wrapper component for the popover element that connects to `DropdownContext` */
export function DropdownPopover(props: DropdownPopoverProps) {
	const context = useContext(DropdownContext);
	const [local, rest] = splitProps(props, ['children']);

	// Reset to prevent dropdown trigger props from flowing down into dropdown content
	return (
		<FormElementResetProvider>
			<div
				{...rest}
				{...callbackAttrs(
					rest,
					dropdownBeforeToggleOpen(props.placement, props.fixedWidth ? 'fw' : undefined),
					dropdownToggleClosed,
				)}
				id={context?.popoverId()}
				class={cx('c-dropdown__popover', rest.class)}
				aria-labelledby={attrs(context?.triggerId(), rest['aria-labelledby'])}
				popover="auto"
			>
				{local.children}
			</div>
		</FormElementResetProvider>
	);
}

/** Component with actual Dropdown styling */
export function DropdownContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ['children']);
	return (
		<div {...rest} class={cx('c-dropdown__content', rest.class)}>
			<div class="c-dropdown__children">{local.children}</div>
			<div class="c-dropdown__footer">
				<GhostButton class="v-input-sm" {...callbackAttrs(props, dropdownClose)}>
					<T>Close</T>
				</GhostButton>
			</div>
		</div>
	);
}

/** The wrapper component that creates IDs and ties things together */
export function Dropdown(props: DropdownProps) {
	const triggerId = createAuto(props, 'triggerId');
	const popoverId = createAuto(props, 'popoverId');
	return (
		<DropdownContext.Provider value={{ triggerId, popoverId }}>
			<FormElementButtonPropsProvider
				id={triggerId}
				aria-expanded={() => false}
				aria-haspopup={() => 'menu'}
				popoverTarget={popoverId}
				popoverTargetAction={() => 'show'}
				// Native HTML popovers should work without JS
				noJSDisabled={() => false}
			>
				{props.children}
			</FormElementButtonPropsProvider>
		</DropdownContext.Provider>
	);
}
