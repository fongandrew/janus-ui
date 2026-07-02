/**
 * Table (§13.7) — thin `<table class="c-table">` wrapper; thead/tbody are
 * the consumer's own markup.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export interface TableProps extends ComponentProps<'table'> {
	/** Sets --c-table__row-height inline; defaults to the global knob. */
	rowHeight?: string | undefined;
}

export function Table(props: TableProps) {
	const [local, rest] = splitProps(props, ['rowHeight', 'class', 'style']);
	return (
		<table
			{...rest}
			class={cx('c-table', local.class)}
			style={{
				...(typeof local.style === 'object' ? local.style : {}),
				...(local.rowHeight ? { '--c-table__row-height': local.rowHeight } : {}),
			}}
		/>
	);
}
