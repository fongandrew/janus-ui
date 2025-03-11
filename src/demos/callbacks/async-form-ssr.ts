import { formOutputWrite } from '~/demos/callbacks/form-output';
import { createSubmitHandler } from '~/shared/callback-attrs/form';

export const AsyncFormSSRNames = {
	name: 'name',
	message: 'message',
	shouldError: 'shouldError',
} as const;

/** Delayed submit, error if shouldError set */
export const asyncFormSSRSubmit = createSubmitHandler(
	'async-form-ssr__submit',
	async (event) => {
		await new Promise((resolve) => setTimeout(resolve, 3000));

		if (event.data.get(AsyncFormSSRNames.shouldError)) {
			throw new Error('Form submission failed (as requested)');
		}

		if (String(event.data.get(AsyncFormSSRNames.name)).toLowerCase() === 'bob') {
			return {
				ok: false,
				fieldErrors: {
					name: 'We already have a Bob',
				},
			};
		}

		formOutputWrite.do(event);
		return {
			ok: true,
		};
	},
	AsyncFormSSRNames,
);
