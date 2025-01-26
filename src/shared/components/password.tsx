import { type FormElementProps } from '~/shared/components/form-element-props';
import { BaseInput } from '~/shared/components/input';

export interface PasswordProps extends Omit<FormElementProps<'input'>, 'type'> {
	/** Require autocomplete field since Chrome will complain about it */
	autocomplete: 'current-password' | 'new-password';
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default password field
 */
export function Password(props: PasswordProps) {
	return <BaseInput {...props} type="password" />;
}
