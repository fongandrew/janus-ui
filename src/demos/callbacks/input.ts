import { createHandler } from '~/lib/utility/callback-attrs/events';

export const inputUpdateText = createHandler(
	'change',
	'$p-input__update-text',
	(event, targetId: string) => {
		const input = event.target as HTMLInputElement;

		const target = input.ownerDocument?.getElementById(targetId);
		if (!target) return;

		const text = `Value: ${input.value ?? 'None'}`;
		target.textContent = text;
	},
);
