import { isRegisteredCallback } from '~/shared/utility/callback-attrs/callback-registry';
import { scheduleProcessRoot } from '~/shared/utility/callback-attrs/mount';
import { isDev } from '~/shared/utility/is-dev';
import { getDefaultLogger } from '~/shared/utility/logger';
import { parentWindow } from '~/shared/utility/multi-view';

let toLoad: Record<string, any>[] = [];

/**
 * Auto-load callbacks from a module (or other object containing callbacks)
 */
export function loadCallbacks(...mods: Record<string, any>[]) {
	// Dev hook for testing deferred callback loading
	if (isDev() && parentWindow?.location.search.includes('defer-load-callbacks')) {
		for (const mod of mods) {
			toLoad.push(mod);
		}
		(parentWindow as any).loadCallbacks ??= () => {
			doLoadCallbacks(...toLoad);
			toLoad = [];
		};
		return;
	}
	doLoadCallbacks(...mods);
}

/**
 * Implementation of callback loading that is deferred in dev
 */
function doLoadCallbacks(...mods: Record<string, any>[]) {
	for (const mod of mods) {
		for (const value of Object.values(mod)) {
			if (isRegisteredCallback(value)) {
				if (value.add() === false) {
					getDefaultLogger().warn(`Callback already exists: ${value.id}`);
				}
			}
		}
	}
	if (parentWindow) {
		scheduleProcessRoot(parentWindow);
	}
}
