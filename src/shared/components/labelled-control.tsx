import cx from 'classix';
import { createMemo, createRenderEffect, createUniqueId, type JSX, splitProps } from 'solid-js';
import { isServer } from 'solid-js/web';

import { Description } from '~/shared/components/description';
import { ErrorMessage } from '~/shared/components/error-message';
import { type FormElementControl } from '~/shared/components/form-element-control';
import { FormElementProvider } from '~/shared/components/form-element-provider';
import { Label } from '~/shared/components/label';
import { isDev } from '~/shared/utility/is-dev';

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
	/** Optional error message content, will otherwise pull from input itself */
	errorMessage?: JSX.Element;
	/** Child required (this is the input) */
	children: JSX.Element;
}

/**
 * For SSR, we need to move ID assignment up to context element so we can properly do
 * ARIA relationships. This is a helper to ensure that the ID doesn't change after
 * initial assignment since we can't reactively update stuff on server.
 */
function maybeAssertNoIdChange(ctrl: FormElementControl) {
	if (isServer && isDev()) {
		createRenderEffect((id: string | undefined) => {
			if (id && ctrl.id() !== id) {
				throw new Error('ID change on server');
			}
			return ctrl.id();
		});
	}
}

/** Label + block input (like select or text input) */
export function LabelledInput(props: LabelledInputProps) {
	const [local, rest] = splitProps(props, [
		'id',
		'label',
		'description',
		'errorMessage',
		'children',
	]);

	const inputId = createMemo(() => props.id || createUniqueId());
	const labelId = createUniqueId();
	const descriptionId = createMemo(() => (local.description ? createUniqueId() : undefined));
	const errorId = createMemo(() => (local.errorMessage ? createUniqueId() : undefined));
	const assignIds = (ctrl: FormElementControl) => {
		ctrl.setAttr('id', inputId);
		ctrl.setAttr('aria-labelledby', labelId);
		ctrl.extAttr('aria-describedby', descriptionId);
		ctrl.extAttr('aria-describedby', errorId);
		maybeAssertNoIdChange(ctrl);
	};

	return (
		<FormElementProvider ctrlRef={assignIds}>
			<div {...rest} class={cx('o-label-stack', rest.class)}>
				<Label id={labelId}>{local.label}</Label>
				{local.description ? (
					<Description id={descriptionId()}>{local.description}</Description>
				) : null}
				{local.children}
				<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
			</div>
		</FormElementProvider>
	);
}

/** Label + inline input (like checkbox) */
export function LabelledInline(props: Omit<LabelledInputProps, 'description'>) {
	const [local, rest] = splitProps(props, ['id', 'label', 'errorMessage', 'children']);

	const inputId = createMemo(() => props.id || createUniqueId());
	const labelId = createUniqueId();
	const errorId = createMemo(() => (local.errorMessage ? createUniqueId() : undefined));
	const assignIds = (ctrl: FormElementControl) => {
		ctrl.setAttr('id', inputId);
		ctrl.setAttr('aria-labelledby', labelId);
		ctrl.extAttr('aria-describedby', errorId);
		maybeAssertNoIdChange(ctrl);
	};

	return (
		<FormElementProvider ctrlRef={assignIds}>
			<div {...rest} class={cx('o-label-stack', rest.class)}>
				<Label id={labelId}>
					{local.children}
					{local.label}
				</Label>
				<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
			</div>
		</FormElementProvider>
	);
}
