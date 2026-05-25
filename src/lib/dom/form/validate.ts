export type Validator = (el: HTMLElement) => string | null | Promise<string | null>;

const namedValidators = new Map<string, Validator>();
const elementValidators = new WeakMap<Element, Validator[]>();
const touchedElements = new WeakSet<Element>();
const dirtyElements = new WeakSet<Element>();
const liveValidatingElements = new WeakSet<Element>();
const serverErrors = new WeakMap<Element, string>();

export function registerValidator(name: string, fn: Validator): void {
	namedValidators.set(name, fn);
}

export function addValidator(el: Element, fn: Validator): () => void {
	const existing = elementValidators.get(el) ?? [];
	existing.push(fn);
	elementValidators.set(el, existing);
	return () => {
		const list = elementValidators.get(el);
		if (list) {
			const idx = list.indexOf(fn);
			if (idx >= 0) list.splice(idx, 1);
		}
	};
}

export function isTouched(el: Element): boolean {
	return touchedElements.has(el);
}

export function markTouched(el: Element): void {
	touchedElements.add(el);
}

export function markAllTouched(form: HTMLFormElement): void {
	for (const el of Array.from(form.elements)) {
		touchedElements.add(el);
	}
}

export function isDirty(form: HTMLFormElement): boolean {
	for (const el of Array.from(form.elements)) {
		if (dirtyElements.has(el)) return true;
	}
	return false;
}

export function markDirty(el: Element): void {
	dirtyElements.add(el);
}

export function clearDirty(form: HTMLFormElement): void {
	for (const el of Array.from(form.elements)) {
		dirtyElements.delete(el);
	}
}

export function setServerError(el: Element, msg: string): void {
	serverErrors.set(el, msg);
}

export function clearServerError(el: Element): void {
	serverErrors.delete(el);
}

export function getServerError(el: Element): string | undefined {
	return serverErrors.get(el) ?? undefined;
}

export function enableLiveValidation(el: Element): void {
	liveValidatingElements.add(el);
}

export function isLiveValidating(el: Element): boolean {
	return liveValidatingElements.has(el);
}

export async function validateElement(el: HTMLElement): Promise<string | null> {
	if (el.getAttribute('aria-disabled') === 'true') return null;

	if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
		if (!el.validity.valid) {
			return el.validationMessage;
		}
	}

	const namedList = el.getAttribute('data-validators');
	if (namedList) {
		for (const name of namedList.split(/\s+/)) {
			const fn = namedValidators.get(name);
			if (fn) {
				const msg = await fn(el);
				if (msg) return msg;
			}
		}
	}

	const inlineList = elementValidators.get(el);
	if (inlineList) {
		for (const fn of inlineList) {
			const msg = await fn(el);
			if (msg) return msg;
		}
	}

	const srvErr = serverErrors.get(el);
	if (srvErr) return srvErr;

	return null;
}

export function writeError(el: Element, msg: string | null): void {
	const describedBy = el.getAttribute('aria-describedby');
	if (!describedBy) return;
	for (const id of describedBy.split(/\s+/)) {
		const target = document.getElementById(id);
		if (target && target.getAttribute('data-js')?.includes('t-validate-error')) {
			target.textContent = msg ?? '';
			if (msg) {
				target.setAttribute('role', 'alert');
			} else {
				target.removeAttribute('role');
			}
			break;
		}
	}
	if (msg) {
		el.setAttribute('aria-invalid', 'true');
	} else {
		el.removeAttribute('aria-invalid');
	}
}

export function resetValidationState(form: HTMLFormElement): void {
	for (const el of Array.from(form.elements)) {
		touchedElements.delete(el);
		dirtyElements.delete(el);
		liveValidatingElements.delete(el);
		serverErrors.delete(el);
		writeError(el, null);
	}
}
