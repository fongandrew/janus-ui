import cx from 'classix';
import { children, createEffect, createSignal, type JSX, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { FormControlContext } from '~/shared/components/form-control-context';
import { updateAttributeList } from '~/shared/utility/attribute-list';
import { isFormControl } from '~/shared/utility/element-types';
import { generateId } from '~/shared/utility/id-generator';
import { spanify } from '~/shared/utility/solid/spanify';

export function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
	const [forId, setForId] = createSignal<string | undefined>();
	const [labelId, setLabelId] = createSignal<string | undefined>();
	const id = () => props.id ?? labelId();

	const context = useContext(FormControlContext);
	createEffect(() => {
		const input = context?.input();
		if (!input) {
			setForId(undefined);
			return;
		}

		// Set for attribute if it's actually a form element. If it isn't (e.g. a
		// div made to function like an input using ARIA attributes, then use
		// aria-labelledby instead).
		if (isFormControl(input)) {
			let inputId = input.id;
			if (!inputId) {
				inputId = generateId('input');
				input.id = inputId;
			}
			setForId(inputId);
		} else {
			let thisId = id();
			if (!thisId) {
				thisId = generateId('label');
				setLabelId(thisId);
			}
			updateAttributeList(input, 'aria-labelledby', [thisId]);
		}
	});

	const resolved = children(() => props.children);

	const maybeFocusInput = (event: Event) => {
		// If `for` already set, use native behavior
		if (forId()) return;

		const thisId = id();
		if (!thisId) return;

		const target = event.target as HTMLElement;
		const document = target.ownerDocument;
		const input = document.querySelector<HTMLElement>(`[aria-labelledby="${thisId}"]`);
		if (!input) return;
		input.focus();

		const popoverTarget = input.getAttribute('popovertarget');
		if (!popoverTarget) return;

		// For reasons that are not clear to me, showing the popover in the same tick as
		// the focus doesn't work.
		setTimeout(() => {
			document.getElementById(popoverTarget)?.showPopover();
		}, 0);
	};

	return (
		<Dynamic
			component={forId() || !context ? 'label' : 'span'}
			for={forId()}
			{...props}
			id={id()}
			class={cx('c-label', props.class)}
			onClick={maybeFocusInput}
		>
			{
				// Wrap text nodes and strings in spans to make it easier to apply
				// overflow in a way that doesn't result in focus ring clipping
				spanify(resolved.toArray())
			}
		</Dynamic>
	);
}
