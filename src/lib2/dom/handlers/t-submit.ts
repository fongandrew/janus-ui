/**
 * t-submit — the form engine's submit behavior (§12.1). Owns the whole
 * choreography: preventDefault, validate (when t-validate is present),
 * collect FormData (aria-disabled filtered), dispatch to the named or
 * WeakMap handler, apply the result (setErrors / setFormError / reset /
 * close-on-success).
 */
import { concat, only } from '~/lib2/dom/compose-attrs';
import { jsAttr } from '~/lib2/dom/config';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { performSubmit } from '~/lib2/dom/form/submit';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';

function tokensOf(el: Element): string[] {
	return (el.getAttribute(jsAttr()) ?? '').split(/\s+/);
}

registerBehavior('t-submit', {
	submit(form, ev: Event) {
		if (!(form instanceof HTMLFormElement)) return;
		ev.preventDefault();
		const tokens = tokensOf(form);
		void performSubmit(form, {
			validate: tokens.includes('t-validate'),
			onSuccess: tokens.includes('t-close-on-success')
				? (submitted) => {
						const overlay = submitted.closest('dialog, [popover]');
						if (overlay) requestClose(overlay);
					}
				: undefined,
		});
	},
});

export function submit(handlerName?: string) {
	return handlerName
		? { 'data-js': concat('t-submit'), 'data-submit-handler': only(handlerName) }
		: { 'data-js': concat('t-submit') };
}
