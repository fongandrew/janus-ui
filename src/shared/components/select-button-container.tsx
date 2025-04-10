import cx from 'classix';
import { ChevronsUpDown, X } from 'lucide-solid';
import { createUniqueId, type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	selectButtonKeyDown,
	selectClear,
	selectMountText,
	selectResetText,
	selectUpdateText,
} from '~/shared/components/callbacks/select';
import { Dropdown } from '~/shared/components/dropdown';
import { FormElementResetProvider } from '~/shared/components/form-element-context';
import { SelectPopover } from '~/shared/components/select-popover';
import { SelectText } from '~/shared/components/select-text';
import { T } from '~/shared/components/t-components';
import { attrs } from '~/shared/utility/attribute-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { useT } from '~/shared/utility/solid/locale-context';

export interface SelectButtonContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Is select input disabled? */
	disabled?: boolean | undefined;
	/** Is select input required? */
	required?: boolean | undefined;
	/** Placeholder text inside button */
	placeholder?: string | undefined;
	/** Input ID, if any */
	inputId?: string | undefined;
	/** ListBox ID, if any */
	listId?: string | undefined;
	/** Make children required */
	children: JSX.Element;
}

export function SelectButtonContainer(props: SelectButtonContainerProps) {
	const t = useT();
	const [local, buttonProps, rest] = splitProps(
		props,
		['children', 'inputId', 'listId', 'placeholder', 'required', 'aria-required'],
		['aria-describedby', 'aria-label', 'aria-labelledby', 'disabled', 'aria-disabled'],
	);

	const selectRequiredId = createUniqueId();
	const selectUpdateTextId = createUniqueId();

	return (
		<div
			{...rest}
			{...callbackAttrs(
				rest,
				selectMountText(selectUpdateTextId),
				selectUpdateText(selectUpdateTextId),
				selectResetText(selectUpdateTextId),
			)}
			class={cx('c-select__container', rest.class)}
		>
			<Dropdown>
				<Button
					aria-haspopup="listbox"
					{...buttonProps}
					{...callbackAttrs(buttonProps, selectButtonKeyDown)}
					class={cx('c-select__button', props.class)}
					aria-describedby={attrs(
						buttonProps['aria-describedby'],
						(props.required || props['aria-required']) && selectRequiredId,
					)}
					unstyled
				>
					<SelectText id={selectUpdateTextId} placeholder={local.placeholder} />
				</Button>
				{
					/*
					Mark required state with extra descriptive text because it's
					sort of semantically incorrect to use aria-required on what's
					just the popover trigger but user might not see the required
					state on other elements (in this case, it's on the listbox --
					it could also be on the combobox input but it's also a bit weird
					to put it there since the input itself is just a search box
					and you don't have to "require" input in that).

					For error state, this should be also associated with the button
					using aria-describedby somehow (the one in LabelledInput works
					well for this).
				*/
					(local.required || local['aria-required']) && (
						<span id={selectRequiredId} class="t-sr-only">
							<T>(Required)</T>
						</span>
					)
				}
				<span class="c-select__chevron">
					<ChevronsUpDown />
				</span>
				<FormElementResetProvider>
					<Button
						class="c-select__clear"
						aria-controls={[local.listId, local.inputId].join(' ')}
						aria-label={t`Clear Selection`}
						unstyled
						{...callbackAttrs(selectClear)}
					>
						<X />
					</Button>
				</FormElementResetProvider>
				<SelectPopover>{local.children}</SelectPopover>
			</Dropdown>
		</div>
	);
}
