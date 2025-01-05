import { type Middleware } from '@floating-ui/dom';
import cx from 'classix';
import { type JSX, useContext } from 'solid-js';

import { createDropdown } from '~/shared/components/create-dropdown';
import { FORM_CONTROL_REF } from '~/shared/components/merge-form-control-props';
import { RefContext } from '~/shared/components/ref-context';
import { RefProvider } from '~/shared/components/ref-provider';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

/** Symbol used to identify the menu component for ref assignment purposes */
export const DROPDOWN_CONTENT_REF = Symbol('dropdown-content');

export interface DropdownContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Ref returned by createDropdown */
	ref: (el: HTMLDivElement) => void;
	/** Make children required */
	children: JSX.Element;
}

export interface DropdownProps {
	/** Positioning middleware */
	middleware?: Middleware[];
	/** Two children required -- context and menu */
	children: [JSX.Element, JSX.Element];
}

/** A simple wrapper component that applies Dropdown styling and connects to `createDropdown` */
export function DropdownContent(props: DropdownContentProps) {
	const getRefs = useContext(RefContext);
	return (
		<div
			{...props}
			ref={combineRefs(props.ref, ...getRefs(DROPDOWN_CONTENT_REF))}
			class={cx('c-dropdown', props.class)}
		/>
	);
}

/** The wrapper component */
export function Dropdown(props: DropdownProps) {
	const [setTrigger, setDropdown] = createDropdown(props);
	return (
		<>
			<RefProvider refs={{ [FORM_CONTROL_REF]: setTrigger }}>{props.children[0]}</RefProvider>
			<RefProvider refs={{ [DROPDOWN_CONTENT_REF]: setDropdown }}>
				{props.children[1]}
			</RefProvider>
		</>
	);
}
