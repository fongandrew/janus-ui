import { createSubmitHandler } from '~/shared/components/callbacks/form';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { evtDoc } from '~/shared/utility/multi-view';

/** Write form data to output */
export const formOutputWrite = createSubmitHandler(
	'form-output__write',
	(event, targetId?: string) => {
		const form = event.target as HTMLFormElement;
		const data = new FormData(form);

		let output = targetId ? evtDoc(event)!.getElementById(targetId) : null;

		if (!output) {
			output = form.nextElementSibling as HTMLElement;
			if (output?.tagName !== 'OUTPUT') {
				output = evtDoc(event)!.createElement('output');
				form.insertAdjacentElement('afterend', output);
			}
		}

		let pre = output.firstChild;
		if (!pre) {
			pre = evtDoc(event)!.createElement('pre');
			output.appendChild(pre);
		}

		pre.textContent = JSON.stringify(
			Array.from(data.keys()).reduce(
				(acc, key) => {
					acc[key] = data.getAll(key);
					return acc;
				},
				{} as Record<string, any>,
			),
		);
	},
	{},
);

/** Clear output element reset */
export const formOutputClear = createHandler('click', 'form-output__clear', (event) => {
	const button = event.currentTarget as HTMLButtonElement;
	const form = button.form;
	if (!form) return;

	const nextSibling = form.nextElementSibling as HTMLElement;
	if (nextSibling?.tagName === 'OUTPUT') {
		nextSibling.remove();
	}
});

/** Update output text when form element changes */
export const formChangeOutputWrite = createHandler(
	'change',
	'form-output__change-write',
	(event, writeTargetId: string) => {
		const inputElm = event.target as HTMLElement;
		if (!inputElm || !(inputElm instanceof HTMLInputElement)) return;

		const writeTarget = inputElm.ownerDocument?.getElementById(writeTargetId);
		if (!writeTarget) return;
		writeTarget.textContent = `Selected: ${inputElm.value}`;
	},
);
