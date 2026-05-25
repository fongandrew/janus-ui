import { registerBehavior } from '../dispatch';

function checkEmpty(el: Element): void {
	const hasContent =
		el.children.length > 0 || (el.textContent?.trim().length ?? 0) > 0;
	if (hasContent) {
		el.removeAttribute('data-t-empty');
	} else {
		el.setAttribute('data-t-empty', '');
	}
}

const observers = new WeakMap<Element, MutationObserver>();

registerBehavior('t-empty', {
	mount(el) {
		checkEmpty(el);
		const obs = new MutationObserver(() => checkEmpty(el));
		obs.observe(el, { childList: true, characterData: true, subtree: true });
		observers.set(el, obs);
	},
});
