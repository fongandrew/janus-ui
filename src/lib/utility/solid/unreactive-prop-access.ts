import { createRenderEffect } from 'solid-js';

import { useLogger } from '~/lib/utility/solid/use-logger';

/**
 * A helper to access multiple props that we don't expect to change. If they do change,
 * it'll log a warning in dev.
 */
export function unreactivePropAccess<
	TProps extends object,
	TKeys extends readonly (keyof TProps)[],
>(props: TProps, keys: [...TKeys]): { [I in keyof TKeys]: TProps[TKeys[I]] } {
	const current: TProps[keyof TProps][] = [];
	for (const key of keys) {
		current.push(props[key]);
	}

	if (!import.meta.env.PROD) {
		const logger = useLogger();
		createRenderEffect(() => {
			keys.forEach((key, index) => {
				if (current[index] !== props[key]) {
					logger.warn(
						`Prop ${String(key)} changed from ${String(current[index])} to ${String(props[key])}`,
					);
					current[index] = props[key];
				}
				current[index] = props[key];
			});
		});
	}

	return current as any;
}
