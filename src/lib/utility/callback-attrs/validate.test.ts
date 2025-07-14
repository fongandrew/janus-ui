import { describe, expect, it } from 'vitest';

import { setAttrs } from '~/lib/utility/attribute';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import {
	createValidator,
	EXTERNAL_ERROR_ATTR,
	FORM_CONTROL_ERROR_ATTR,
	getErrorElement,
	setError,
	setErrorsByName,
	setTouched,
	touched,
	validate,
	validateChildrenOnChange,
	validateOnChange,
	validateReset,
	validateTouchedChildrenOnChange,
} from '~/lib/utility/callback-attrs/validate';
import { mount, mountStr } from '~/lib/utility/test-utils/mount';

describe('validate', () => {
	describe('validation functions', () => {
		it('should validate an element with a custom validator', () => {
			const validator = createValidator(`$p-test__${Math.random()}`, function () {
				return 'Error message';
			});

			const input = document.createElement('input');
			setAttrs(input, callbackAttrs(validator));
			mount(input);

			const event = new Event('change', { bubbles: true });
			const result = validate(input, event);

			expect(result).toBe('Error message');
			expect(input.getAttribute('aria-invalid')).toBe('true');
		});

		it('should clear error when validation passes', () => {
			const validator = createValidator(
				`$p-test__${Math.random()}`,
				function (this: HTMLInputElement) {
					return this.value ? null : 'Error message';
				},
			);

			const input = document.createElement('input');
			setAttrs(input, callbackAttrs(validator));
			mount(input);

			// First validate - should fail
			let event = new Event('change', { bubbles: true });
			let result = validate(input, event);
			expect(result).toBe('Error message');
			expect(input.getAttribute('aria-invalid')).toBe('true');

			// Now set value and validate again - should pass
			input.value = 'test';
			event = new Event('change', { bubbles: true });
			result = validate(input, event);
			expect(result).toBe(null);
			expect(input.getAttribute('aria-invalid')).toBe('false');
		});

		it('should respect built-in validation', () => {
			const input = document.createElement('input');
			input.required = true;
			mount(input);

			const event = new Event('change', { bubbles: true });
			const result = validate(input, event);

			expect(result).toBeTruthy();
			expect(input.getAttribute('aria-invalid')).toBe('true');
		});
	});

	describe('validation event handlers', () => {
		it('should validate element on change', () => {
			const validator = createValidator(`$p-test__${Math.random()}`, function () {
				return 'Error message';
			});

			const input = document.createElement('input');
			setAttrs(input, callbackAttrs(validator, validateOnChange));
			mount(input);

			const changeEvent = new Event('change', { bubbles: true });
			input.dispatchEvent(changeEvent);

			expect(input.getAttribute('aria-invalid')).toBe('true');
		});

		it('should validate all children when using validateChildrenOnChange', () => {
			const validator = createValidator(`$p-test__${Math.random()}`, function () {
				return 'Error message';
			});

			const form = mountStr(`
				<form id="form">
					<input id="input1" />
					<input id="input2" />
				</form>
			`).querySelector('#form') as HTMLFormElement;

			const input1 = form.querySelector('#input1') as HTMLInputElement;
			const input2 = form.querySelector('#input2') as HTMLInputElement;

			setAttrs(form, callbackAttrs(validateChildrenOnChange));
			setAttrs(input1, callbackAttrs(validator));
			setAttrs(input2, callbackAttrs(validator));

			const changeEvent = new Event('change', { bubbles: true });
			input1.dispatchEvent(changeEvent);

			expect(input1.getAttribute('aria-invalid')).toBe('true');
			expect(input2.getAttribute('aria-invalid')).toBe('true');
		});

		it('should only validate touched children when using validateTouchedChildrenOnChange', () => {
			const validator = createValidator(`$p-test__${Math.random()}`, function () {
				return 'Error message';
			});

			const form = mountStr(`
				<form id="form">
					<input id="input1" />
					<input id="input2" />
				</form>
			`).querySelector('#form') as HTMLFormElement;

			const input1 = form.querySelector('#input1') as HTMLInputElement;
			const input2 = form.querySelector('#input2') as HTMLInputElement;

			setAttrs(form, callbackAttrs(validateTouchedChildrenOnChange));
			setAttrs(input1, callbackAttrs(validator));
			setAttrs(input2, callbackAttrs(validator));

			// Mark only the first input as touched
			setTouched(input1, true);

			const changeEvent = new Event('change', { bubbles: true });
			input1.dispatchEvent(changeEvent);

			expect(input1.getAttribute('aria-invalid')).toBe('true');
			expect(input2.getAttribute('aria-invalid')).not.toBe('true');
		});

		it('should reset validation state when form is reset', () => {
			const validator = createValidator(`$p-test__${Math.random()}`, function () {
				return 'Error message';
			});

			const form = mountStr(`
				<form id="form">
					<input id="input" />
				</form>
			`).querySelector('#form') as HTMLFormElement;

			const input = form.querySelector('#input') as HTMLInputElement;

			setAttrs(form, callbackAttrs(validateReset));
			setAttrs(input, callbackAttrs(validator));

			// First validate to create an error
			validate(input, new Event('change', { bubbles: true }));
			expect(input.getAttribute('aria-invalid')).toBe('true');
			expect(touched(input)).toBe(true);

			// Now reset the form
			const resetEvent = new Event('reset', { bubbles: true });
			form.dispatchEvent(resetEvent);
			expect(input.getAttribute('aria-invalid')).toBe('false');
			expect(touched(input)).toBe(false);
		});
	});

	describe('error handling', () => {
		it('should set error on element', () => {
			const input = document.createElement('input');
			mount(input);

			setError(input, 'Test error');

			expect(input.getAttribute('aria-invalid')).toBe('true');
			expect((input as HTMLInputElement).validationMessage).toBe('Test error');
		});

		it('should not set error on element with external error attribute', () => {
			const input = document.createElement('input');
			input.setAttribute(EXTERNAL_ERROR_ATTR, '');
			mount(input);

			setError(input, 'Test error');

			expect(input.getAttribute('aria-invalid')).not.toBe('true');
		});

		it('should set errors by name on form elements', () => {
			const form = mountStr(`
				<form id="form">
					<input id="input1" name="first" />
					<input id="input2" name="second" />
				</form>
			`).querySelector('#form') as HTMLFormElement;

			const input1 = form.querySelector('#input1') as HTMLInputElement;
			const input2 = form.querySelector('#input2') as HTMLInputElement;

			setErrorsByName(form, {
				first: 'First error',
				second: 'Second error',
			});

			expect(input1.getAttribute('aria-invalid')).toBe('true');
			expect(input2.getAttribute('aria-invalid')).toBe('true');
			expect((input1 as HTMLInputElement).validationMessage).toBe('First error');
			expect((input2 as HTMLInputElement).validationMessage).toBe('Second error');
		});

		it('should find error element via aria-describedby', () => {
			const container = mountStr(`
				<div>
					<input id="input" aria-describedby="error-msg" />
					<div id="error-msg" ${FORM_CONTROL_ERROR_ATTR}></div>
				</div>
			`);

			const input = container.querySelector('#input') as HTMLInputElement;
			const errorEl = getErrorElement(input);

			expect(errorEl).toBeTruthy();
			expect(errorEl?.getAttribute(FORM_CONTROL_ERROR_ATTR)).toBe('');

			setError(input, 'Test error');
			expect(errorEl?.textContent).toBe('Test error');
		});

		it('should update error element text when setting error', () => {
			const container = mountStr(`
				<div>
					<input id="input" aria-describedby="error-msg" />
					<div id="error-msg" ${FORM_CONTROL_ERROR_ATTR}></div>
				</div>
			`);

			const input = container.querySelector('#input') as HTMLInputElement;
			const errorEl = container.querySelector('#error-msg') as HTMLElement;

			setError(input, 'Test error');
			expect(errorEl.textContent).toBe('Test error');

			setError(input, null);
			expect(errorEl.textContent).toBe('');
		});
	});
});
