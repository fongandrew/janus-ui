/**
 * `c-tabs__select` — the selection half of `c-tabs` (§12.3): automatic
 * activation, selecting whichever tab receives focus (click or arrow key).
 * Pairs with `t-roving-focus` for the arrow-key movement itself; this
 * behavior owns `aria-selected` sync and showing/hiding the matching panel.
 */

import { registerBehavior } from '~/lib2/dom/dispatch';

function selectTab(tablist: Element, tab: Element): void {
	for (const candidate of tablist.querySelectorAll('[role="tab"]')) {
		const selected = candidate === tab;
		candidate.setAttribute('aria-selected', String(selected));
		candidate.setAttribute('tabindex', selected ? '0' : '-1');
		const panelId = candidate.getAttribute('aria-controls');
		const panel = panelId ? candidate.ownerDocument.getElementById(panelId) : null;
		if (panel) {
			panel.hidden = !selected;
		}
	}
}

registerBehavior('c-tabs__select', {
	mount(el) {
		const active =
			el.querySelector('[role="tab"][aria-selected="true"]') ??
			el.querySelector('[role="tab"]');
		if (active) {
			selectTab(el, active);
		}
	},
	// `focusin` (not `click`) so automatic-activation tabs (the ARIA APG default
	// pattern) select on arrow-key navigation too -- `t-roving-focus` moves focus
	// via `.focus()`, which never dispatches a `click`.
	focusin(el, ev) {
		const tab = (ev.target as Element).closest('[role="tab"]');
		if (tab && el.contains(tab)) {
			selectTab(el, tab);
		}
	},
});
