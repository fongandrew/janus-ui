import cx from 'classix';
import { Loader2, type LucideProps } from 'lucide-solid';
import { splitProps } from 'solid-js';

export interface SpinnerProps extends LucideProps {}

export function Spinner(props: SpinnerProps) {
	const [local, rest] = splitProps(props, ['class']);
	return <Loader2 {...rest} class={cx('animate-spin', local.class)} />;
}
