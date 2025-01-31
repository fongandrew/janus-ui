import '~/shared/components/label.css';

import cx from 'classix';
import { children, createMemo, createRenderEffect, createSignal, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useFormElement } from '~/shared/components/form-element-context';
import { isFormControl } from '~/shared/utility/element-types';
import { generateId } from '~/shared/utility/id-generator';
import { spanify } from '~/shared/utility/solid/spanify';

export function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
	const formElement = useFormElement();
	const id = createMemo(() => props.id ?? generateId('label'));

	// Two modes: Render an actual `label` element with a `for` attribute, or a
	// `span` element with an `aria-labelledby` attribute. The latter is used when
	// the input is not a real input element (e.g. a div with ARIA attributes to
	// simulate an input).
	const [mode, setMode] = createSignal<'label' | 'span'>('label');
	createRenderEffect(() => {
		const inputElm = formElement?.ref();
		if (!inputElm) return;
		setMode(isFormControl(inputElm) ? 'label' : 'span');
	});

	formElement?.setAttr('aria-labelledby', () => (mode() === 'span' ? id() : undefined));
	const resolved = children(() => props.children);
	const maybeFocusInput = (event: Event) => {
		// If we're in <label> mode, use native behavior with `for`
		if (mode() === 'label') return;

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
			{...props}
			component={mode()}
			for={formElement?.id()}
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
