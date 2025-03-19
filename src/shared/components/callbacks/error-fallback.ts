import { createHandler } from '~/shared/utility/callback-attrs/events';
import { evtWin } from '~/shared/utility/multi-view';

/** Reloads the page on click */
export const reloadPage = createHandler('click', '$c-error-fallback__reload', (e) => {
	evtWin(e)?.location.reload();
});
