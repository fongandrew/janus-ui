import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

import { focusGroupOnClick } from '~/lib/components/callbacks/label';
import { Description } from '~/lib/components/description';
import { ErrorMessage } from '~/lib/components/error-message';
import { FormElementPropsProvider } from '~/lib/components/form-element-context';
import { Label, LabelSpan } from '~/lib/components/label';
import { attrNoConflict } from '~/lib/utility/attribute';
import { attrs } from '~/lib/utility/attribute-list';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { createAuto, createAutoId } from '~/lib/utility/solid/auto-prop';

export interface LabelledInputProps extends ComponentProps<'div'> {
	/**
	 * ID for the input element (assign here if you don't want auto-generated so label
	 * and description can properly line up
	 */
	id?: string | undefined;
	/** The actual label */
	label: JSX.Element;
	/** Option ID for label element */
	labelId?: string | undefined;
	/** Optional description content */
	description?: JSX.Element;
	/** Option ID for description element */
	descriptionId?: string | undefined;
	/** Optional error message content, will otherwise pull from input itself */
	errorMessage?: JSX.Element;
	/** Optional ID for error message element */
	errorId?: string | undefined;
	/** Is this input required? Will add a `*` to label */
	required?: boolean | undefined;
	/** Child required (this is the input) */
	children: JSX.Element;
}

/**
 * Component for a block-level input with label and optional description/error
 *
 * @example
 * ```tsx
 * // Basic usage with an input
 * 	<LabelledInput label="Username">
 * 		<Input name="username" placeholder="Enter username" />
 * 	</LabelledInput>
 *
 * // With description
 * 	<LabelledInput
 * 		label="Email address"
 * 		description="We'll never share your email with anyone else."
 * 	>
 * 		<Input type="email" name="email" />
 * 	</LabelledInput>
 *
 * // With error message
 * 	<LabelledInput
 * 		label="Password"
 * 		errorMessage="Password must be at least 8 characters"
 * 	>
 * 		<Input type="password" name="password" invalid />
 * 	</LabelledInput>
 *
 * // Required field
 * 	<LabelledInput label="Full name" required>
 * 		<Input name="name" />
 * 	</LabelledInput>
 * ```
 */
export function LabelledInput(props: LabelledInputProps) {
	const [local, rest] = splitProps(props, [
		'id',
		'label',
		'labelId',
		'description',
		'descriptionId',
		'errorMessage',
		'errorId',
		'required',
		'children',
	]);

	const inputId = createAutoId(props);
	const labelId = createAuto(props, 'labelId');
	const descriptionId = createAuto(props, 'descriptionId');
	const errorId = createAuto(props, 'errorId');

	return (
		<div {...rest} class={cx('c-label-stack', rest.class)}>
			<LabelSpan id={labelId()} required={local.required}>
				{local.label}
			</LabelSpan>
			{local.description || local.descriptionId ? (
				<Description id={descriptionId()}>{local.description}</Description>
			) : null}
			<FormElementPropsProvider
				id={(prev) => attrNoConflict(prev, inputId())}
				aria-labelledby={(prev) => attrs(prev, labelId())}
				// See https://cerovac.com/a11y/2024/06/support-for-aria-errormessage-is-getting-better-but-still-not-there-yet/
				// As of Dec 2024, aria-errormessage still isn't quite there in Voiceover at least,
				// so using aria-describedby for error in addition to description
				aria-describedby={(prev) =>
					attrs(
						prev,
						props.description || props.descriptionId ? descriptionId() : undefined,
						errorId(),
					)
				}
				required={(prev) => attrNoConflict(prev, local.required)}
				invalid={(prev) => !!local.errorMessage || prev}
			>
				{local.children}
			</FormElementPropsProvider>
			<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
		</div>
	);
}

/**
 * Component for a label group for multiple inputs
 *
 * @example
 * ```tsx
 * 	<LabelledInputGroup
 * 		label="Time"
 * 		description="Start and end time"
 * 	>
 * 		<TimePicker id="start-time" />
 * 		<span class="o-text-box"> to </span>
 * 		<TimePicker id="end-time" />
 * 	</LabelledInputGroup>
 * ```
 */
export function LabelledInputGroup(props: LabelledInputProps) {
	const [local, rest] = splitProps(props, [
		'id',
		'label',
		'labelId',
		'description',
		'descriptionId',
		'errorMessage',
		'errorId',
		'required',
		'children',
	]);

	const labelId = createAuto(props, 'labelId');
	const descriptionId = createAuto(props, 'descriptionId');
	const errorId = createAuto(props, 'errorId');

	return (
		<div
			{...rest}
			role="group"
			class={cx('c-label-stack', rest.class)}
			aria-labelledby={labelId()}
			aria-describedby={attrs(
				local.description || local.descriptionId ? descriptionId() : null,
				errorId(),
			)}
		>
			<LabelSpan
				id={labelId()}
				required={local.required}
				focusOnClick={false}
				{...callbackAttrs(focusGroupOnClick)}
			>
				{local.label}
			</LabelSpan>
			{local.description || local.descriptionId ? (
				<Description id={descriptionId()}>{local.description}</Description>
			) : null}
			{local.children}
			<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
		</div>
	);
}

/**
 * Component for an inline input with label, typically used for checkboxes and radio buttons
 * Unlike `LabelledInput`, this uses a regular label instead of a span with aria-labelledby.
 *
 * @example
 * ```tsx
 * // Basic usage with a checkbox
 * 	<LabelledInline label="I agree to the terms and conditions">
 * 		<Checkbox name="agree" />
 * 	</LabelledInline>
 * ```
 */
export function LabelledInline(props: Omit<LabelledInputProps, 'description'>) {
	const [local, rest] = splitProps(props, [
		'id',
		'label',
		'labelId',
		'errorId',
		'errorMessage',
		'required',
		'children',
	]);

	const inputId = createAutoId(props);
	const errorId = createAuto(props, 'errorId');

	return (
		<div {...rest} class={cx('c-label-stack', rest.class)}>
			<Label id={local.labelId} required={local.required}>
				<FormElementPropsProvider
					id={(prev) => attrNoConflict(prev, inputId())}
					aria-describedby={(prev) => attrs(prev, errorId())}
					required={(prev) => attrNoConflict(prev, local.required)}
					invalid={(prev) => !!local.errorMessage || prev}
				>
					{local.children}
				</FormElementPropsProvider>
				{local.label}
			</Label>
			<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
		</div>
	);
}
