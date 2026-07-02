/**
 * c-tabs__select — component-internal behavior on the tablist: click /
 * Enter / Space on a tab syncs aria-selected and panel visibility
 * (panels referenced by each tab's aria-controls).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

function selectTab(tablist: Element, tab: HTMLElement): void {
	if (tab.getAttribute('aria-disabled') === 'true') return;
	const doc = tablist.ownerDocument;
	for (const other of tablist.querySelectorAll('[role="tab"]')) {
		const selected = other === tab;
		other.setAttribute('aria-selected', String(selected));
		const panelId = other.getAttribute('aria-controls');
		const panel = panelId ? doc.getElementById(panelId) : null;
		if (panel) panel.hidden = !selected;
	}
}

function tabFromEvent(ev: Event): HTMLElement | null {
	const target = ev.target;
	if (!(target instanceof Element)) return null;
	return target.closest('[role="tab"]');
}

registerBehavior('c-tabs__select', {
	click(el, ev: Event) {
		const tab = tabFromEvent(ev);
		if (tab) selectTab(el, tab);
	},

	keydown(el, ev: KeyboardEvent) {
		if (ev.key !== 'Enter' && ev.key !== ' ') return;
		const tab = tabFromEvent(ev);
		if (tab) {
			ev.preventDefault();
			selectTab(el, tab);
		}
	},
});

export function tabsSelect() {
	return { 'data-js': concat('c-tabs__select') };
}
