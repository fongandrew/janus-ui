export function onUnmount(
	element: HTMLElement,
	callback: (element: HTMLElement) => void,
): () => void {
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (
				mutation.type === 'childList' &&
				Array.from(mutation.removedNodes).includes(element)
			) {
				callback(element);
				observer.disconnect();
				break;
			}
		}
	});

	const parentElement = element.parentElement;
	if (parentElement) {
		observer.observe(parentElement, { childList: true });
	}

	return () => observer.disconnect();
}
