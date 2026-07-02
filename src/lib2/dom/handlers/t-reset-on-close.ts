/**
 * t-reset-on-close — reset the form when its ancestor <dialog> closes (or
 * [popover] toggles closed) (§12.1). close/toggle don't bubble; a single
 * capture-phase document listener (installed on first mount) descends to
 * the overlay target and resets any opted-in forms inside it.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { jsAttr } from '~/lib2/dom/config';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { resetForm } from '~/lib2/dom/form/validate';

let installed = false;

function resetWithin(overlay: Element): void {
	for (const form of overlay.querySelectorAll('form')) {
		if ((form.getAttribute(jsAttr()) ?? '').split(/\s+/).includes('t-reset-on-close')) {
			resetForm(form);
		}
	}
}

function install(): void {
	if (installed || typeof document === 'undefined') return;
	installed = true;
	document.addEventListener(
		'close',
		(ev) => {
			if (ev.target instanceof Element) resetWithin(ev.target);
		},
		true,
	);
	document.addEventListener(
		'toggle',
		(ev) => {
			const toggle = ev as ToggleEvent;
			if (toggle.newState === 'closed' && ev.target instanceof Element) {
				resetWithin(ev.target);
			}
		},
		true,
	);
}

registerBehavior('t-reset-on-close', { mount: install });

export function resetOnClose() {
	return { 'data-js': concat('t-reset-on-close') };
}
