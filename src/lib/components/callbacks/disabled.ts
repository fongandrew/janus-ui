import { registerDocumentSetup } from '~/lib/utility/document-setup';

registerDocumentSetup((document) => {
	const relevantEvents = [
		'click',
		'dblclick',
		'input',
		'keydown',
		'keyup',
		'mousedown',
		'mouseup',
		'paste',
	];

	/** Listener that selectively disables event propagation if aria-disabled */
	function preventDefaultIfAriaDisabled(event: Event) {
		const target = event.target;
		if (!target || !(target instanceof HTMLElement)) return;

		const closestAriaDisabled = target.closest('[aria-disabled]');
		if (closestAriaDisabled && closestAriaDisabled?.getAttribute('aria-disabled') !== 'false') {
			if (event instanceof KeyboardEvent) {
				// Need to allow tabbing off disabled element
				if (event.key === 'Tab') return;

				if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
					// Allow arrow keys to move focus off toolbar (unless popup menu)
					const isToolbar = !!closestAriaDisabled.closest('[role="toolbar"]');
					if (isToolbar) {
						const hasAriaPopup = closestAriaDisabled.getAttribute('aria-haspopup');
						if (!hasAriaPopup || hasAriaPopup === 'false') return;
						return event.key !== 'ArrowDown' && event.key !== 'ArrowUp';
					}

					// Allow arrow keys to move focus off radio group
					const isRadio =
						closestAriaDisabled.getAttribute('role') === 'radio' ||
						(closestAriaDisabled as HTMLInputElement).type === 'radio';
					if (isRadio) return;
				}
			}
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}

	relevantEvents.forEach((eventName) => {
		document.addEventListener(eventName, preventDefaultIfAriaDisabled, true);
	});
});
