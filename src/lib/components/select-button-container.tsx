import cx from 'classix';
import { ChevronsUpDown, X } from 'lucide-solid';
import {
	type ComponentProps,
	createEffect,
	createSignal,
	createUniqueId,
	type JSX,
	splitProps,
} from 'solid-js';

import { Button } from '~/lib/components/button';
import {
	selectButtonKeyDown,
	selectClear,
	selectMountText,
	selectResetText,
	selectUpdateText,
} from '~/lib/components/callbacks/select';
import { Dropdown } from '~/lib/components/dropdown';
import {
	FormElementPropsProvider,
	FormElementResetProvider,
} from '~/lib/components/form-element-context';
import { SelectPopover } from '~/lib/components/select-popover';
import { SelectText } from '~/lib/components/select-text';
import { T } from '~/lib/components/t-components';
import { attrNoConflict } from '~/lib/utility/attribute';
import { attrs } from '~/lib/utility/attribute-list';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { combineRefs } from '~/lib/utility/solid/combine-refs';
import { useT } from '~/lib/utility/solid/locale-context';

export interface SelectButtonContainerProps extends ComponentProps<'div'> {
	/** Values (used only to trigger dynamic update) */
	values?: Set<string> | undefined;
	/** Show clear button? */
	clearable?: boolean | undefined;
	/** Is select input disabled? */
	disabled?: boolean | undefined;
	/** Is select input value invalid? */
	invalid?: boolean | undefined;
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
	/** Arbitrary data props */
	[key: `data-${string}`]: string | undefined;
}

export function SelectButtonContainer(props: SelectButtonContainerProps) {
	const t = useT();
	const [local, buttonProps, rest] = splitProps(
		props,
		['children', 'inputId', 'listId', 'placeholder', 'invalid', 'required', 'values'],
		[
			'aria-describedby',
			'aria-label',
			'aria-labelledby',
			'disabled',
			'aria-disabled',
			'data-testid',
		],
	);

	const selectRequiredId = createUniqueId();
	const selectUpdateTextId = createUniqueId();

	// Signals we'll use to "transfer" certain form element props from popover trigger
	// button to listbox / combobox inside popover
	const [required, setRequired] = createSignal<boolean | undefined>();
	const [invalid, setInvalid] = createSignal<boolean | undefined>();

	// Need to explicitly update placeholder text when values change since this isn't done
	// reactively via Solid
	let ref: HTMLElement | undefined;
	createEffect((prev: Set<string> | undefined) => {
		if (ref && prev !== props.values) {
			selectMountText.do.call(ref, ref, selectUpdateTextId);
		}
		return props.values;
	});

	return (
		<div
			{...rest}
			{...callbackAttrs(
				rest,
				selectMountText(selectUpdateTextId),
				selectUpdateText(selectUpdateTextId),
				selectResetText(selectUpdateTextId),
			)}
			ref={combineRefs(rest.ref, (el) => (ref = el))}
			class={cx('c-select__container', rest.class)}
		>
			<Dropdown>
				<FormElementPropsProvider
					required={(prev) => {
						setRequired(prev);
						return undefined;
					}}
					invalid={(prev) => {
						setInvalid(prev);
						return undefined;
					}}
				>
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
				</FormElementPropsProvider>
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
					(local.required || required()) && (
						<span id={selectRequiredId} class="t-sr-only">
							<T>(Required)</T>
						</span>
					)
				}
				<span class="c-select__chevron">
					<ChevronsUpDown />
				</span>
				{props.clearable && (
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
				)}
				<SelectPopover>
					<FormElementPropsProvider
						required={() => attrNoConflict(local.required, required())}
						invalid={() => attrNoConflict(local.invalid, invalid())}
					>
						{local.children}
					</FormElementPropsProvider>
				</SelectPopover>
			</Dropdown>
		</div>
	);
}
