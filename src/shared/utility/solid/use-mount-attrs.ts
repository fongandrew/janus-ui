import { onMount } from 'solid-js';

import { mounterProps, scheduleProcessRoot } from '~/shared/utility/mount-attrs';
import { useWindow } from '~/shared/utility/solid/window-context';

/**
 * Adapter to use mount attrs in a Solid context. We could just use `onMount` + a ref, but this
 * is useful for code we want to run both with and without a frameowrk. Returns props to spread
 * on an element to mount the given handler.
 */
export function useMountAttrs(...mounterIds: (string | (() => string))[]) {
	const window = useWindow();
	onMount(() => {
		if (!window) return;
		scheduleProcessRoot(window);
	});
	return mounterProps(...mounterIds);
}
