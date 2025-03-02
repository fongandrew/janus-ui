import { type Placement } from '@floating-ui/dom';
import cx from 'classix';
import { createMemo, type JSX, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import { GhostButton } from '~/shared/components/button';
import { dropdownBeforeToggle, dropdownClose } from '~/shared/handlers/dropdown';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { T } from '~/shared/utility/text/t-components';
import { type RequiredNonNullable } from '~/shared/utility/type-helpers';

export interface DropdownContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ID required to open */
	id: string;
	/** Make children required */
	children: JSX.Element;
}

/** Props passed to trigger render func */
export type TriggerRenderProps = RequiredNonNullable<
	Pick<
		JSX.ButtonHTMLAttributes<HTMLButtonElement>,
		'id' | 'aria-expanded' | 'aria-haspopup' | 'popoverTarget' | 'popoverTargetAction'
	>
>;

/** Props to pass to popover render func */
export type PopoverRenderProps = RequiredNonNullable<
	Pick<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'id' | 'popover' | 'aria-labelledby'>
>;

export interface DropdownProps {
	/** Fixed width dropdown (vs expanding to fill available space up to some CSS max) */
	fixedWidth?: boolean | undefined;
	/** Offset for dropdown */
	offset?: number | undefined;
	/** Placement of dropdown */
	placement?: Placement | undefined;
	/** Trigger ID (set here instead of on button so elements can reference each other) */
	triggerId?: string | undefined;
	/** Popover ID (set here instead of on popover so elements can reference each other) */
	popoverId?: string | undefined;
	/** Two children required -- trigger and popover render funcs */
	children: [
		(triggerProps: TriggerRenderProps) => JSX.Element,
		(renderProps: PopoverRenderProps) => JSX.Element,
	];
}

/** A wrapper component that applies Dropdown styling and connects to `createDropdown` */
export function DropdownContent(props: DropdownContentProps) {
	const [local, rest] = splitProps(props, ['children']);
	return (
		<div {...rest} class={cx('c-dropdown__content', rest.class)} popover>
			<div class="c-dropdown__children">{local.children}</div>
			<div class="c-dropdown__footer">
				<GhostButton
					class="v-input-sm"
					unsetFormInput
					{...handlerProps(props, dropdownClose)}
				>
					<T>Close</T>
				</GhostButton>
			</div>
		</div>
	);
}

/** The wrapper component that creates IDs and ties things together */
export function Dropdown(props: DropdownProps) {
	const triggerId = createMemo(() => props.triggerId ?? createUniqueId());
	const popoverId = createMemo(() => props.popoverId ?? createUniqueId());
	const triggerProps = createMemo(() => ({
		id: triggerId(),
		'aria-expanded': false,
		'aria-haspopup': 'menu' as const,
		popoverTarget: popoverId(),
		// popovertargetaction is "toggle" by default. Set exlicit show or else other handlers
		// (like select) which may do an explicit show right before that will transform this
		// into a hide action. Rely on `esc` + light dismiss to hide instead.
		popoverTargetAction: 'show' as const,
		[dropdownBeforeToggle.FIXED_WIDTH_ATTR]: props.fixedWidth,
		[dropdownBeforeToggle.OFFSET_ATTR]: props.offset,
		[dropdownBeforeToggle.PLACEMENT_ATTR]: props.placement,
	}));
	const popoverProps = createMemo(() => ({
		id: popoverId(),
		popover: 'auto' as const,
		'aria-labelledby': triggerId(),
		...handlerProps(dropdownBeforeToggle),
	}));
	return (
		<>
			{props.children[0](triggerProps())}
			{props.children[1](popoverProps())}
		</>
	);
}
