import cx from 'classix';
import { type ComponentProps, type JSX } from 'solid-js';

export interface DescriptionProps extends ComponentProps<'div'> {
	/** ID required for linking to input element */
	id: string;
}

/**
 * Description text, generally following a label
 */
export function BaseDescription(props: ComponentProps<'div'>) {
	return <div {...props} class={cx('c-description', props.class)} />;
}

/**
 * Re-export with required ID for linking to input element. Base exists for cases
 * where we just want styling.
 */
export const Description = BaseDescription as (props: DescriptionProps) => JSX.Element;
