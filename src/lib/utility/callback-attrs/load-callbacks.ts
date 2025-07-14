import { isRegisteredCallback } from '~/lib/utility/callback-attrs/callback-registry';
import { scheduleProcessRoot } from '~/lib/utility/callback-attrs/mount';
import { getDefaultLogger } from '~/lib/utility/logger';
import { parentWindow } from '~/lib/utility/multi-view';

/**
 * Auto-load callbacks from a module (or other object containing callbacks)
 */
export function loadCallbacks(...mods: Record<string, any>[]) {
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
