/**
 * t-restore-focus (§12.2.4) — records the element that opened an overlay and
 * restores focus to it on close. Tracks openers via commandfor / popovertarget
 * triggers (keyed by target id).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const openers = new Map<string, HTMLElement>();

if (typeof document !== 'undefined') {
	document.addEventListener(
		'click',
		(ev) => {
			const trigger = (ev.target as Element | null)?.closest?.('[commandfor], [popovertarget]');
			if (!(trigger instanceof HTMLElement)) return;
			const id = trigger.getAttribute('commandfor') ?? trigger.getAttribute('popovertarget');
			if (id) openers.set(id, trigger);
		},
		true,
	);
}

function restore(el: Element): void {
	if (el.id) openers.get(el.id)?.focus();
}

registerBehavior('t-restore-focus', {
	close(el) {
		restore(el);
	},
	toggle(el, ev) {
		if (ev instanceof ToggleEvent && ev.newState === 'closed') restore(el);
	},
});

export function restoreFocus() {
	return { 'data-js': concat('t-restore-focus') };
}
