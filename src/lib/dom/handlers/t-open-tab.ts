import { registerBehavior } from '../dispatch';
import { concat, only } from '../compose-attrs';

registerBehavior('t-open-tab', {
	click(el, ev) {
		ev.preventDefault();
		const panelId = el.getAttribute('data-target');
		if (panelId) {
			const panel = document.getElementById(panelId);
			if (panel) panel.focus();
		}
	},
});

export function openTab(panelId: string) {
	return {
		'data-js': concat('t-open-tab'),
		'data-target': only(panelId),
	};
}
