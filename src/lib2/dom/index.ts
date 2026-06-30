/**
 * Public API surface (§12.4). Importing this module does **not**
 * side-effect-import any handlers — pulling handlers in is a separate step,
 * satisfied by either `~/lib2/dom/all` (Pattern A, the everything bundle)
 * or the SSR-driven purge plugin's generated entry (Pattern B).
 */

export type {
	AttrPrimitive,
	AttrRules,
	AttrSource,
	AttrValue,
	WrapKind,
	Wrapped,
} from '~/lib2/dom/compose-attrs';
export { apply, ca, CombineAttrs, concat, only, override } from '~/lib2/dom/compose-attrs';
export { JS_ATTR, setup } from '~/lib2/dom/config';
export type { BehaviorHandler, BehaviorManifest, DomEventName } from '~/lib2/dom/dispatch';
export { registerBehavior } from '~/lib2/dom/dispatch';
export { registerDocument, registerDocumentSetup } from '~/lib2/dom/document-setup';
export type { SubmitHandler, SubmitResult } from '~/lib2/dom/form/submit';
export { addSubmitHandler, registerSubmitHandler } from '~/lib2/dom/form/submit';
export type { FormField, Validator } from '~/lib2/dom/form/validate';
export {
	addValidator,
	isDirty,
	isTouched,
	registerValidator,
	runValidators,
	setErrors,
	setFormError,
	touchAll,
	validateForm,
} from '~/lib2/dom/form/validate';
export { mount, unmount } from '~/lib2/dom/mount';
export {
	elmDoc,
	elmWin,
	evtDoc,
	evtWin,
	parentDocument,
	parentWindow,
} from '~/lib2/dom/multi-view';
