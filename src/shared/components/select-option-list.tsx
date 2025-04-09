import { children, createUniqueId, For, type JSX, mergeProps, splitProps } from 'solid-js';

import { listBoxChange, listBoxMount, listBoxReset } from '~/shared/components/callbacks/list-box';
import {
	SELECT_HIDDEN_CONTAINER_ATTR,
	SELECT_VISIBLE_CONTAINER_ATTR,
	selectCloseOnClick,
	selectToggleObserve,
} from '~/shared/components/callbacks/select';
import { DropdownContent, DropdownPopover } from '~/shared/components/dropdown';
import { ListBoxContext } from '~/shared/components/list-box';
import { OptionList } from '~/shared/components/option-list';
import { Placeholder } from '~/shared/components/placeholder';
import { T } from '~/shared/components/t-components';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { emptyAttr } from '~/shared/utility/empty-attr';

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
		['children', 'listBoxId', 'selectInputTextId', 'input', 'busy'],
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

	let resolver: (() => JSX.Element) | undefined;

	return (
		<DropdownPopover
			class="c-select__popover"
			// Dropdown width should match select input / button size
			fixedWidth
			{...rest}
			{...callbackAttrs(rest, selectToggleObserve)}
		>
			<DropdownContent>
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
						{(() => {
							// Call children here so context is set properly
							resolver = children(() => local.children);
							return null;
						})()}
						<div
							id={visibleInputContainerId}
							class="c-select__items"
							{...{ [SELECT_VISIBLE_CONTAINER_ATTR]: '' }}
							{...emptyAttr(resolver())}
						>
							{resolver()}
						</div>
						<div
							id={hiddenInputContainerId}
							class="t-hidden"
							{...{
								[SELECT_HIDDEN_CONTAINER_ATTR]: '',
							}}
						>
							<For each={Array.from(initialValues ?? [])}>
								{(value) => (
									<input type="hidden" name={context.name} value={value} />
								)}
							</For>
						</div>
					</OptionList>
				</ListBoxContext.Provider>
				<div role="status" class="c-select__status">
					<span class="c-select__no_match">
						<T>
							No matches found for{' '}
							<strong
								id={local.selectInputTextId}
								class="c-select__no_match_value"
								{...emptyAttr(local.input?.trim())}
							>
								{local.input?.trim()}
							</strong>
						</T>
					</span>
					<span class="c-select__no_value">
						<T>Type something</T>
					</span>
					<div class="c-select__busy">
						<span class="t-sr-only">
							<T>Loading…</T>
						</span>
						<Placeholder />
						<Placeholder width="80%" />
						<Placeholder width="90%" />
					</div>
				</div>
			</DropdownContent>
		</DropdownPopover>
	);
}
