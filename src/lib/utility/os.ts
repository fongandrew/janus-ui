import { memoizeOne } from '~/lib/utility/memoize/memoize-one';

export const isMac = memoizeOne(() => {
	return navigator.userAgent.indexOf('Mac OS') !== -1;
});
