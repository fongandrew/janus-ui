/**
 * `c-tabs__select` — sync `aria-selected` and panel visibility for a tablist
 * (§12.3). Sits alongside `t-roving-focus` on the `[role="tablist"]`. Selection
 * follows focus (automatic activation) and click.
 */
import { registerBehavior } from '~/lib2/dom/dispatch';

function tabs(tablist: HTMLElement): HTMLElement[] {
	return Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]'));
}

function select(tablist: HTMLElement, tab: HTMLElement): void {
	const doc = tablist.ownerDocument;
	for (const t of tabs(tablist)) {
		const selected = t === tab;
		t.setAttribute('aria-selected', selected ? 'true' : 'false');
		const panelId = t.getAttribute('aria-controls');
		const panel = panelId && doc.getElementById(panelId);
		if (panel) panel.toggleAttribute('hidden', !selected);
	}
}

function handle(tablist: HTMLElement, ev: Event): void {
	const target = ev.target;
	if (!(target instanceof HTMLElement)) return;
	const tab = target.closest<HTMLElement>('[role="tab"]');
	if (tab && tablist.contains(tab)) select(tablist, tab);
}

registerBehavior('c-tabs__select', {
	click: handle,
	focusin: handle,
});
