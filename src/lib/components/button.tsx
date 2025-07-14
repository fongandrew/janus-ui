import cx from 'classix';
import { children, type ComponentProps, mergeProps, splitProps } from 'solid-js';
import { isServer } from 'solid-js/web';

import { type FormElementProps, mergeFormElementProps } from '~/lib/components/form-element-props';
import { spanify } from '~/lib/utility/solid/spanify';

export interface ButtonProps extends FormElementProps<'button'> {
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

export function BaseButton(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formElementProps = mergeFormElementProps<'button'>(
		isServer
			? /* eslint-disable solid/reactivity */
				mergeProps(rest, {
					// Buttons are default disabled with no JS
					noJSDisabled: props.noJSDisabled !== false,
				})
			: /* eslint-enable solid/reactivity */
				rest,
	);
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

/** Basic button with border + background colors, use color block CSS helpers to change colors
 *
 * @example
 * ```tsx
 * 	<Button>Default Button</Button>
 * 	<Button class="v-colors-primary">Primary</Button>
 * 	<Button class="v-colors-danger">Danger</Button>
 * 	<Button disabled>Disabled</Button>
 * ```
 */
export function Button(props: ButtonProps) {
	return <BaseButton {...props} class={cx(!props.unstyled && 'c-button', props.class)} />;
}

/** A borderless, transparent button
 *
 * @example
 * ```tsx
 * 	<GhostButton>Ghost</GhostButton>
 * ```
 */
export function GhostButton(props: ButtonProps) {
	return <BaseButton {...props} class={cx('c-button--ghost', props.class)} />;
}

/** A button that looks like a link
 *
 * @example
 * ```tsx
 * 	<LinkButton>Link</LinkButton>
 * ```
 */
export function LinkButton(props: ButtonProps) {
	return <BaseButton {...props} class={cx('c-button--link', props.class)} />;
}

/** A borderless button with an icon in it
 *
 * @example
 * ```tsx
 * 	<IconButton label="Settings">
 * 		<Settings />
 * 	</IconButton>
 * ```
 */
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
export function BaseButtonLink(props: ComponentProps<'a'>) {
	const resolved = children(() => props.children);
	return <a {...props}>{spanify(resolved.toArray())}</a>;
}

/** A link that looks like a button
 *
 * @example
 * ```tsx
 * 	<ButtonLink href="/some/path">Button Link</ButtonLink>
 * ```
 */
export function ButtonLink(props: ComponentProps<'a'>) {
	return <BaseButtonLink {...props} class={cx('c-button', props.class)} />;
}

/** A borderless, transparent link styled as a button
 *
 * @example
 * ```tsx
 * 	<GhostButtonLink href="/some/path">Ghost Button Link</GhostButtonLink>
 * ```
 */
export function GhostButtonLink(props: ComponentProps<'a'>) {
	return <BaseButtonLink {...props} class={cx('c-button--ghost', props.class)} />;
}
