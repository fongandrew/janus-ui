import cx from 'classix';
import { splitProps, useContext } from 'solid-js';

import { Button, type ButtonProps } from '~/shared/components/button';
import { FormContext } from '~/shared/components/form-context';
import { Spinner } from '~/shared/components/spinner';
import { T } from '~/shared/utility/text/t-components';

export function ResetButton(props: ButtonProps) {
	const formId = useContext(FormContext);
	return (
		<Button {...props} type="reset" form={props.form || formId?.()}>
			{props.children ?? <T>Reset</T>}
		</Button>
	);
}

export interface SubmitButtonProps extends ButtonProps {}

export function SubmitButton(props: SubmitButtonProps) {
	const [local, rest] = splitProps(props, ['form', 'children']);

	const formId = useContext(FormContext);
	return (
		<Button
			{...rest}
			type="submit"
			form={local.form || formId?.()}
			class={cx('c-form__submit', props.class)}
		>
			<Spinner aria-hidden="true" class="c-form__busy" />
			<span>{local.children ?? <T>Submit</T>}</span>
			<span class="c-form__busy t-sr-only">
				<T>In progress</T>
			</span>
		</Button>
	);
}
