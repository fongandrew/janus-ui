import { djb2Base36 } from '~/lib/utility/hash';

/**
 * Given an error, return a unique error code
 */
export function getErrorCode(error: Error): string {
	const part1 = djb2Base36(`${error.name}:${error.message}`);
	const part2 = djb2Base36(error.stack || '');
	return `${part1}-${part2}`;
}
