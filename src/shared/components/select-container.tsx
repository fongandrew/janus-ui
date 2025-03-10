import cx from 'classix';
import { ChevronsUpDown, X } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { selectClear } from '~/shared/callback-attrs/select';
import { Button } from '~/shared/components/button';
import { Dropdown } from '~/shared/components/dropdown';
import { FormElementResetProvider } from '~/shared/components/form-element-context';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { t } from '~/shared/utility/text/t-tag';

export interface SelectContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Input ID, if any */
	inputId?: string | undefined;
	/** ListBox ID, if any */
	listId?: string | undefined;
	/** Make children required */
	children: JSX.Element;
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
				{local.children}
				<span class="c-select__chevron">
					<ChevronsUpDown />
				</span>
				<FormElementResetProvider>
					<Button
						class="c-select__clear"
						aria-controls={[local.listId, local.inputId].join(' ')}
						aria-label={t`Clear selection`}
						unsetFormInput
						unstyled
						{...callbackAttrs(selectClear)}
					>
						<X />
					</Button>
				</FormElementResetProvider>
			</Dropdown>
		</div>
	);
}
