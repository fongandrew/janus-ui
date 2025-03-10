import { createUniqueId, type JSX, mergeProps, splitProps } from 'solid-js';

import { listBoxChange } from '~/shared/callback-attrs/list-box';
import { selectCloseOnClick, selectUpdateWithInput } from '~/shared/callback-attrs/select';
import { DropdownContent } from '~/shared/components/dropdown';
import { ListBoxContext } from '~/shared/components/list-box';
import { OptionList } from '~/shared/components/option-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { T } from '~/shared/utility/text/t-components';

// Disallow ID, should be set via context
export interface SelectOptionListProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'id'> {
	/** Separate listbox ID for `aria-controls` on combobox */
	listBoxId?: string | undefined;
	/** Form input name */
	name?: string | undefined;
	/** Currently selected values */
	values?: Set<string> | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
	/** Current (or initial, can be updated via `selectUpdateWithInput`) input value, if any */
	input?: string | undefined;
}

export function SelectOptionList(props: SelectOptionListProps) {
	const [local, listBoxContextProps, rest] = splitProps(
		props,
		['children', 'listBoxId', 'input'],
		['name', 'values', 'multiple'],
	);

	// Create default name for radio group if not provided
	const context = mergeProps({ name: createUniqueId() }, listBoxContextProps);

	return (
		<DropdownContent {...rest}>
			<ListBoxContext.Provider value={context}>
				<OptionList
					role="listbox"
					id={local.listBoxId}
					class="t-unstyled"
					{...callbackAttrs(listBoxChange, selectCloseOnClick)}
				>
					{local.children}
					<div class="c-select__empty_state">
						<span class="c-select__no_match">
							<T>
								No matches found for{' '}
								<strong {...{ [selectUpdateWithInput.TEXT_ATTR]: '' }}>
									{local.input?.trim()}
								</strong>
							</T>
						</span>
						<span class="c-select__no_value">
							<T>Type something</T>
						</span>
					</div>
				</OptionList>
			</ListBoxContext.Provider>
		</DropdownContent>
	);
}
