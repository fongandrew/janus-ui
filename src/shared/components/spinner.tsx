import cx from 'classix';
import { Loader, type LucideProps } from 'lucide-solid';
import { type Component, splitProps } from 'solid-js';

export interface SpinnerProps extends LucideProps {}

export const Spinner: Component<SpinnerProps> = (props) => {
	const [local, rest] = splitProps(props, ['class']);
	return <Loader {...rest} class={cx('animate-spin', local.class)} />;
};
