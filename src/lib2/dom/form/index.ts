/** Public API for the form engine (§12.1). */

export type { SubmitHandler, SubmitResult } from '~/lib2/dom/form/submit';
export { addSubmitHandler, registerSubmitHandler } from '~/lib2/dom/form/submit';
export type { FormField, Validator } from '~/lib2/dom/form/validate';
export {
	addValidator,
	isDirty,
	isTouched,
	registerValidator,
	resetFieldState,
	runValidators,
	setErrors,
	setFormError,
	touchAll,
	validateForm,
} from '~/lib2/dom/form/validate';
