import { flip, offset, shift, size } from '@floating-ui/dom';
import cx from 'classix';
import { ChevronsUpDown } from 'lucide-solid';
import { createMemo, createSignal, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import { createDropdown } from '~/shared/components/create-dropdown';
import { ListBox, type ListBoxProps } from '~/shared/components/list-box';
import { LIST_OPTION_VALUE_ATTR } from '~/shared/components/option-list';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';
import { createTappedRefSignal } from '~/shared/utility/solid/create-tapped-ref-signal';

export interface SelectProps extends Omit<ListBoxProps, 'ref'> {
	/** Placeholder text when no selection */
	placeholder?: string;
}

export function Select(props: SelectProps) {
	const [local, listBoxProps] = splitProps(props, ['placeholder', 'class']);

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
	const handleChange = (event: MouseEvent | KeyboardEvent, values: Set<string>) => {
		setUncontrolledValues(values);
		props.onChange?.(event, values);
		if (!props.multiple) {
			content()?.hidePopover();
		}
	};
	const values = () => props.values ?? uncontrolledValues();

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

	return (
		<>
			<Button ref={setTrigger} disabled={props.disabled} class={cx('c-select', props.class)}>
				<span class="flex-1 justify-start text-left">{selectionText()}</span>
				<ChevronsUpDown class="shrink-0 grow-0" />
			</Button>
			<ListBox
				{...listBoxProps}
				ref={setContent}
				class={cx('c-dropdown', props.class)}
				onChange={handleChange}
				autofocus
			/>
		</>
	);
}
