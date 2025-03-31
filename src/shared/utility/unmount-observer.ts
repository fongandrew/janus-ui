import { createMagicProp } from '~/shared/utility/magic-prop';
import { elmDoc } from '~/shared/utility/multi-view';

/** Magic prop with list of elements callback per document */
const [elmList, setElmList] = createMagicProp<HTMLElement[]>();

/** Magic prop for tracking list of callbacks per element */
const [callbacks, setCallbacks] = createMagicProp<((element: HTMLElement) => void)[]>();

/** Magic prop tracking observers per document */
const [docObserver, setDocObserver] = createMagicProp<MutationObserver>();

export function onUnmount(element: HTMLElement, callback: (element: HTMLElement) => void) {
	const document = elmDoc(element);
	if (!document) return;

	let lst = elmList(document);
	if (!lst) {
		lst = [];
		setElmList(document, lst);
	}
	if (lst.indexOf(element) === -1) {
		lst.push(element);
	}

	let callbackList = callbacks(element);
	if (!callbackList) {
		callbackList = [];
		setCallbacks(element, callbackList);
	}
	callbackList.push(callback);

	let observer = docObserver(document);
	if (observer) return;

	// This basically runs on every mutation. We can't just monitor the parent node or some
	// smaller subtree because any ancestor could be removed. This should be fine though
	// so long as the number of elements being tracked is small.
	observer = new MutationObserver(() => {
		const lst = elmList(document);
		if (!lst) return;

		const toRemove: HTMLElement[] = [];

		// Squeeze a little extra speed out of this since we're maybe calling
		// this particular loop a lot (on every mutation)
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < lst.length; i++) {
			const elm = lst[i];
			if (!elm || elm.isConnected) continue;

			toRemove.push(elm);

			const callbackList = callbacks(elm);
			if (!callbackList) continue;

			for (const callback of callbackList) {
				callback(elm);
			}
		}

		if (toRemove.length) {
			for (const elm of toRemove) {
				const idx = lst.indexOf(elm);
				if (idx !== -1) {
					lst.splice(idx, 1);
				}
			}
		}

		if (lst.length) return;
		observer?.disconnect();
		setDocObserver(document, undefined);
	});

	setDocObserver(document, observer);
	observer.observe(document.body, { childList: true, subtree: true });
}
