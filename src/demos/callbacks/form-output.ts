import { createSubmitHandler } from '~/shared/callback-attrs/form';
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
