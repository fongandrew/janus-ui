import {
	runAfterHideCallbacks,
	runBeforeShowCallbacks,
} from '~/shared/utility/callback-attrs/display';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { elmDoc } from '~/shared/utility/multi-view';
import { nextIndex } from '~/shared/utility/next-index';

/**
 * Handle keydown events on tab bar
 */
export const tabKeyDown = createHandler(
	'keydown',
	'$c-tab__keydown',
	(event, mode: 'auto' | 'manual' = 'auto') => {
		const tabBtn = event.target as HTMLButtonElement;

		const tabList = tabBtn.closest<HTMLElement>('[role="tablist"]');
		if (!tabList) return;

		const tabBtns = Array.from(tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
		const currentIndex = Math.max(tabBtns.indexOf(tabBtn), 0);

		const orientation = tabList.getAttribute('aria-orientation') || 'horizontal';
		const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
		const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';

		let newIndex: number | undefined;
		switch (event.key) {
			case prevKey:
				event.preventDefault();
				newIndex = nextIndex(tabBtns, currentIndex, -1, true);
				break;
			case nextKey:
				event.preventDefault();
				newIndex = nextIndex(tabBtns, currentIndex, 1, true);
				break;
			case 'Home':
				event.preventDefault();
				newIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				newIndex = tabBtns.length - 1;
				break;
			case 'Enter':
			case ' ': {
				event.preventDefault();
				switchTabPanel(tabList, tabBtn);
				return;
			}
		}

		if (newIndex === undefined) return;

		const nextTabBtn = tabBtns[newIndex];
		if (!nextTabBtn) return;

		nextTabBtn.focus();

		if (mode === 'auto') {
			switchTabPanel(tabList, nextTabBtn);
		}
	},
);

/**
 * Handle click events on tab bar
 */
export const tabClick = createHandler('click', '$c-tab__click', (event) => {
	const tabBtn = (event.target as HTMLElement)?.closest<HTMLButtonElement>('[role="tab"]');
	if (!tabBtn) return;

	const tabList = tabBtn.closest<HTMLElement>('[role="tablist"]');
	if (!tabList) return;

	switchTabPanel(tabList, tabBtn);
});

/**
 * Active the tab panel for a given tab button
 */
function switchTabPanel(tabList: HTMLElement, tabBtn: HTMLButtonElement) {
	const prevTabBtn = tabList.querySelector<HTMLButtonElement>('[aria-selected="true"]');
	if (prevTabBtn === tabBtn) return;

	const tabId = tabBtn.getAttribute('aria-controls');
	const prevTabId = prevTabBtn?.getAttribute('aria-controls');

	const tab = tabId && elmDoc(tabList)?.getElementById(tabId);
	if (tab) {
		runBeforeShowCallbacks(tab);
	}

	if (prevTabBtn) {
		prevTabBtn.setAttribute('aria-selected', 'false');
		prevTabBtn.tabIndex = -1;
	}

	tabBtn.setAttribute('aria-selected', 'true');
	tabBtn.tabIndex = 0;

	const prevTab = prevTabId && elmDoc(prevTabBtn)?.getElementById(prevTabId);
	if (prevTab) {
		prevTab.tabIndex = -1;
		prevTab.ariaHidden = 'true';
		runAfterHideCallbacks(prevTab);
	}

	if (tab) {
		tab.tabIndex = 0;
		tab.ariaHidden = 'false';
	}

	tabBtn.dispatchEvent(new Event('change', { bubbles: true }));
}
