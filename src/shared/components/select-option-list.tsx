import { type JSX, splitProps } from 'solid-js';

import { DropdownContent } from '~/shared/components/dropdown';
import { ListBoxSelections } from '~/shared/components/list-box';
import { OptionList } from '~/shared/components/option-list';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { T } from '~/shared/utility/text/t-components';

export interface SelectOptionListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Force ref to be callback, if any */
	ref?: ((el: HTMLDivElement) => void) | undefined;
	/** Callback ref for option list */
	listRef?: ((el: HTMLDivElement) => void) | undefined;
	/** Form input name */
	name?: string | undefined;
	/** Current input value, if any */
	input?: string | undefined;
	/** Currently selected values */
	values?: Set<string>;
}

export function SelectOptionList(props: SelectOptionListProps) {
	// const getRefs = useContext(RefContext);
	const [local, rest] = splitProps(props, ['children', 'input', 'listRef', 'name', 'values']);
	return (
		<DropdownContent {...rest}>
			<OptionList
				role="listbox"
				ref={combineRefs(/* ...getRefs(DROPDOWN_CONTENT_REF), */ local.listRef)}
			>
				{local.children}
				<div class="c-select__empty_state">
					{props.input?.trim() ? (
						<T>
							No matches found for <strong>{local.input}</strong>
						</T>
					) : (
						<T>Type something</T>
					)}
				</div>
			</OptionList>
			{local.name && local.values && (
				<ListBoxSelections name={local.name} values={local.values} />
			)}
		</DropdownContent>
	);
}
