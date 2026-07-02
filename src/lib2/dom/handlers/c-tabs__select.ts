/**
 * c-tabs__select (§12.3) — click a tab to select it: syncs aria-selected across
 * the tablist and toggles panel visibility via each tab's aria-controls.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

function selectTab(list: Element, tab: Element): void {
	const tabs = [...list.querySelectorAll('[role="tab"]')];
	for (const t of tabs) {
		const selected = t === tab;
		t.setAttribute('aria-selected', selected ? 'true' : 'false');
		(t as HTMLElement).tabIndex = selected ? 0 : -1;
		const panelId = t.getAttribute('aria-controls');
		if (panelId) {
			const panel = t.ownerDocument.getElementById(panelId);
			panel?.toggleAttribute('hidden', !selected);
		}
	}
}

registerBehavior('c-tabs__select', {
	click(el, ev) {
		const tab = (ev.target as Element | null)?.closest('[role="tab"]');
		if (tab && el.contains(tab) && tab.getAttribute('aria-disabled') !== 'true') selectTab(el, tab);
	},
	keydown(el, ev) {
		// Roving focus moves the tabstop; Enter/Space selects the focused tab.
		const e = ev as KeyboardEvent;
		if (e.key !== 'Enter' && e.key !== ' ') return;
		const tab = (ev.target as Element | null)?.closest('[role="tab"]');
		if (tab && el.contains(tab)) {
			e.preventDefault();
			selectTab(el, tab);
		}
	},
});

export function tabsSelect() {
	return { 'data-js': concat('c-tabs__select') };
}
