import { type JSX, splitProps } from 'solid-js';

import { dropdownCloseOnBlur } from '~/shared/components/callbacks/dropdown';
import { selectToggleObserve } from '~/shared/components/callbacks/select';
import { DropdownPopover } from '~/shared/components/dropdown';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

// Disallow ID, should be set via context
export interface SelectPopoverProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'id'> {}

export function SelectPopover(props: SelectPopoverProps) {
	const [local, rest] = splitProps(props, ['children']);

	return (
		<DropdownPopover
			// Dropdown width should match select input / button size
			fixedWidth
			{...rest}
			{...callbackAttrs(rest, dropdownCloseOnBlur, selectToggleObserve)}
		>
			{local.children}
		</DropdownPopover>
	);
}
