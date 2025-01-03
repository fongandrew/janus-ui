import { memoizeOne } from '~/shared/utility/memoize/memoize-one';

export const isMac = memoizeOne(() => {
	return navigator.userAgent.indexOf('Mac OS') !== -1;
});
