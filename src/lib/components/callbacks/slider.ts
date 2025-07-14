import { createHandler } from '~/lib/utility/callback-attrs/events';

/**
 * Synchronize the values of input + slider components
 */
export const sliderInputSync = createHandler('input', '$c-slider__input-sync', (event) => {
	const changedInput = event.target as HTMLInputElement;
	const container = event.currentTarget as HTMLDivElement;
	for (const input of container.querySelectorAll('input')) {
		if (input !== changedInput) {
			input.value = changedInput.value;
		}
	}
});

/**
 * Dispatch change event on number input when range changes
 */
export const sliderChangeSync = createHandler('change', '$c-slider__change-sync', (event) => {
	const changedInput = event.target as HTMLInputElement;
	if (changedInput.type !== 'range') return;

	const container = event.currentTarget as HTMLDivElement;
	const numberInput = container.querySelector('input[type="number"]') as HTMLInputElement;
	numberInput?.dispatchEvent(new Event('change', { bubbles: true }));
});
