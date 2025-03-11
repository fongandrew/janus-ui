import { createSubmitHandler } from '~/shared/callback-attrs/form';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { evtDoc } from '~/shared/utility/multi-view';

/** Write form data to output */
export const formOutputWrite = createSubmitHandler(
	'form-output__write',
	(event) => {
		const form = event.target as HTMLFormElement;
		const data = new FormData(form);

		let nextSibling = form.nextElementSibling as HTMLElement;
		if (nextSibling?.tagName !== 'OUTPUT') {
			nextSibling = evtDoc(event)!.createElement('output');
			form.insertAdjacentElement('afterend', nextSibling);
		}

		let pre = nextSibling.firstChild;
		if (!pre) {
			pre = evtDoc(event)!.createElement('pre');
			nextSibling.appendChild(pre);
		}

		pre.textContent = JSON.stringify(Object.fromEntries(data));
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
