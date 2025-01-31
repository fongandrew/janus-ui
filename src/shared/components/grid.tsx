import '~/shared/components/grid.css';

import cx from 'classix';
import { type JSX } from 'solid-js';

export function Grid(props: JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>) {
	return <div {...props} class={cx('c-grid', props.class)} />;
}
