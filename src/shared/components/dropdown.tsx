import { type Middleware } from '@floating-ui/dom';
import cx from 'classix';
import { type JSX, splitProps, useContext } from 'solid-js';

import { Button } from '~/shared/components/button';
import { createDropdown } from '~/shared/components/create-dropdown';
import { FORM_CONTROL_REF } from '~/shared/components/merge-form-control-props';
import { RefContext } from '~/shared/components/ref-context';
import { RefProvider } from '~/shared/components/ref-provider';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { T } from '~/shared/utility/text/t-components';

/** Symbol used to identify the menu component for ref assignment purposes */
export const DROPDOWN_CONTENT_REF = Symbol('dropdown-content');

export interface DropdownContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Force ref to be callback */
	ref?: ((el: HTMLDivElement) => void) | undefined;
	/** Make children required */
	children: JSX.Element;
}

export interface DropdownProps {
	/** Positioning middleware */
	middleware?: Middleware[];
	/**
	 * Two children required -- context and menu. And must be render funcs
	 * for us to set context properly.
	 */
	children: [() => JSX.Element, () => JSX.Element];
}

/** A wrapper component that applies Dropdown styling and connects to `createDropdown` */
export function DropdownContent(props: DropdownContentProps) {
	const getRefs = useContext(RefContext);
	const [local, rest] = splitProps(props, ['children']);

	const closePopover = (e: MouseEvent | KeyboardEvent) => {
		const target = e.target as HTMLElement;
		const popover = target.closest(':popover-open') as HTMLElement | null;
		popover?.hidePopover();
	};

	return (
		<div
			{...rest}
			ref={combineRefs(props.ref, ...getRefs(DROPDOWN_CONTENT_REF))}
			class={cx('c-dropdown__content', props.class)}
		>
			<div class="c-dropdown__children">{local.children}</div>
			<div class="c-dropdown__footer">
				<Button class="c-button--ghost c-button--sm" onClick={closePopover} unsetFormInput>
					<T>Close</T>
				</Button>
			</div>
		</div>
	);
}

/** The wrapper component */
export function Dropdown(props: DropdownProps) {
	const [setTrigger, setDropdown] = createDropdown(props);
	return (
		<>
			<RefProvider refs={{ [FORM_CONTROL_REF]: setTrigger }}>
				{props.children[0]()}
			</RefProvider>
			<RefProvider refs={{ [DROPDOWN_CONTENT_REF]: setDropdown }}>
				{props.children[1]()}
			</RefProvider>
		</>
	);
}
