/**
 * The form engine's public API (§12.1). Behaviors (t-validate, t-submit,
 * t-validate-group, t-validate-error, t-reset-on-close, t-close-on-success)
 * live under handlers/ and follow the filename-as-manifest convention.
 */
export {
	addSubmitHandler,
	registerSubmitHandler,
	setFormError,
	type SubmitHandler,
	type SubmitResult,
} from '~/lib2/dom/form/submit';
export {
	addValidator,
	isDirty,
	registerValidator,
	resetForm,
	setErrors,
	type Validator,
} from '~/lib2/dom/form/validate';
