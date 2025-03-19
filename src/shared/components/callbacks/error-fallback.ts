import { createHandler } from '~/shared/utility/callback-attrs/events';
import { evtWin } from '~/shared/utility/multi-view';

export const reloadPage = createHandler('click', '$c-error-fallback__reload', (e) => {
	evtWin(e)?.location.reload();
});
