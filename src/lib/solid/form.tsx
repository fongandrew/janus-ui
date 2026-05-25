import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
	validate?: boolean;
	submitHandler?: string;
}

export function Form(props: FormProps) {
	const [local, rest] = splitProps(props, ['validate', 'submitHandler', 'class']);
	const behaviors: string[] = [];
	if (local.validate !== false) behaviors.push('t-validate');
	behaviors.push('t-submit');
	return (
		<form
			class={local.class}
			data-js={behaviors.join(' ')}
			data-submit-handler={local.submitHandler}
			{...rest}
		/>
	);
}

export interface FormErrorProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function FormError(props: FormErrorProps) {
	const [local, rest] = splitProps(props, ['class']);
	return <div class={attrs('c-alert v-colors-danger', local.class)} data-js="t-form-error" role="alert" {...rest} />;
}

export interface LabelledInputProps {
	label: JSX.Element;
	description?: JSX.Element;
	error?: string;
	id: string;
	children: JSX.Element;
}

export function LabelledInput(props: LabelledInputProps) {
	return (
		<div class="o-stack">
			<label id={`${props.id}-label`} for={props.id}>
				{props.label}
			</label>
			{props.children}
			{props.description && (
				<span id={`${props.id}-desc`} class="o-caption">
					{props.description}
				</span>
			)}
			<span
				id={`${props.id}-err`}
				class="c-error-message"
				data-js="t-validate-error"
				aria-live="polite"
			/>
		</div>
	);
}
