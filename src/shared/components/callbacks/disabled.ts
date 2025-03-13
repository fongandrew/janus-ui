import { registerDocumentSetup } from '~/shared/utility/document-setup';

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
		const target = event.target as HTMLElement;
		if (!target) return;

		const closestAriaDisabled = target.closest('[aria-disabled]');
		if (closestAriaDisabled && closestAriaDisabled?.getAttribute('aria-disabled') !== 'false') {
			if (event instanceof KeyboardEvent) {
				// Need to allow tabbing off disabled element
				if (event.key === 'Tab') return;
				// For toolbars + radios, arrow key allows moving selection
				// Exception for aria-haspopup elements since arrow means "open popup"
				if (event.key.startsWith('Arrow') && !closestAriaDisabled.ariaHasPopup) return;
			}
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}

	relevantEvents.forEach((eventName) => {
		document.addEventListener(eventName, preventDefaultIfAriaDisabled, true);
	});
});
