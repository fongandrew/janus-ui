import { createHandler } from '~/shared/utility/callback-attrs/events';

/** Force an image reload on click */
export const imgReload = createHandler('click', '$c-img__reload', function (event) {
	const img = event.currentTarget as HTMLImageElement;
	const src = img.src?.split('?')[0] ?? ''; // Remove query string

	// Clear existing image to force loading state
	img.src = '';

	img.src = src + '?nocache=' + Math.random();
});
