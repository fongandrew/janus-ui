import {
	type Accessor,
	createRenderEffect,
	createSignal,
	type JSX,
	onCleanup,
	type Setter,
} from 'solid-js';

import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { pullLast } from '~/shared/utility/list';
import { PropBuilder } from '~/shared/utility/solid/prop-builder';

/** A validator function that returns an error message if validation fails */
export type Validator<T = HTMLElement> = (
	value: string,
	event: Event & { delegateTarget: T },
) => string | undefined | null | Promise<string | undefined | null>;

/** Magic data attribute used to identify control elements */
export const FORM_CONTROL_ATTR = 'data-form-control';

/** Store references for validation props for all form control elements */
const validationMap = new WeakMap<HTMLElement, FormElementControl<any, any>>();

/**
 * PropBuilder presentation of something that's a form element.
 */
export class FormElementControl<
	TTag extends keyof JSX.HTMLElementTags = keyof JSX.HTMLElementTags,
	TElement = JSX.HTMLElementTags[TTag] extends JSX.HTMLAttributes<infer T>
		? T & HTMLElement
		: HTMLElement,
> extends PropBuilder<TTag> {
	/** Validation functions */
	private validators: Validator<TElement>[] = [];

	/** Signal accessor for error message */
	error: Accessor<string | null>;
	/** Signal setter for error message */
	setError: Setter<string | null>;

	/** Public attr to mark something as having been previously validated */
	touched = false;

	constructor() {
		super();

		const [error, setError] = createSignal<string | null>(null);
		this.error = error;
		this.setError = setError;

		this.setAttr(FORM_CONTROL_ATTR, () => '');
		createRenderEffect(() => {
			const elm = this.ref();
			if (!elm) return;
			validationMap.set(elm, this);
		});
	}

	/** Set non-built in error message */
	private setCustomErr(msg: string | null) {
		this.setError(msg);
		// Might not actually be an input element so be careful with validity here
		(this.ref() as HTMLInputElement)?.setCustomValidity?.(msg ?? '');
	}

	/** Add a validator to the control */
	onValidate(fn: Validator<TElement> | null | undefined) {
		if (!fn) return;
		const list = this.validators;
		list.push(fn);
		onCleanup(() => pullLast(list, fn));
	}

	/** Validate the element, returns promise resolving to true if valid */
	async validate(event: Event) {
		const target = this.ref();
		if (!target) return false;

		// The act of validating (via submit or change) indicates this element
		// has been touched and should subsequently be revalidated on change
		this.touched = true;

		// Built-in validation
		// First unset any custom error message so it doesn't override built-ins
		(this.ref() as HTMLInputElement)?.setCustomValidity?.('');
		if ((target as Partial<HTMLInputElement>).checkValidity?.() === false) {
			this.setError((target as HTMLInputElement).validationMessage);
			return false;
		}

		// Custom validation
		const eventWithDelegate = Object.assign(event, { delegateTarget: target }) as Event & {
			delegateTarget: TElement;
		};
		const value = (target as HTMLInputElement).value ?? '';

		for (const fn of this.validators) {
			const res = await Promise.resolve(
				fn.call(target as TElement, value, eventWithDelegate),
			);
			if (res) {
				this.setCustomErr(res);
				return false;
			}
		}

		this.setCustomErr(null);
		return true;
	}
}

/** Reset touched and error state for control */
export function resetControl(elm: HTMLElement) {
	const control = validationMap.get(elm);
	if (!control) return;
	control.touched = false;
	control.setError(null);
}

/** Validate a given element, including error, and set validitity state. */
export function validate(event: Event, target: HTMLElement) {
	const control = validationMap.get(target);
	return control?.validate(event);
}

export function validateIfTouched(event: Event, target: HTMLElement) {
	const control = validationMap.get(target);
	if (!control?.touched) return;
	return control.validate(event);
}

/** Event listener for change events to revalidate the target element */
export function validateOnChange(event: Event) {
	const target = event.target as HTMLElement;
	if (!target) return;
	return validate(event, target);
}

/**
 * Get all controls in a form. This is not the same as form.elements since it only gets
 * form controls identified with our special attribute. It may include pseudo-form elements
 * like our ListBox element and will exclude any associated <input type="hidden"> elements.
 */
export function getControlElements(form: HTMLFormElement) {
	return form.querySelectorAll(`[${FORM_CONTROL_ATTR}]`) as Iterable<HTMLElement>;
}

/**
 * Returns true if a control has been touched
 */
export function isTouched(control: HTMLElement) {
	return validationMap.get(control)?.touched ?? false;
}

registerDocumentSetup((document) => {
	document.addEventListener('change', validateOnChange, true);
});
