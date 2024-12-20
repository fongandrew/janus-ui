import { createSignal, onMount } from 'solid-js';

/**
 * A signal that fires when component is mounted.
 */
export function createMountedSignal() {
	const [signal, setSignal] = createSignal(false);
	onMount(() => setSignal(true));
	return signal;
}
