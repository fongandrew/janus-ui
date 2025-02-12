import cx from 'classix';
import { children, splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { spanify } from '~/shared/utility/solid/spanify';

export interface ButtonProps extends FormElementProps<'button'> {
	/** Removes default styling */
	unstyled?: boolean | undefined;
	/**
	 * By default, buttons are treated as an input element within a label group,
	 * but we can unset this (e.g. if there are multiple buttons or buttons alongside
	 * inputs, etc.)
	 */
	unsetFormInput?: boolean | undefined;
}

export function BaseButton(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formElementProps = mergeFormElementProps<'button'>(rest);
	const resolved = children(() => formElementProps.children);
	return (
		<button
			type="button"
			{...formElementProps}
			class={cx(local.unstyled && 't-unstyled', props.class)}
		>
			{spanify(resolved.toArray())}
		</button>
	);
}

export function Button(props: ButtonProps) {
	return <BaseButton {...props} class={cx(!props.unstyled && 'c-button', props.class)} />;
}

export function GhostButton(props: ButtonProps) {
	return <BaseButton {...props} class={cx('c-button--ghost', props.class)} />;
}

export function LinkButton(props: ButtonProps) {
	return <BaseButton {...props} class={cx('c-button--link', props.class)} />;
}

export function IconButton(props: ButtonProps & { label: string }) {
	const [local, rest] = splitProps(props, ['label']);
	return (
		<BaseButton aria-label={local.label} {...rest} class={cx('c-button--icon', props.class)} />
	);
}
