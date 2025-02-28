import cx from 'classix';
import { children, type JSX, splitProps } from 'solid-js';

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
	const resolved = children(() => props.children);
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

/** Basic button with border + background colors, use color block CSS helpers to change colors */
export function Button(props: ButtonProps) {
	return <BaseButton {...props} class={cx(!props.unstyled && 'c-button', props.class)} />;
}

/** A borderless, transparent button  */
export function GhostButton(props: ButtonProps) {
	return <BaseButton {...props} class={cx('c-button--ghost', props.class)} />;
}

/** A button that looks like a link */
export function LinkButton(props: ButtonProps) {
	return <BaseButton {...props} class={cx('c-button--link', props.class)} />;
}

/** A borderless button with an icon in it */
export function IconButton(props: ButtonProps & { label: string }) {
	const [local, rest] = splitProps(props, ['label']);
	return (
		<BaseButton aria-label={local.label} {...rest} class={cx('c-button--icon', props.class)} />
	);
}

// Links
//
// Plain links can just be done with an anchor tag (the `<a>` element has default styling). This
// contains ways to make links that look like buttons, but are still links.

/** Unstyled base for ButtonLink and GhostButtonLink */
export function BaseButtonLink(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
	const resolved = children(() => props.children);
	return <a {...props}>{spanify(resolved.toArray())}</a>;
}

/** A button that looks like a link */
export function ButtonLink(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return <BaseButtonLink {...props} class={cx('c-button', props.class)} />;
}

/** A borderless, transparent button  */
export function GhostButtonLink(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return <BaseButtonLink {...props} class={cx('c-button--ghost', props.class)} />;
}
