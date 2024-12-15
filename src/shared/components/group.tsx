import cx from 'classix';
import { type JSX } from 'solid-js';

import { group } from '~/shared/components/group.module.css';

export function Group(props: JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>) {
	return <div {...props} class={cx(group, props.class)} />;
}
