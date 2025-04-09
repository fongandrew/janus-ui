import { type JSX, splitProps } from 'solid-js';

import { selectToggleObserve } from '~/shared/components/callbacks/select';
import { DropdownPopover } from '~/shared/components/dropdown';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

// Disallow ID, should be set via context
export interface SelectPopoverProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'id'> {}

export function SelectPopover(props: SelectPopoverProps) {
	const [local, rest] = splitProps(props, ['children']);

	return (
		<DropdownPopover
			class="c-select__popover"
			// Dropdown width should match select input / button size
			fixedWidth
			{...rest}
			{...callbackAttrs(rest, selectToggleObserve)}
		>
			{local.children}
		</DropdownPopover>
	);
}
