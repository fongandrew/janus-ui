export { setup } from './config';
export { ca, only, concat, override, CombineAttrs, type Attrs } from './compose-attrs';
export { registerBehavior, getBehavior } from './dispatch';
export { mount, unmount } from './mount';
export {
	registerValidator,
	addValidator,
	isDirty,
	isTouched,
	markTouched,
	markAllTouched,
	markDirty,
	clearDirty,
	setServerError,
	clearServerError,
	validateElement,
	writeError,
	resetValidationState,
	registerSubmitHandler,
	addSubmitHandler,
	isSubmitting,
	setErrors,
	setFormError,
	handleSubmit,
	type SubmitHandler,
	type SubmitResult,
	type Validator,
} from './form';
