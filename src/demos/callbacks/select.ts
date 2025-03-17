import { createSelectInputHandler } from '~/shared/components/callbacks/select';

// Non-framework typeahead that simulates XHR
export const selectQuery = createSelectInputHandler(
	'select__query',
	async (event, _abortSignal, templateId: string) => {
		const target = event.target;
		const template = target.ownerDocument?.getElementById(
			templateId,
		) as HTMLTemplateElement | null;
		if (!template) return new DocumentFragment();

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const query = target.value?.trim().toLowerCase() ?? '';
		const next = template.content.cloneNode(true) as DocumentFragment;
		for (const label of next.querySelectorAll<HTMLLabelElement>('label')) {
			if (!label.textContent?.toLowerCase().includes(query)) {
				label.remove();
			}
		}
		return next;
	},
);
