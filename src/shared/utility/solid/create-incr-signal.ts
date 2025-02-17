import { createSignal } from 'solid-js';

const incr = (prev: number) => prev + 1;

/**
 * A simple counter, useful for manually signaling a signal update
 */
export function createIncrSignal(defaultValue = 0) {
	const [signal, setSignal] = createSignal(defaultValue);
	return [signal, () => setSignal(incr)] as const;
}
