import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { forceClose, onRequestClose } from '~/lib2/dom/handlers/t-request-close';
import { mount, unmount } from '~/lib2/dom/mount';
import { installDialogPolyfill } from '~/lib2/dom/test-utils/dialog-polyfill';

beforeAll(() => {
	installDialogPolyfill();
});

afterEach(() => {
	unmount();
	document.body.innerHTML = '';
});

function dialog(): HTMLDialogElement {
	return document.getElementById('d') as HTMLDialogElement;
}

describe('t-request-close', () => {
	it('cancels the close when a request-close hook returns false', () => {
		document.body.innerHTML = `<dialog id="d" data-js="t-request-close"></dialog>`;
		mount();
		dialog().showModal();

		const cleanup = onRequestClose(dialog(), () => false);
		const ev = new Event('cancel', { cancelable: true });
		dialog().dispatchEvent(ev);

		expect(ev.defaultPrevented).toBe(true);
		cleanup();
	});

	it('allows the close when every hook returns true', () => {
		document.body.innerHTML = `<dialog id="d" data-js="t-request-close"></dialog>`;
		mount();
		dialog().showModal();

		onRequestClose(dialog(), () => true);
		const ev = new Event('cancel', { cancelable: true });
		dialog().dispatchEvent(ev);

		expect(ev.defaultPrevented).toBe(false);
	});

	it('closes on a backdrop click (event target is the dialog itself)', () => {
		document.body.innerHTML = `<dialog id="d" data-js="t-request-close"></dialog>`;
		mount();
		dialog().showModal();

		dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(dialog().open).toBe(false);
	});

	it('does not close on a click hook that returns false', () => {
		document.body.innerHTML = `<dialog id="d" data-js="t-request-close"></dialog>`;
		mount();
		dialog().showModal();
		onRequestClose(dialog(), () => false);

		dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(dialog().open).toBe(true);
	});

	it('forceClose() bypasses the hook chain', () => {
		document.body.innerHTML = `<dialog id="d" data-js="t-request-close"></dialog>`;
		mount();
		dialog().showModal();
		onRequestClose(dialog(), () => false);

		forceClose(dialog());

		expect(dialog().open).toBe(false);
	});
});
