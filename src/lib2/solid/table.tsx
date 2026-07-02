import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface TableProps extends ComponentProps<'table'> {
	/** Sets `--c-table__row-height` inline. */
	rowHeight?: string;
}

/** Table (§10.1) — thin `c-table` pass-through; consumer owns thead/tbody. */
export function Table(props: TableProps) {
	const [local, rest] = splitProps(props, ['rowHeight', 'class', 'style']);
	const style = (): JSX.CSSProperties => ({
		...(local.rowHeight ? { '--c-table__row-height': local.rowHeight } : {}),
		...(local.style && typeof local.style === 'object' ? local.style : {}),
	});
	return <table {...rest} class={cx('c-table', local.class)} style={style()} />;
}
