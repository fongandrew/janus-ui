import { type JSX, splitProps } from 'solid-js';

import { DropdownContent } from '~/shared/components/dropdown';
import { OptionList } from '~/shared/components/option-list';
import { HIDDEN_INPUT_CONTAINER_ATTR } from '~/shared/utility/controls/list-box-base-control';
import { T } from '~/shared/utility/text/t-components';

export interface SelectOptionListProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ID for option list */
	id: string;
	/** Current input value, if any */
	input?: string | undefined;
}

export function SelectOptionList(props: SelectOptionListProps) {
	const [local, rest] = splitProps(props, ['children', 'input']);
	return (
		<DropdownContent {...rest}>
			<OptionList id={props.id} role="listbox" class="t-unstyled">
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
				<div {...{ [HIDDEN_INPUT_CONTAINER_ATTR]: '' }} />
			</OptionList>
		</DropdownContent>
	);
}
