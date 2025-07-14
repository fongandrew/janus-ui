/**
 * Given a min, max, step, and value, round to the nearest step within range.
 */
export function step(min: number, max: number, step: number, value: number): number {
	const steps = Math.round(value / step);
	const steppedValue = steps * step;
	return Math.min(max, Math.max(min, steppedValue));
}
