import { flip, offset, shift, size } from '@floating-ui/dom';
import cx from 'classix';
import { createMemo, createSignal, type JSX, splitProps } from 'solid-js';

import { createDropdown } from '~/shared/components/create-dropdown';
import { ListBox } from '~/shared/components/list-box';
import { LIST_OPTION_VALUE_ATTR } from '~/shared/components/option-list';
import { SelectButton } from '~/shared/components/select-button';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';
import { createTappedRefSignal } from '~/shared/utility/solid/create-tapped-ref-signal';

export interface SelectProps
	extends Omit<JSX.IntrinsicAttributes, 'ref'>,
		Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
	/** Ref must be callback */
	ref?: (element: HTMLButtonElement) => void;
	/** Name for form submission */
	name?: string;
	/** Placeholder text when no selection */
	placeholder?: string;
	/** Currently selected values (controlled) */
	values?: Set<string>;
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string>;
	/** Called when selection changes */
	onChange?: (event: MouseEvent | KeyboardEvent, value: Set<string>) => void;
	/** Whether multiple selection is allowed */
	multiple?: boolean;
	/** Disables clearing selection */
	required?: boolean;
	/** Make children required */
	children: JSX.Element;
}

export function Select(props: SelectProps) {
	const [listBoxProps, rest] = splitProps(props, [
		'name',
		'values',
		'defaultValues',
		'onChange',
		'multiple',
		'required',
		'aria-invalid',
		'children',
	]);
	const [local, buttonProps] = splitProps(rest, ['placeholder']);

	// Refs to trigger and dropdown
	const [setTrigger, setContentBase] = createDropdown([
		offset(4),
		size({
			apply({ rects, elements }) {
				Object.assign(elements.floating.style, {
					minWidth: `${rects.reference.width}px`,
				});
			},
		}),
		flip(),
		shift({ padding: 4 }),
	]);
	const [content, setContent] = createTappedRefSignal(setContentBase);

	// Reference to last change value (used for uncontrolled mode only)
	const [uncontrolledValues, setUncontrolledValues] = createSignal<Set<string> | undefined>(
		props.defaultValues,
	);

	const values = () => props.values ?? uncontrolledValues();

	const handleChange = (event: MouseEvent | KeyboardEvent, values: Set<string>) => {
		setUncontrolledValues(values);
		props.onChange?.(event, values);
		if (!props.multiple) {
			content()?.hidePopover();
		}
	};

	const handleClear = (event: MouseEvent | KeyboardEvent) => {
		handleChange(event, new Set());
	};

	// Generate content of trigger
	const isMounted = createMountedSignal();
	const selectionText = createMemo(() => {
		if (!isMounted()) return;

		const contentElm = content();
		if (!contentElm) return;

		const valuesSet = values();
		if (valuesSet?.size === 1) {
			for (const value of valuesSet) {
				const textContent = contentElm.querySelector(
					`[${LIST_OPTION_VALUE_ATTR}="${value}"]`,
				)?.textContent;
				if (textContent) {
					return <>{textContent}</>;
				}
			}
		}

		if (valuesSet && (valuesSet.size ?? 0) > 1) {
			return <span>{valuesSet.size} selected</span>;
		}

		return <span class="c-select__placeholder">{local.placeholder}</span>;
	});

	const showClear = createMemo(() => {
		if (listBoxProps.required) return false;
		const size = values()?.size;
		return size && size > 0;
	});

	return (
		<>
			<SelectButton
				{...buttonProps}
				ref={combineRefs(setTrigger, props.ref)}
				aria-invalid={props['aria-invalid']}
				onClear={showClear() ? handleClear : undefined}
			>
				{selectionText()}
			</SelectButton>
			<ListBox
				{...listBoxProps}
				ref={setContent}
				class={cx('c-dropdown', props.class)}
				onChange={handleChange}
				// ListBox must be in controlled state for Select to clear
				values={values() ?? new Set()}
				// Don't allow toggling to clear selection if single (this maps
				// to how a native select works -- we'll use the clear button
				// to chandle this instead)
				required={listBoxProps.required || !listBoxProps.multiple}
				autofocus
			/>
		</>
	);
}
