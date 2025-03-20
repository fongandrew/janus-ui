import { createUniqueId, For, type JSX, mergeProps, splitProps } from 'solid-js';

import { listBoxChange, listBoxMount, listBoxReset } from '~/shared/components/callbacks/list-box';
import {
	SELECT_HIDDEN_CONTAINER_ATTR,
	SELECT_VISIBLE_CONTAINER_ATTR,
	selectCloseOnClick,
	selectToggleObserve,
} from '~/shared/components/callbacks/select';
import { DropdownContent } from '~/shared/components/dropdown';
import { ListBoxContext } from '~/shared/components/list-box';
import { OptionList } from '~/shared/components/option-list';
import { Spinner } from '~/shared/components/spinner';
import { T } from '~/shared/components/t-components';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

// Disallow ID, should be set via context
export interface SelectOptionListProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'id'> {
	/** Separate listbox ID for `aria-controls` on combobox */
	listBoxId?: string | undefined;
	/** Are async results loading? */
	busy?: boolean | undefined;
	/** Separate ID for "no matches found" element */
	selectInputTextId: string;
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
		['children', 'listBoxId', 'input', 'busy'],
		['name', 'values', 'multiple'],
	);

	// IDs for visible + hidden input containers. When content of visible input container
	// changes, we update hidden input to reflect any items that are still selected but
	// no longer visible.
	const visibleInputContainerId = createUniqueId();
	const hiddenInputContainerId = createUniqueId();

	// Create default name for radio group if not provided
	const context = mergeProps(
		{ name: createUniqueId(), rendered: new Set<string>() },
		listBoxContextProps,
	);

	// eslint-disable-next-line solid/reactivity
	const initialValues = listBoxContextProps.values;

	return (
		<DropdownContent
			// Dropdown width should match select input / button size
			fixedWidth
			// Selects have a focus ring so give a bit more space than
			// normal dropdowns
			offset={8}
			{...rest}
			{...callbackAttrs(rest, selectToggleObserve)}
		>
			<ListBoxContext.Provider value={context}>
				<OptionList
					role="listbox"
					id={local.listBoxId}
					class="t-unstyled"
					aria-busy={local.busy}
					{...callbackAttrs(
						listBoxChange,
						listBoxMount,
						listBoxReset,
						selectCloseOnClick,
					)}
				>
					<div
						id={visibleInputContainerId}
						class="c-select__items"
						{...{ [SELECT_VISIBLE_CONTAINER_ATTR]: '' }}
					>
						{local.children}
					</div>
					<div
						id={hiddenInputContainerId}
						class="t-hidden"
						{...{
							[SELECT_HIDDEN_CONTAINER_ATTR]: '',
						}}
					>
						<For each={Array.from(initialValues ?? [])}>
							{(value) => <input type="hidden" name={context.name} value={value} />}
						</For>
					</div>
				</OptionList>
			</ListBoxContext.Provider>
			<div role="status" class="c-select__status">
				<span class="c-select__no_match">
					<T>
						No matches found for{' '}
						<strong id={props.selectInputTextId} class="c-select__no_match_value">
							{local.input?.trim()}
						</strong>
					</T>
				</span>
				<span class="c-select__no_value">
					<T>Type something</T>
				</span>
				<div class="c-select__busy">
					<Spinner />
					<span>
						<T>Loading…</T>
					</span>
				</div>
			</div>
		</DropdownContent>
	);
}
