import { flip, offset, shift, size } from '@floating-ui/dom';
import { ChevronsUpDown, X } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';
import { Dropdown } from '~/shared/components/dropdown';
import { t } from '~/shared/utility/text/t-tag';

export interface SelectContainerProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Hander for clearing selection */
	onClear: (e: MouseEvent | KeyboardEvent) => void;
	/**
	 * Two children required -- context and menu. And must be render funcs
	 * because Dropdown likes it that way.
	 */
	children: [() => JSX.Element, () => JSX.Element];
}

export function SelectContainer(props: SelectContainerProps) {
	const [local, rest] = splitProps(props, ['children', 'onClear']);

	return (
		<div {...rest} class="c-select__container">
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
								'--c-dropdown-max-width',
								`${rects.reference.width}px`,
							);
							elements.floating.style.setProperty(
								'--c-dropdown-min-width',
								`${rects.reference.width}px`,
							);
							elements.floating.style.setProperty(
								'--c-dropdown-max-height',
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
							aria-label={t`Clear selection`}
							onClick={local.onClear}
							unsetFormInput
							unstyled
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
