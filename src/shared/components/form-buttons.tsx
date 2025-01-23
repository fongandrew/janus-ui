import cx from 'classix';
import { useContext } from 'solid-js';

import { Button, type ButtonProps } from '~/shared/components/button';
import { FormContext } from '~/shared/components/form-context';
import { T } from '~/shared/utility/text/t-components';

export function ResetButton(props: ButtonProps) {
	const formContext = useContext(FormContext);
	return (
		<Button {...props} type="reset" form={props.form || formContext.id()}>
			{props.children ?? <T>Reset</T>}
		</Button>
	);
}

export function SubmitButton(props: ButtonProps) {
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
