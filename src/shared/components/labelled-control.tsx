import cx from 'classix';
import { createUniqueId, type JSX, splitProps } from 'solid-js';

import { Description } from '~/shared/components/description';
import { ErrorMessage } from '~/shared/components/error-message';
import { FormElementPropsProvider } from '~/shared/components/form-element-context';
import { Label } from '~/shared/components/label';
import { attrNoConflict } from '~/shared/utility/attribute';
import { attrs } from '~/shared/utility/attribute-list';
import { createAuto, createAutoId } from '~/shared/utility/solid/auto-prop';

export interface LabelledInputProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/**
	 * ID for the input element (assign here if you don't want auto-generated so label
	 * and description can properly line up
	 */
	id?: string | undefined;
	/** The actual label */
	label: JSX.Element;
	/** Optional description content */
	description?: JSX.Element;
	/** Option ID for description element */
	descriptionId?: string | undefined;
	/** Optional error message content, will otherwise pull from input itself */
	errorMessage?: JSX.Element;
	/** Optional ID for error message element */
	errorId?: string | undefined;
	/** Child required (this is the input) */
	children: JSX.Element;
}

/** Label + block input (like select or text input) */
export function LabelledInput(props: LabelledInputProps) {
	const [local, rest] = splitProps(props, [
		'id',
		'label',
		'description',
		'descriptionId',
		'errorMessage',
		'errorId',
		'children',
	]);

	const inputId = createAutoId(props);
	const labelId = createUniqueId();
	const descriptionId = createAuto(props, 'descriptionId');
	const errorId = createAuto(props, 'errorId');

	return (
		<div {...rest} class={cx('o-label-stack', rest.class)}>
			<Label id={labelId}>{local.label}</Label>
			{local.description ? (
				<Description id={descriptionId()}>{local.description}</Description>
			) : null}
			<FormElementPropsProvider
				id={(prev) => attrNoConflict(prev, inputId())}
				aria-labelledby={(prev) => attrs(prev, labelId)}
				aria-describedby={(prev) =>
					attrs(prev, props.description ? descriptionId() : undefined, errorId())
				}
			>
				{local.children}
			</FormElementPropsProvider>
			<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
		</div>
	);
}

/** Label + inline input (like checkbox) */
export function LabelledInline(props: Omit<LabelledInputProps, 'description'>) {
	const [local, rest] = splitProps(props, ['id', 'label', 'errorId', 'errorMessage', 'children']);

	const inputId = createAutoId(props);
	const labelId = createUniqueId();
	const errorId = createAuto(props, 'errorId');

	return (
		<div {...rest} class={cx('o-label-stack', rest.class)}>
			<Label id={labelId}>
				<FormElementPropsProvider
					id={(prev) => attrNoConflict(prev, inputId())}
					aria-labelledby={(prev) => attrs(prev, labelId)}
					aria-describedby={(prev) => attrs(prev, errorId())}
				>
					{local.children}
				</FormElementPropsProvider>
				{local.label}
			</Label>
			<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
		</div>
	);
}
