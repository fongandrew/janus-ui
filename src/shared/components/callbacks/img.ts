import { createHandler } from '~/shared/utility/callback-attrs/events';
import { createMounter } from '~/shared/utility/callback-attrs/mount';

export const imgError = createHandler('error', '$c-img__error', function (event, errorId: string) {
	const img = event.target as HTMLImageElement;
	setErrorState(img, errorId);
});

export const imgMountError = createMounter<[string]>(
	'$c-img__mount-error',
	(target, errorId: string) => {
		const img = target as HTMLImageElement;
		if (isImgBroken(img)) setErrorState(img, errorId);
	},
);

/**
 * Maybe set error state
 */
function setErrorState(img: HTMLImageElement, errorId: string) {
	img.classList.add('t-hidden');
	const error = img.ownerDocument?.getElementById(errorId);
	if (error) {
		error.classList.remove('t-hidden');
	}
}

/**
 * 		An image that's complete but has no dimensions likely failed to load
 */
function isImgBroken(img: HTMLImageElement) {
	return img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0);
}
