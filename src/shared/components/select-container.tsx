import cx from 'classix';
import { ChevronsUpDown, X } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';

export interface SelectContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Hander for clearing selection */
	onClear: (e: MouseEvent | KeyboardEvent) => void;
	/** Make children required */
	children: JSX.Element;
}

export function SelectContainer(props: SelectContainerProps) {
	const [local, rest] = splitProps(props, ['children', 'onClear']);

	return (
		<div {...rest} class={cx('c-select__container', props.class)}>
			{local.children}
			<span class="c-select__chevron">
				<ChevronsUpDown />
			</span>
			<Button
				class="c-select__clear"
				aria-label="Clear selection"
				onClick={local.onClear}
				unsetFormInput
				unstyled
			>
				<X />
			</Button>
		</div>
	);
}
