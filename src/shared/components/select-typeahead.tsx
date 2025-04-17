import { createMemo, createUniqueId, splitProps } from 'solid-js';

import {
	selectInputKeyDown,
	selectLabelClick,
	selectUpdateWithInput,
} from '~/shared/components/callbacks/select';
import {
	createFormElementId,
	FormElementPropsContext,
	FormElementResetProvider,
} from '~/shared/components/form-element-context';
import { type FormElementProps } from '~/shared/components/form-element-props';
import { Input, type InputProps } from '~/shared/components/input';
import { type ListBoxProps } from '~/shared/components/list-box';
import { SelectButtonContainer } from '~/shared/components/select-button-container';
import { SelectOptionList } from '~/shared/components/select-option-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { VALIDATE_ATTR } from '~/shared/utility/callback-attrs/validate';
import { useSingleProp } from '~/shared/utility/solid/prop-mod-context';

export type SelectTypeaheadProps = Omit<FormElementProps<'div'>, 'onInput' | 'onValidate'> &
	Pick<ListBoxProps, 'name' | 'multiple' | 'values' | 'onChange' | 'onValues' | 'onValidate'> & {
		/** Placeholder text when no selection */
		placeholder?: string | undefined;
		/** Signal that async typeahead is busy */
		busy?: boolean | undefined;
		/** Input handler, tied to typing */
		onInput?: InputProps['onInput'] | undefined;
		/** Called when typing happens */
		onValueInput?: ((value: string, event: Event) => void) | undefined;
	};

/**
 * Typeahead select component allowing search with keyboard input
 *
 * @example
 * ```tsx
 * // Basic single selection typeahead
 * const [values, setValues] = createSignal<Set<string>>(new Set());
 * const [results, setResults] = createSignal([]);
 * const [busy, setBusy] = createSignal(false);
 *
 * // See `src/shared/utility/create-query-effect`
 * const queryFn = createQueryEffect(async (query) => {
 * 		setBusy(true);
 * 		try {
 * 			const results = await someApiFetch(query)
 * 			setResults(results);
 * 		} finally {
 * 			setBusy(false);
 * 		}
 * }));
 *
 * 	<SelectTypeahead
 * 		name="colors"
 * 		busy={busy()}
 * 		placeholder="Select a color..."
 * 		values={values()}
 * 		onValues={setValues}
 * 		onValueInput={(input) => queryFn(input)}
 * 	>
 * 		<For each={results()}>
 * 			{(color) => <ListBoxItem value={color.value}>{color.label}</ListBoxItem>}
 * 		</For>
 * 	</SelectTypeahead>
 * ```
 */
export function SelectTypeahead(props: SelectTypeaheadProps) {
	const [inputProps, optionListProps, rest] = splitProps(
		props,
		['invalid', 'aria-invalid', 'onInput', 'onValueInput', 'placeholder'],
		[
			'children',
			'name',
			'multiple',
			'values',
			'onChange',
			'onValues',
			'onValidate',
			VALIDATE_ATTR,
		],
	);

	const id = createFormElementId(props);
	const listId = createUniqueId();
	const selectInputTextId = createUniqueId();

	const invalid = createMemo(() => {
		const prevInvalid = useSingleProp(FormElementPropsContext, 'invalid');
		return prevInvalid || inputProps.invalid;
	});

	return (
		<SelectButtonContainer
			listId={listId}
			inputId={id()}
			aria-busy={props.busy}
			aria-haspopup="dialog"
			aria-invalid={inputProps['aria-invalid']}
			invalid={inputProps.invalid}
			placeholder={inputProps.placeholder}
			// Typeahead is input-like, which lets us clear out selection even if required
			clearable
			{...rest}
		>
			<FormElementResetProvider>
				<Input
					{...inputProps}
					{...callbackAttrs(
						inputProps,
						selectInputKeyDown,
						selectUpdateWithInput(selectInputTextId),
					)}
					id={id()}
					role="combobox"
					class="c-select__input"
					aria-autocomplete="list"
					aria-controls={listId}
					aria-multiselectable={props.multiple}
					invalid={invalid()}
					autofocus
					unstyled
				/>
			</FormElementResetProvider>
			<SelectOptionList
				busy={props.busy}
				listBoxId={listId}
				selectInputTextId={selectInputTextId}
				tabIndex={-1}
				{...optionListProps}
				{...callbackAttrs(optionListProps, selectLabelClick)}
			/>
		</SelectButtonContainer>
	);
}
