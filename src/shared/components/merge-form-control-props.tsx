import {
	type Accessor,
	createSignal,
	type JSX,
	mergeProps,
	onCleanup,
	splitProps,
	useContext,
} from 'solid-js';
import { isServer } from 'solid-js/web';

import { RefContext } from '~/shared/components/ref-context';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { syncOrPromise } from '~/shared/utility/sync-or-promise';
import { T } from '~/shared/utility/text/t-components';

/** RefProvider symbol form inputs and buttons that need to be labeled */
export const FORM_CONTROL_REF = Symbol('form-control');

/** Magic data attribute used to identify control elements */
export const FORM_CONTROL_ATTR = 'data-form-control';

// Turn `aria-disabled` into `disabled` for form controls

/** Listener that selectively disables event propagation if aria-disabled */
function preventDefaultIfAriaDisabled(event: Event) {
	const target = event.target as HTMLElement;
	if (!target) return;

	const closestAriaDisabled = target.closest('[aria-disabled]');
	if (closestAriaDisabled && closestAriaDisabled?.getAttribute('aria-disabled') !== 'false') {
		if (event instanceof KeyboardEvent) {
			// Need to allow tabbing off disabled element
			if (event.key === 'Tab') return;
			// For toolbars + radios, arrow key allows moving selection
			// Exception for aria-haspopup elements since arrow means "open popup"
			if (event.key.startsWith('Arrow') && !closestAriaDisabled.ariaHasPopup) return;
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	}
}

registerDocumentSetup((document) => {
	const relevantEvents = [
		'click',
		'dblclick',
		'input',
		'keydown',
		'keyup',
		'mousedown',
		'mouseup',
		'paste',
	];

	relevantEvents.forEach((eventName) => {
		document.addEventListener(eventName, preventDefaultIfAriaDisabled, true);
	});
});

// Error and validation

/** Interface exposed to force element revalidation */
export interface ErrorValidationProps {
	/**
	 * Force a revalidation + state change, returns error message if any
	 * (or promise of error msg)
	 */
	revalidate: (
		event: Event | SubmitEvent,
	) => (() => JSX.Element) | null | Promise<(() => JSX.Element) | null>;
	/** Signal that returns (a function that returns) current error message, if any */
	error: Accessor<(() => JSX.Element) | null>;
	/** Signal setter for error */
	setError: (error: (() => JSX.Element) | null) => void;
	/**
	 * Signal for whether an input has been touched (focused). Used to guard against
	 * excessive validation on initial render.
	 */
	touched: Accessor<boolean>;
	/** Signal setter for touched */
	setTouched: (touched: boolean) => void;
}

/** Store references for validation props for all form control elements */
export const errorValidationMap = new WeakMap<HTMLElement, ErrorValidationProps>();

/** Event listener for change events to revalidate the target element */
function revalidateOnChange(event: Event) {
	const target = event.target as HTMLElement;
	if (!target) return;

	const validationProps = errorValidationMap.get(target);
	if (!validationProps) return;

	validationProps.revalidate(event);
}

registerDocumentSetup((document) => {
	document.addEventListener('change', revalidateOnChange, true);
});

/** Some built in validation based on props */
function builtInValidation(elm: HTMLElement) {
	if (elm.ariaRequired || (elm as HTMLInputElement).required) {
		if (!(elm as HTMLInputElement).value) {
			return () => (
				<div>
					<T>This field is required.</T>
				</div>
			);
		}
	}

	return null;
}

////

export interface FormControlProps<T extends HTMLElement = HTMLElement> {
	/**
	 * Callback ref for the input element -- sort of annoying to cast to any but otherwise
	 * TypeScript complains when trying to assign more specific ref handlers to this
	 */
	ref?: ((element: T) => void) | undefined;
	/** Whether the input is disabled */
	disabled?: boolean | undefined;
	/** Prefer disabled but if `aria-disabled` specified directly, handle gracefully */
	'aria-disabled'?: JSX.HTMLAttributes<HTMLInputElement>['aria-disabled'] | undefined;
	/** Whether the input has an invalid value */
	invalid?: boolean | undefined;
	/** Prefer invalid but if `aria-invalid` specified directly, handle gracefully */
	'aria-invalid'?: JSX.HTMLAttributes<HTMLInputElement>['aria-invalid'] | undefined;
	/** Whether the input is required */
	required?: boolean | undefined;
	/** Prefer `required` but if `aria-required` specified directly, handle gracefully */
	'aria-required'?: JSX.HTMLAttributes<HTMLInputElement>['aria-required'] | undefined;
	/** Custom validation function -- return false to mark element as invalid */
	onValidate?: (
		event: (Event | SubmitEvent) & { delegateTarget: T },
	) => (() => JSX.Element) | null | Promise<(() => JSX.Element) | null>;
	/**
	 * By default, we will set this as the input in the form control context.
	 * This can be opted out of (e.g. for secondary controls) via this props.
	 */
	unsetFormInput?: boolean | undefined;
}

/** Solid JS hook to modify props for input elements and other form-like things */
export function mergeFormControlProps<
	TElement extends HTMLElement,
	TProps extends FormControlProps<TElement>,
>(props: TProps, ...extraRefs: ((element: TElement) => void)[]) {
	let thisElement: HTMLElement | undefined;

	const [local, rest] = splitProps(props, [
		'aria-disabled',
		'aria-invalid',
		'aria-required',
		'disabled',
		'invalid',
		'ref',
		'required',
		'onValidate',
		'unsetFormInput',
	]) as [FormControlProps, any];

	const [error, innerSetError] = createSignal<(() => JSX.Element) | null>(null);
	const [touched, setTouched] = createSignal(false);
	const revalidate = (event: Event | SubmitEvent) => {
		if (!thisElement) return null;

		const result =
			builtInValidation(thisElement) ??
			local.onValidate?.(Object.assign(event, { delegateTarget: thisElement })) ??
			null;
		return syncOrPromise(result, (promiseResult) => {
			innerSetError(() => promiseResult ?? null);
			return promiseResult;
		});
	};

	const thisRef = (el: HTMLElement) => {
		thisElement = el;
		errorValidationMap.set(el, {
			revalidate,
			error,
			// Use functional form of signal setter because value may be function.
			// JSX elements are always functions so we can force rendering within
			// a particular context if needed and ensure proper ownership / GC.
			setError: (val) => innerSetError(() => val),
			touched,
			setTouched,
		});
	};

	onCleanup(() => {
		if (thisElement) {
			errorValidationMap.delete(thisElement);
		}
	});

	const getRefs = useContext(RefContext);

	const merged = mergeProps(rest, {
		// Assign input to form control context if it exists
		get ref() {
			return combineRefs(
				thisRef,
				...(local.unsetFormInput ? [] : getRefs(FORM_CONTROL_REF)),
				local.ref,
				...extraRefs,
			);
		},
		// Switch disabled to aria-disabled if it exists (and we're on the client)
		get ['aria-disabled']() {
			return local['aria-disabled'] ?? local.disabled;
		},
		get disabled() {
			return isServer ? local.disabled : undefined;
		},
		// Switch required to aria-required if it exists (and we're on the client)
		get ['aria-required']() {
			return local['aria-required'] ?? local.required;
		},
		get required() {
			return isServer ? local.required : undefined;
		},
		// Error state can be triggered via either signal or prop but prop overrides
		get ['aria-invalid']() {
			return (local['aria-invalid'] ?? local.invalid ?? error()) ? true : undefined;
		},
		//
		// Set attr for ease of identifying via DOM
		[FORM_CONTROL_ATTR]: '',
	});
	return merged as Omit<TProps, 'disabled' | 'unsetFormInput'> & { 'aria-disabled': boolean };
}
