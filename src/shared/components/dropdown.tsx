import cx from 'classix';
import { type JSX } from 'solid-js';

export interface DropdownProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Ref returned by createDropdown */
	ref: (el: HTMLDivElement) => void;
	/** Make children required */
	children: JSX.Element;
}

/** A simple wrapper component that applies Dropdown styling */
export function Dropdown(props: DropdownProps) {
	return <div {...props} class={cx('c-dropdown', props.class)} />;
}
