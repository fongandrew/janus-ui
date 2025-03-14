import cx from 'classix';
import { splitProps, useContext } from 'solid-js';

import { Button, type ButtonProps } from '~/shared/components/button';
import { FormContext } from '~/shared/components/form-context';
import { Spinner } from '~/shared/components/spinner';
import { T } from '~/shared/components/t-components';

export function ResetButton(props: ButtonProps) {
	const context = useContext(FormContext);
	return (
		<Button {...props} type="reset" form={props.form || context?.id()} noJSDisabled={false}>
			{props.children ?? <T>Reset</T>}
		</Button>
	);
}

export interface SubmitButtonProps extends ButtonProps {}

export function SubmitButton(props: SubmitButtonProps) {
	const [local, rest] = splitProps(props, ['form', 'children']);

	const context = useContext(FormContext);
	return (
		<Button
			{...rest}
			type="submit"
			form={local.form || context?.id()}
			noJSDisabled={context?.action() ? false : undefined}
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
