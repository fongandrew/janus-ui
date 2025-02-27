import { createMemo, type JSX, splitProps } from 'solid-js';

import { DropdownContent } from '~/shared/components/dropdown';
import { OptionList } from '~/shared/components/option-list';
import { type OptionListControl } from '~/shared/components/option-list-control';
import { T } from '~/shared/utility/text/t-components';

export interface SelectOptionListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ListBox control */
	listCtrl: OptionListControl;
	/** Form input name */
	name?: string | undefined;
	/** Current input value, if any */
	input?: string | undefined;
	/** Currently selected values */
	values?: Set<string>;
}

export function SelectOptionList(props: SelectOptionListProps) {
	const [local, rest] = splitProps(props, ['children', 'input', 'listCtrl', 'name', 'values']);
	const optionListProps = createMemo(() => local.listCtrl.merge({ class: 't-unstyled' }));
	return (
		<DropdownContent {...rest}>
			<OptionList role="listbox" {...optionListProps()}>
				{local.children}
				<div class="c-select__empty_state">
					{props.input?.trim() ? (
						<T>
							No matches found for <strong>{local.input}</strong>
						</T>
					) : (
						<T>Type something</T>
					)}
				</div>
			</OptionList>
		</DropdownContent>
	);
}
