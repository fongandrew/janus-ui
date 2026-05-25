import { registerBehavior } from '../dispatch';

function selectTab(tab: Element): void {
	const tablist = tab.closest('[role="tablist"]');
	if (!tablist) return;

	const tabs = tablist.querySelectorAll('[role="tab"]');
	for (const t of tabs) {
		const selected = t === tab;
		t.setAttribute('aria-selected', String(selected));
		const panelId = t.getAttribute('aria-controls');
		if (panelId) {
			const panel = document.getElementById(panelId);
			if (panel) {
				panel.hidden = !selected;
			}
		}
	}
}

registerBehavior('c-tabs__select', {
	click(el, ev) {
		const target = (ev.target as Element).closest('[role="tab"]');
		if (target && el.contains(target)) {
			selectTab(target);
		}
	},

	keydown(_el, ev) {
		const event = ev as KeyboardEvent;
		if (event.key === 'Enter' || event.key === ' ') {
			const target = ev.target as Element;
			if (target.getAttribute('role') === 'tab') {
				event.preventDefault();
				selectTab(target);
			}
		}
	},
});
