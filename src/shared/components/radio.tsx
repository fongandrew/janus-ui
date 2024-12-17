import cx from 'classix';
import { Circle } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { useFormControl } from '~/shared/utility/use-form-control';

export type RadioProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['checked', 'class']);
	const formProps = useFormControl(rest);

	return (
		<div class={cx('c-radio', local.class)}>
			<input type="radio" checked={local.checked} {...formProps} />
			<Circle class="c-radio__dot" />
		</div>
	);
}
