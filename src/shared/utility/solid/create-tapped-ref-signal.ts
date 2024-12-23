import { createSignal, type Setter } from 'solid-js';

/**
 * A Solid JS utility that, when given a callback function for a ref, returns a signal
 * and setter (that can be used as a ref itself)
 */
export function createTappedRefSignal<TRef>(callback: Setter<TRef> | ((val: TRef) => void)) {
	const [signal, setSignal] = createSignal<TRef>();
	return [
		signal,
		(value: TRef) => {
			(callback as (val: TRef) => void)(value);
			// Appease TypeScript over setter accepting both functional and static forms
			setSignal(() => value);
		},
	] as const;
}
