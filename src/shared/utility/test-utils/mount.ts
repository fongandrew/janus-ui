import { afterEach } from 'vitest';

let toRemove: HTMLElement[] = [];

afterEach(() => {
	// Clean up DOM
	for (const elm of toRemove) {
		if (elm.isConnected) {
			elm.remove();
		}
	}

	toRemove = [];
});

/** Test helper that mounts elements to the body and auto-removes between tests */
export function mount(elm: HTMLElement) {
	toRemove.push(elm);
	document.body.appendChild(elm);
}

/** Test helper that renders string of stuff */
export function mountStr(html: string) {
	const elm = document.createElement('div');
	elm.innerHTML = html;
	mount(elm);
	return elm;
}
