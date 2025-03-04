import cx from 'classix';
import { type JSX } from 'solid-js';

export interface DescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ID required for linking to input element */
	id: string;
}

/**
 * Description text, generally following a label
 */
export function Description(props: DescriptionProps) {
	return <div {...props} class={cx('c-description', props.class)} />;
}
