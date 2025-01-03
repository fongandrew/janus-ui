import cx from 'classix';
import { splitProps } from 'solid-js';

import { ListBoxSelections } from '~/shared/components/list-box';
import { OptionList, type OptionListProps } from '~/shared/components/option-list';
import { T } from '~/shared/utility/text/t-components';

export interface SelectOptionListProps extends Omit<OptionListProps, 'role'> {
	/** Form input name */
	name?: string | undefined;
	/** Current input value, if any */
	input?: string | undefined;
	/** Currently selected values */
	values?: Set<string>;
}

export function SelectOptionList(props: SelectOptionListProps) {
	const [local, rest] = splitProps(props, ['children', 'input', 'name', 'values']);
	return (
		<>
			<OptionList role="listbox" {...rest} class={cx('c-dropdown', props.class)}>
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
		</>
	);
}
