import { type ComponentProps, splitProps } from 'solid-js';

import { dropdownCloseOnBlur } from '~/lib/components/callbacks/dropdown';
import { optionListScrollToHighlighted } from '~/lib/components/callbacks/option-list';
import { selectToggleObserve } from '~/lib/components/callbacks/select';
import { DropdownPopover } from '~/lib/components/dropdown';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

// Disallow ID, should be set via context
export interface SelectPopoverProps extends Omit<ComponentProps<'div'>, 'id'> {}

export function SelectPopover(props: SelectPopoverProps) {
	const [local, rest] = splitProps(props, ['children']);

	return (
		<DropdownPopover
			// Dropdown width should match select input / button size
			fixedWidth
			{...rest}
			{...callbackAttrs(
				rest,
				dropdownCloseOnBlur,
				selectToggleObserve,
				optionListScrollToHighlighted,
			)}
		>
			{local.children}
		</DropdownPopover>
	);
}
