import cx from 'classix';
import { Show, splitProps, useContext } from 'solid-js';

import { Button, type ButtonProps } from '~/shared/components/button';
import { FormContext } from '~/shared/components/form-context';
import { Spinner } from '~/shared/components/spinner';
import { T } from '~/shared/utility/text/t-components';

export function ResetButton(props: ButtonProps) {
	const formContext = useContext(FormContext);
	return (
		<Button {...props} type="reset" form={props.form || formContext?.idSig[0]()}>
			{props.children ?? <T>Reset</T>}
		</Button>
	);
}

export interface SubmitButtonProps extends ButtonProps {}

export function SubmitButton(props: SubmitButtonProps) {
	const [local, rest] = splitProps(props, ['form', 'children']);

	const formContext = useContext(FormContext);
	return (
		<Button
			{...rest}
			type="submit"
			form={local.form || formContext?.idSig[0]()}
			class={cx('v-colors-primary', props.class)}
			aria-live={formContext?.busySig[0]() ? 'polite' : undefined}
		>
			<Show when={formContext?.busySig[0]()} fallback={local.children ?? <T>Submit</T>}>
				<Spinner aria-hidden="true" />
				<span aria-hidden="true">{local.children ?? <T>Submit</T>}</span>
				<span class="t-sr-only">
					<T>In progress</T>
				</span>
			</Show>
		</Button>
	);
}
