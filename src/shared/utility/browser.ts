import { memoizeOne } from '~/shared/utility/memoize/memoize-one';

export const isSafari = memoizeOne(() => {
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
});
