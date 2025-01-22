import cx from 'classix';
import { splitProps, useContext } from 'solid-js';

import { Button, type ButtonProps } from '~/shared/components/button';
import { Form, type FormProps } from '~/shared/components/form';
import { FormContext } from '~/shared/components/form-context';
import { ModalContent } from '~/shared/components/modal';
import { generateId } from '~/shared/utility/id-generator';
import { T } from '~/shared/utility/text/t-components';

/**
 * Child component for forms inside modals
 */
export function ModalFormContent<TNames extends string>(props: FormProps<TNames>) {
	const [modalProps, formProps] = splitProps(props, ['class', 'classList']);

	const id = generateId('modal-form');
	return (
		<ModalContent {...modalProps}>
			<Form id={id} {...formProps}>
				{props.children}
			</Form>
		</ModalContent>
	);
}

export function ModalCancelButton(props: ButtonProps) {
	return (
		<Button type="reset" {...props}>
			{props.children ?? <T>Cancel</T>}
		</Button>
	);
}

export function ModalSubmitButton(props: ButtonProps) {
	const formContext = useContext(FormContext);

	return (
		<Button
			{...props}
			type="submit"
			form={props.form || formContext.id()}
			class={cx('c-button--primary', props.class)}
		>
			{props.children ?? <T>Submit</T>}
		</Button>
	);
}
