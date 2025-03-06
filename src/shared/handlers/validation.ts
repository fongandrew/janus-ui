import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { createHandler, HANDLER_ATTR } from '~/shared/utility/event-handler-attrs';
import { createMagicProp } from '~/shared/utility/magic-prop';
import { data } from '~/shared/utility/magic-strings';
import { elmDoc } from '~/shared/utility/multi-view';
import { type Falsey } from '~/shared/utility/type-helpers';

/**
 * A validator processes an event (a change or submit event probably) for a given
 * element (passed via `this` and `event.currentTarget`). It should return either
 * nothing (if fine) or a string error message for an error.
 *
 * Validators must be synchronous. To do async validation, hook into form submit
 * or change events as needed and call `setError` on affected elements.
 */
export type Validator<T extends HTMLElement = HTMLElement> = (
	this: T,
	event: Event & { currentTarget: T },
) => string | undefined | null;

/**
 * Magic data attribute used to identify control elements (form.elements is insufficient
 * since we want to also include custom controls with ARIA props)
 */
export const FORM_CONTROL_ATTR = data('form-control');

/**
 * Magic data attribute used to identify an error element associated with a control
 */
export const FORM_CONTROL_ERROR_ATTR = data('validation__error');

/**
 * Magic data attribute used to identify elements with custom validators
 */
export const VALIDATE_ATTR = data('validation');

/**
 * Magic prop for marking an input as having been "touched" for validation purposes
 */
export const [touched, setTouched] = createMagicProp<boolean>();

/**
 * Registry mapping event types to IDs to validation functions.
 */
const validationRegistry: Record<string, Validator<any>> = {};

/** Registers a validation function with a given ID */
export function addValidator<T extends HTMLElement>(
	validatorId: string,
	validator: Validator<T>,
): void {
	validationRegistry[validatorId] = validator;
}

/** Unregisters the validation function associated with a given ID */
export function removeValidator(validatorId: string): void {
	delete validationRegistry[validatorId];
}

/**
 * Run any validators associated with this element on change
 */
export const validateOnChange = createHandler('change', 'validate__change', (event) => {
	validate(event.delegateTarget, event);
});

/**
 * Run any validators on children with validateOnChange within this element as a result
 * of a change event.
 */
export const validateChildrenOnChange = createHandler(
	'change',
	'validate__children-change',
	(event) => {
		const elm = event.delegateTarget as HTMLElement;
		for (const child of getValidatableElements(elm)) {
			validate(child as HTMLElement, event);
		}
	},
);

/**
 * Run any validators on children with validateOnChange within this element as a result
 * of a change event but only if the chidlren have been touched
 */
export const validateTouchedChildrenOnChange = createHandler(
	'change',
	'validate__children-change',
	(event) => {
		const elm = event.delegateTarget as HTMLElement;
		for (const child of getValidatableElements(elm)) {
			if (touched(child as HTMLElement)) {
				validate(child as HTMLElement, event);
			}
		}
	},
);

/**
 * Reset touched and error state for form
 */
export const validateReset = createHandler('reset', 'validate__reset', (event) => {
	const form = event.target as HTMLFormElement;
	for (const child of getValidatableElements(form)) {
		setTouched(child as HTMLElement, false);
		setError(child as HTMLElement, null);
		(child as Partial<HTMLInputElement>).setCustomValidity?.('');
	}
});

/**
 * Create a function that will lazily register the validation function with the
 * registry and returns the given ID.
 */
export function createValidator<T extends HTMLElement = HTMLElement>(
	validatorId: string,
	onValidate: Validator<T>,
) {
	function register() {
		addValidator<T>(validatorId, function (this: T, event) {
			return register.do.call(this, event);
		});
		return validatorId;
	}

	// Stick original handler on the function so it can be easily composed with other handlers
	// or spied on for tests
	register.do = onValidate;

	return register;
}

/**
 * Set an error message on any error element describing the target element.
 */
export function setError(target: HTMLElement, msg: string | null) {
	target.setAttribute('aria-invalid', msg ? 'true' : 'false');

	const currentMsg = (target as HTMLInputElement).validationMessage;
	if ((msg ?? '') !== currentMsg) {
		(target as Partial<HTMLInputElement>).setCustomValidity?.(msg ?? '');
	}

	const errorElm = getErrorElement(target);
	if (errorElm) {
		errorElm.textContent = msg ?? '';
	}

	// Dispatching invalid to mimic built-in navigation. No reason to make it
	// bubble just yet but could add here in the future.
	if (msg) {
		target.dispatchEvent(new Event('invalid'));
	}
}

/**
 * Set potentially multiple error messages on form elements by name (meant to be used
 * with async validation errors from API)
 */
export function setErrorsByName(form: HTMLFormElement, errors: Record<string, string>) {
	for (const child of getValidatableElements(form)) {
		// Use attribute rather than property since synthetic form elements
		// may not have a name property
		const name = child.getAttribute('name');
		if (name) {
			const error = errors[name];
			if (error) {
				setError(child, error);
			}
			delete errors[name];
			continue;
		}
		setError(child, null);
	}
}

/**
 * Validate a given element.
 */
export function validate<T extends HTMLElement>(elm: T, event: Event): string | null {
	// The act of validating (via submit or change) indicates this element
	// has been touched and should subsequently be revalidated on change
	setTouched(elm, true);

	// Built-in validation
	// First unset any custom error message so it doesn't override built-ins
	(elm as Partial<HTMLInputElement>).setCustomValidity?.('');
	if ((elm as Partial<HTMLInputElement>).checkValidity?.() === false) {
		const msg = (elm as T & HTMLInputElement).validationMessage;
		setError(elm, msg);
		return msg;
	}

	// Custom validation
	Object.defineProperty(event, 'currentTarget', {
		configurable: true,
		value: elm,
	});

	const validatorIds = elm.getAttribute(VALIDATE_ATTR)?.split(/\s/) ?? [];
	for (const id of validatorIds) {
		const fn = validationRegistry[id];
		if (!fn) continue;

		const res = fn.call(elm, event);
		if (res) {
			setError(elm, res);
			return res;
		}
	}

	setError(elm, null);
	return null;
}

/**
 * Convenience function to return a spreadable props object with the validator ID(s)
 */
export function validatorProps(
	...validatorOrProps: (Record<string, any> | string | (() => string) | Falsey)[]
): Record<string, string> {
	const ids: string[] = [];
	for (const idOrProps of validatorOrProps) {
		if (!idOrProps) continue;
		switch (typeof idOrProps) {
			case 'string':
				ids.push(idOrProps);
				break;
			case 'function':
				ids.push(idOrProps());
				break;
			case 'object':
				if (idOrProps[VALIDATE_ATTR]) ids.push(idOrProps[VALIDATE_ATTR] as string);
				break;
		}
	}
	return { [VALIDATE_ATTR]: ids.join(' ') };
}

/**
 * Convenience function to use handler props with a prop mod
 */
export function extendValidatorProps(...validatorIds: (string | (() => string) | Falsey)[]) {
	return {
		[VALIDATE_ATTR]: (prevIds: string | undefined) => {
			const ids = prevIds ? [prevIds] : [];
			for (const id of validatorIds) {
				if (!id) continue;
				if (typeof id === 'string') ids.push(id);
				else ids.push(id());
			}
			return ids.join(' ');
		},
	};
}

/**
 * Get all validatable elements within a container. Validation may happen on
 * any input or custom elements with a validation handler.
 */
export function getValidatableElements(container: HTMLElement): Iterable<HTMLElement> {
	return container.querySelectorAll<HTMLElement>(
		`input,[${HANDLER_ATTR}~="${validateOnChange()}"]`,
	);
}

/**
 * Get the error element associated with a given control element
 */
export function getErrorElement(target: HTMLElement): HTMLElement | null {
	const document = elmDoc(target);
	const describedBy = target.getAttribute('aria-describedby')?.split(/\s/) ?? [];
	for (const id of describedBy) {
		const elm = document.getElementById(id);
		if (elm?.hasAttribute(FORM_CONTROL_ERROR_ATTR)) {
			return elm;
		}
	}
	return null;
}

/**
 * Focus on the first error element within a container
 */
export function focusOrScrollToError(container: HTMLElement) {
	for (const child of getValidatableElements(container)) {
		if (child.matches(':invalid,[aria-invalid="true"]')) {
			child.focus();
			return;
		}
	}

	// See if there's a form-wide element to scroll to (don't worry
	// about focus since we'll rely on an alert or similar to notify)
	const errorElement = getErrorElement(container);
	errorElement?.scrollIntoView({ block: 'nearest' });
}

registerDocumentSetup((document) => {
	// Setup listener in capture mode so synchronous validation can block
	// submit if needed.
	document.addEventListener(
		'submit',
		async (event) => {
			const form = event.target as HTMLFormElement;

			// We could stop after first error but may be helpful for user to
			// validate everything so they can fix before resubmit.
			let hasValidationErrors = false;
			for (const child of getValidatableElements(form)) {
				if (validate(child as HTMLElement, event)) {
					hasValidationErrors = true;
				}
			}

			// If no field errors, validate the form itself
			hasValidationErrors = hasValidationErrors || !!validate(form, event);

			if (hasValidationErrors) {
				event.preventDefault();
				event.stopPropagation();
				focusOrScrollToError(form);
			}
		},
		true,
	);
});
