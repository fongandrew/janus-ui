import { type JSX, splitProps } from 'solid-js';

import { DropdownContent } from '~/shared/components/dropdown';
import { ListBoxSelections } from '~/shared/components/list-box';
import { OptionList } from '~/shared/components/option-list';
import { type OptionListControl } from '~/shared/components/option-list-control';
import { T } from '~/shared/utility/text/t-components';

export interface SelectOptionListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ListBox control */
	listCtrl?: OptionListControl;
	/** Form input name */
	name?: string | undefined;
	/** Current input value, if any */
	input?: string | undefined;
	/** Currently selected values */
	values?: Set<string>;
}

export function SelectOptionList(props: SelectOptionListProps) {
	// const getRefs = useContext(RefContext);
	const [local, rest] = splitProps(props, ['children', 'input', 'listCtrl', 'name', 'values']);
	return (
		<DropdownContent {...rest}>
			<OptionList role="listbox" {...local.listCtrl?.merge()}>
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
			{local.name && local.values && (
				<ListBoxSelections name={local.name} values={local.values} />
			)}
		</DropdownContent>
	);
}
