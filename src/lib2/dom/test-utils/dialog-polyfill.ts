/**
 * jsdom (as of v26) doesn't implement `<dialog>`'s methods (`showModal`,
 * `show`, `close`) or `returnValue` -- only the reflected `open` attribute.
 * This installs a minimal behavioral polyfill so tests can exercise
 * `t-request-close` / `c-modal__speed-bump` against real `<dialog>` nodes.
 * Idempotent; safe to call from every test file that needs it.
 */
export function installDialogPolyfill(): void {
	const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
		returnValue?: string;
	};
	if (typeof proto.close === 'function') {
		return;
	}

	Object.defineProperty(proto, 'returnValue', {
		value: '',
		writable: true,
		configurable: true,
	});

	proto.show = function (this: HTMLDialogElement) {
		this.open = true;
	};

	proto.showModal = function (this: HTMLDialogElement) {
		this.open = true;
	};

	proto.close = function (this: HTMLDialogElement, returnValue?: string) {
		if (returnValue !== undefined) {
			(this as HTMLDialogElement & { returnValue: string }).returnValue = returnValue;
		}
		this.open = false;
		this.dispatchEvent(new Event('close'));
	};
}
