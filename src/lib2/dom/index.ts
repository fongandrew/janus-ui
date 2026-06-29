/**
 * Public API for the DOM layer (§12.4).
 *
 * This entry exports the API surface and does **not** side-effect-import any
 * handlers. Pull handlers in separately via `~/lib2/dom/all` (Pattern A) or the
 * SSR-driven bundle plugin (Pattern B).
 */
export {
	apply,
	ca,
	CombineAttrs,
	type Combiner,
	concat,
	only,
	override,
	type Strategy,
} from '~/lib2/dom/compose-attrs';
export { type JanusConfig, JS_ATTR, jsAttr, setup } from '~/lib2/dom/config';
export {
	type BehaviorManifest,
	type EventHook,
	getBehavior,
	type MountHook,
	registerBehavior,
} from '~/lib2/dom/dispatch';
export { firstFocusable, focusables } from '~/lib2/dom/focusables';
export {
	addSubmitHandler,
	addValidator,
	installFormEngine,
	isDirty,
	registerSubmitHandler,
	registerValidator,
	setErrors,
	setFormError,
	type SubmitHandler,
	type SubmitResult,
	type Validator,
} from '~/lib2/dom/form';
export { mount, unmount } from '~/lib2/dom/mount';

// Note: `onRequestClose` / `forceClose` live in `~/lib2/dom/handlers/t-request-close`.
// They are not re-exported here because importing that module registers a behavior
// as a side effect, and this entry is deliberately handler-side-effect-free (§12.4).
