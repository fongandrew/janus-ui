/**
 * Public API for the DOM layer (§12.4). Exports the API surface and does NOT
 * side-effect-import any handlers — pulling handlers in is a separate step
 * (import `~/lib2/dom/all` for Pattern A, or the generated bundle for Pattern B).
 */
export { DEFAULT_JS_ATTR, jsAttr, setup } from '~/lib2/dom/config';
export {
	apply,
	ca,
	CombineAttrs,
	concat,
	type ConflictMap,
	type ConflictRule,
	DEFAULT_CONFLICT_MAP,
	only,
	override,
} from '~/lib2/dom/compose-attrs';
export { type BehaviorManifest, getBehavior, registerBehavior } from '~/lib2/dom/dispatch';
export { mount } from '~/lib2/dom/mount';

// Form engine public API.
export {
	addValidator,
	isDirty,
	registerValidator,
	setErrors,
	setFormError,
	type SubmitHandler,
	type SubmitResult,
	type Validator,
} from '~/lib2/dom/form';
export { addSubmitHandler, registerSubmitHandler } from '~/lib2/dom/form';
