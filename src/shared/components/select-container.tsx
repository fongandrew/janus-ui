import cx from 'classix';
import { ChevronsUpDown, X } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	Dropdown,
	type PopoverRenderProps,
	type TriggerRenderProps,
} from '~/shared/components/dropdown';
import { selectClear } from '~/shared/handlers/select';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { t } from '~/shared/utility/text/t-tag';

export interface SelectContainerProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Input ID, if any */
	inputId?: string | undefined;
	/** ListBox ID, if any */
	listId?: string | undefined;
	/**
	 * Two children required -- context and menu. And must be render funcs
	 * because Dropdown likes it that way.
	 */
	children: [
		(props: TriggerRenderProps) => JSX.Element,
		(props: PopoverRenderProps) => JSX.Element,
	];
}

export function SelectContainer(props: SelectContainerProps) {
	const [local, rest] = splitProps(props, ['children', 'inputId', 'listId']);

	return (
		<div {...rest} class={cx('c-select__container', rest.class)}>
			<Dropdown
				// Dropdown width should match select input / button size
				fixedWidth
				// Selects have a focus ring so give a bit more space than
				// normal dropdowns
				offset={8}
			>
				{(props) => (
					<>
						{local.children[0](props)}
						<span class="c-select__chevron">
							<ChevronsUpDown />
						</span>
						<Button
							class="c-select__clear"
							aria-controls={[local.listId, local.inputId].join(' ')}
							aria-label={t`Clear selection`}
							unsetFormInput
							unstyled
							{...handlerProps(selectClear)}
						>
							<X />
						</Button>
					</>
				)}
				{
					// Not sure why, but sees necessary to wrap and pass props rather than
					// just do local.children[1] here or child func doesn't get props
					(props) => local.children[1](props)
				}
			</Dropdown>
		</div>
	);
}
