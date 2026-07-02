/**
 * Public API surface (§12.4). Deliberately does NOT side-effect-import any
 * handler module — pulling handlers in is a separate step: import
 * '~/lib2/dom/all' (Pattern A) or the generated entry from
 * vite-plugin-janus-bundle (Pattern B).
 */
export {
	apply,
	type Attrs,
	ca,
	CombineAttrs,
	concat,
	only,
	override,
} from '~/lib2/dom/compose-attrs';
export { JS_ATTR, jsAttr, setup } from '~/lib2/dom/config';
export { type BehaviorManifest, onMount, registerBehavior } from '~/lib2/dom/dispatch';
export {
	addSubmitHandler,
	addValidator,
	isDirty,
	registerSubmitHandler,
	registerValidator,
	resetForm,
	setErrors,
	setFormError,
	type SubmitHandler,
	type SubmitResult,
	type Validator,
} from '~/lib2/dom/form';
export { mount, unmountObserver } from '~/lib2/dom/mount';
