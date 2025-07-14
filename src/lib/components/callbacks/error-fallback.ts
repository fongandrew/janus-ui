import { createHandler } from '~/lib/utility/callback-attrs/events';
import { evtWin } from '~/lib/utility/multi-view';

/** Reloads the page on click */
export const reloadPage = createHandler('click', '$c-error-fallback__reload', (e) => {
	evtWin(e)?.location.reload();
});
