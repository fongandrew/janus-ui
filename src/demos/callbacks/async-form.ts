import { formOutputWrite } from '~/demos/callbacks/form-output';
import { createSubmitHandler } from '~/shared/components/callbacks/form';

export const AsyncFormNames = {
	name: 'name',
	message: 'message',
	shouldError: 'shouldError',
} as const;

/** Delayed submit, error if shouldError set */
export const asyncFormSubmit = createSubmitHandler(
	'async-form-ssr__submit',
	async function (event, targetId?: string) {
		await new Promise((resolve) => setTimeout(resolve, 3000));

		if (event.data.get(AsyncFormNames.shouldError)) {
			throw new Error('Form submission failed (as requested)');
		}

		if (String(event.data.get(AsyncFormNames.name)).toLowerCase() === 'bob') {
			return {
				ok: false,
				fieldErrors: {
					name: 'We already have a Bob',
				},
			};
		}

		formOutputWrite.do.call(this, event, targetId);
		return {
			ok: true,
		};
	},
	AsyncFormNames,
);
