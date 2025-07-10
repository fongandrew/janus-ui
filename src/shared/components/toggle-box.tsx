import cx from 'classix';
import { type ComponentProps } from 'solid-js';

/**
 * Convenience box for an element you can toggle visibility of with the toggle callback attr,
 * which just relies on style.display
 */
export function ToggleBox(props: ComponentProps<'div'> & { display?: boolean | undefined }) {
	return <div {...props} class={cx('t-hidden', props.class)} />;
}
