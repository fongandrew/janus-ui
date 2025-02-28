import { flip, offset, shift, size } from '@floating-ui/dom';
import cx from 'classix';
import { ChevronsUpDown, X } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import { Dropdown } from '~/shared/components/dropdown';
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
	children: [() => JSX.Element, () => JSX.Element];
}

export function SelectContainer(props: SelectContainerProps) {
	const [local, rest] = splitProps(props, ['children', 'inputId', 'listId']);

	return (
		<div {...rest} class={cx('c-select__container', rest.class)}>
			<Dropdown
				middleware={[
					// Selects have a focus ring so give a bit more space than
					// normal dropdowns
					offset(8),
					flip(),
					shift({ padding: 4 }),
					size({
						apply({ rects, elements, availableHeight }) {
							elements.floating.style.setProperty(
								'--c-dropdown__computed-max-width',
								`${rects.reference.width}px`,
							);
							elements.floating.style.setProperty(
								'--c-dropdown__computed-min-width',
								`${rects.reference.width}px`,
							);
							elements.floating.style.setProperty(
								'--c-dropdown__computed-max-height',
								`${Math.max(0, availableHeight - 8)}px`,
							);
						},
					}),
				]}
			>
				{() => (
					<>
						{local.children[0]()}
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
				{local.children[1]}
			</Dropdown>
		</div>
	);
}
