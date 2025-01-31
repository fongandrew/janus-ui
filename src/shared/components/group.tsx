import '~/shared/components/group.css';

import cx from 'classix';
import { type JSX } from 'solid-js';

export function Group(props: JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>) {
	return <div {...props} class={cx('c-group', props.class)} />;
}
