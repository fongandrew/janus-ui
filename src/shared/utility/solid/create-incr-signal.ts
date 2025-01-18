import { createSignal } from 'solid-js';

const incr = (prev: number) => prev + 1;

/**
 * A simple counter, useful for manually signaling a signal update
 */
export function createIncrSignal() {
	const [signal, setSignal] = createSignal(0);
	return [signal, () => setSignal(incr)] as const;
}
