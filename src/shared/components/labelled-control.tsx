import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { Description } from '~/shared/components/description';
import { ErrorMessage } from '~/shared/components/error-message';
import { FormElementProvider } from '~/shared/components/form-element-provider';
import { Label } from '~/shared/components/label';

export interface LabelledInputProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** The actual label */
	label: JSX.Element;
	/** Optional description content */
	description?: JSX.Element;
	/** Optional error message content, will otherwise pull from input itself */
	errorMessage?: JSX.Element;
	/** Child required (this is the input) */
	children: JSX.Element;
}

/** Label + block input (like select or text input) */
export function LabelledInput(props: LabelledInputProps) {
	const [local, rest] = splitProps(props, ['label', 'description', 'errorMessage', 'children']);
	return (
		<FormElementProvider>
			<div {...rest} class={cx('o-label-stack', rest.class)}>
				<Label>{local.label}</Label>
				{local.description ? <Description>{local.description}</Description> : null}
				{local.children}
				<ErrorMessage>{local.errorMessage}</ErrorMessage>
			</div>
		</FormElementProvider>
	);
}

/** Label + inline input (like checkbox) */
export function LabelledInline(props: Omit<LabelledInputProps, 'description'>) {
	const [local, rest] = splitProps(props, ['label', 'errorMessage', 'children']);
	return (
		<FormElementProvider>
			<div {...rest} class={cx('o-label-stack', rest.class)}>
				<Label>
					{local.children}
					{local.label}
				</Label>
				<ErrorMessage>{local.errorMessage}</ErrorMessage>
			</div>
		</FormElementProvider>
	);
}
