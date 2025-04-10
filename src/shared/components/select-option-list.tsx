import cx from 'classix';
import { children, createUniqueId, For, type JSX, splitProps } from 'solid-js';

import {
	SELECT_HIDDEN_CONTAINER_ATTR,
	SELECT_VISIBLE_CONTAINER_ATTR,
	selectCloseOnClick,
} from '~/shared/components/callbacks/select';
import { DropdownContent } from '~/shared/components/dropdown';
import { ListBox, type ListBoxProps } from '~/shared/components/list-box';
import { Placeholder } from '~/shared/components/placeholder';
import { T } from '~/shared/components/t-components';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { VALIDATE_ATTR } from '~/shared/utility/callback-attrs/validate';
import { emptyAttr } from '~/shared/utility/empty-attr';
import { createAuto } from '~/shared/utility/solid/auto-prop';

// Disallow ID, should be set via context
export interface SelectOptionListProps extends Omit<ListBoxProps, 'children' | 'id'> {
	/** Separate listbox ID for `aria-controls` on combobox */
	listBoxId?: string | undefined;
	/** Are async results loading? */
	busy?: boolean | undefined;
	/**
	 * Separate ID for "no matches found" element. If not set, we assume there's no
	 * loading state and we can hide the status section
	 */
	selectInputTextId?: string | undefined;
	/** Make children optional since we can populated with hidden elements and stuff */
	children?: JSX.Element | undefined;
}

export function SelectOptionList(props: SelectOptionListProps) {
	const [local, listBoxProps, rest] = splitProps(
		props,
		['children', 'listBoxId', 'selectInputTextId', 'busy'],
		[
			'autofocus',
			'name',
			'tabIndex',
			'values',
			'onValues',
			'onValidate',
			'multiple',
			'required',
			VALIDATE_ATTR,
		],
	);

	// IDs for visible + hidden input containers. When content of visible input container
	// changes, we update hidden input to reflect any items that are still selected but
	// no longer visible.
	const visibleInputContainerId = createUniqueId();
	const hiddenInputContainerId = createUniqueId();

	// Default name if not provided
	const name = createAuto(listBoxProps, 'name');

	// Track rendered items for initial hidden list rendering
	const rendered = new Set<string>();

	// Unreactive access -- the values may change but we'll rely on callback attrs to
	// manually update this rather than Solid. But we do need initially rendered values
	// for first pass with the Solid renderer.
	// eslint-disable-next-line solid/reactivity
	const initialValues = listBoxProps.values;

	let resolver: (() => JSX.Element) | undefined;

	return (
		<DropdownContent {...rest} class={cx('c-select__dropdown', rest.class)}>
			<ListBox
				id={local.listBoxId}
				{...listBoxProps}
				{...callbackAttrs(listBoxProps, selectCloseOnClick)}
				name={name()}
				rendered={rendered}
				aria-busy={local.busy}
				unstyled
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
						{(value) =>
							rendered.has(value) ? null : (
								<input type="hidden" name={name()} value={value} />
							)
						}
					</For>
				</div>
			</ListBox>
			{props.selectInputTextId ? (
				<div role="status" class="c-select__status">
					<span class="c-select__no_match">
						<T>
							No matches found for{' '}
							<strong
								id={local.selectInputTextId}
								class="c-select__no_match_value"
								{...emptyAttr()}
							/>
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
			) : null}
		</DropdownContent>
	);
}
