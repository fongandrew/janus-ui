import cx from 'classix';
import { ChevronsUpDown, X } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { Button } from '~/shared/components/button';

export interface SelectProps
	extends Omit<JSX.IntrinsicAttributes, 'ref'>,
		Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
	/** Hander for clearing selection -- if not set, the clear ubtton is not shown */
	onClear?: ((e: MouseEvent | KeyboardEvent) => void) | undefined;
	/** Make children required */
	children: JSX.Element;
}

export function SelectButton(props: SelectProps) {
	const [local, rest] = splitProps(props, ['children', 'onClear']);

	return (
		<div class="relative">
			<Button {...rest} class={cx('c-select-button', props.class)}>
				<span class="c-select-button__content">{local.children}</span>
				{/* Opacity 0 to hide chevron to prevent possible shifting */}
				<ChevronsUpDown class={cx('shrink-0 grow-0', local.onClear && 'opacity-0')} />
			</Button>
			{local.onClear && !rest.disabled && !rest['aria-disabled'] && (
				<Button
					class="c-select-button__clear"
					aria-label="Clear selection"
					onClick={local.onClear}
				>
					<X />
				</Button>
			)}
		</div>
	);
}
