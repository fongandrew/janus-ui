/**
 * Button / IconButton (§13.7) — `c-button o-input-box`. `disabled` renders
 * aria-disabled (never native disabled, §13.1).
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';
import { type Variant, variantClass } from '~/lib2/solid/variants';

export interface ButtonProps extends ComponentProps<'button'> {
	/** Maps to v-colors-*. */
	variant?: Variant | undefined;
	'data-js'?: string | undefined;
}

export function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['variant', 'disabled', 'class']);
	return (
		<button
			type="button"
			{...rest}
			class={cx('c-button o-input-box', variantClass(local.variant), local.class)}
			{...ariaize({ disabled: local.disabled })}
		/>
	);
}

export function IconButton(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['variant', 'disabled', 'class']);
	return (
		<button
			type="button"
			{...rest}
			class={cx(
				'c-button c-button--icon o-input-box',
				variantClass(local.variant),
				local.class,
			)}
			{...ariaize({ disabled: local.disabled })}
		/>
	);
}
