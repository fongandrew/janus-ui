import cx from 'classix';
import { Check } from 'lucide-solid';
import { createSignal, For, type JSX, splitProps } from 'solid-js';

import {
	LIST_OPTION_VALUE_ATTR,
	OptionList,
	OptionListGroup,
	OptionListItem,
} from '~/shared/components/option-list';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';
import { generateId } from '~/shared/utility/id-generator';
import { nextIndex } from '~/shared/utility/next-index';

export interface ListBoxProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
	/** Name for form submission */
	name?: string;
	/** Is listbox disabled? */
	disabled?: boolean;
	/** Currently selected values (controlled) */
	values?: Set<string>;
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string>;
	/** Called when selection changes */
	onChange?: (value: Set<string>) => void;
	/** Whether multiple selection is allowed */
	multiple?: boolean;
	/** Make children required */
	children: JSX.Element;
}

/** Selector for list box options */
const optionsSelector = '[role="option"]';

export function ListBox(props: ListBoxProps) {
	const [local, rest] = splitProps(props, [
		'children',
		'name',
		'disabled',
		'values',
		'onChange',
		'multiple',
	]);

	// Track the currently highlighted (not selected) option
	const [activeId, setActiveId] = createSignal<string | undefined>();

	// Track which items are selected
	const [values, setValues] = createSignal<Set<string>>(props.defaultValues ?? new Set());
	const getSelectedValues = () => props.values ?? values();

	let listBox: HTMLElement | null = null;
	const ref = (el: HTMLDivElement) => {
		listBox = el;
	};

	/** For matching user trying to type and match input */
	const matchText = createTextMatcher(() => listBox?.querySelectorAll(optionsSelector));

	const handleValueSelection = (value: string) => {
		const newValues = new Set(getSelectedValues());
		if (local.multiple) {
			if (newValues.has(value)) {
				newValues.delete(value);
			} else {
				newValues.add(value);
			}
		} else {
			const shouldAdd = !newValues.has(value);
			newValues.clear();
			if (shouldAdd) {
				newValues.add(value);
			}
		}
		local.onChange?.(newValues);
		setValues(newValues);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!listBox) return;

		const items = Array.from(listBox.querySelectorAll(optionsSelector)) as HTMLElement[];
		const currentId = activeId();
		const currentElement = currentId ? document.getElementById(currentId) : null;
		const currentIndex = currentElement ? items.indexOf(currentElement) : -1;

		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				const nextItem = items[nextIndex(items, currentIndex)];
				setActiveId(nextItem?.id);
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				const prevItem = items[nextIndex(items, currentIndex, -1)];
				setActiveId(prevItem?.id);
				break;
			}
			case 'Enter':
			case ' ': {
				event.preventDefault();
				const value = currentElement?.getAttribute(LIST_OPTION_VALUE_ATTR);
				if (!value) return;
				handleValueSelection(value);
				break;
			}
			default: {
				// If here, check if we're typing a character to filter the list
				if (event.key.length === 1) {
					const matchingId = matchText(event.key)?.id;
					if (matchingId) {
						setActiveId(matchingId);
					}
				}
			}
		}

		const onKeyDown = props.onKeyDown;
		if (typeof onKeyDown === 'function') {
			onKeyDown(
				event as KeyboardEvent & { currentTarget: HTMLDivElement; target: HTMLDivElement },
			);
		}
	};

	const handleClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		const option = target.closest(optionsSelector) as HTMLElement | null;
		if (option) {
			const value = option.getAttribute(LIST_OPTION_VALUE_ATTR);
			if (!value) return;
			handleValueSelection(value);
		}

		const onClick = props.onClick;
		if (typeof onClick === 'function') {
			onClick(
				event as MouseEvent & { currentTarget: HTMLDivElement; target: HTMLDivElement },
			);
		}
	};

	return (
		<OptionList
			{...rest}
			ref={ref}
			class={cx('c-list-box', rest.class)}
			role="listbox"
			tabIndex={0}
			activeId={activeId()}
			selectedValues={values()}
			aria-disabled={local.disabled}
			aria-multiselectable={local.multiple}
			aria-activedescendant={activeId()}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		>
			{local.children}
			{local.name && <ListBoxSelections name={local.name} values={values()} />}
		</OptionList>
	);
}

export interface ListBoxItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/**
	 * Option value for this prop -- if not set, will be autoassigned one for
	 * option list matching purposes
	 */
	value?: string;
}

/** A single list box item */
export function ListBoxItem(props: ListBoxItemProps) {
	return (
		<OptionListItem
			{...props}
			class={cx(props.class, 'c-list-box__item')}
			value={props.value ?? generateId('list-box-item')}
		>
			<div role="presentation" class="c-list-box__check-box">
				<Check />
			</div>
			{props.children}
		</OptionListItem>
	);
}

/** No need for any changes to this. Just alias for use with list boxes */
export { OptionListGroup as ListBoxGroup };

/** Returns a list of hidden inputs so option list selections can be sent to forms */
export function ListBoxSelections(props: { name: string; values: Set<string> }) {
	return (
		<>
			<For each={Array.from(props.values)}>
				{(value) => <input type="hidden" name={props.name} value={value} />}
			</For>
		</>
	);
}
