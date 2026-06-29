/**
 * Public API for the form engine (§12.1).
 *
 * Importing this module does **not** install the engine listeners — that happens
 * when a form behavior handler (`handlers/t-validate.ts`, etc.) is imported, or
 * when `installFormEngine()` is called explicitly.
 */
export {
	addSubmitHandler,
	installFormEngine,
	registerSubmitHandler,
	type SubmitHandler,
	type SubmitResult,
} from '~/lib2/dom/form/submit';
export {
	addValidator,
	getErrorElement,
	getValidatableElements,
	isDirty,
	registerValidator,
	setError,
	setErrors,
	setFormError,
	validateField,
	validateForm,
	type Validator,
} from '~/lib2/dom/form/validate';
