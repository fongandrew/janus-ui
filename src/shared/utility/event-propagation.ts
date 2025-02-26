import { prop } from '~/shared/utility/magic-strings';

const PROPAGATION_STOPPED = prop('propagation-stopped');
const IMMEDIATE_PROPAGATION_STOPPED = prop('immediate-propagation-stopped');

/**
 * Override stopPropagation and stopImmediatePropagation methods on event so they're inspectable
 */
export function wrapStopPropagation(event: Event) {
	const stopPropagation = event.stopPropagation;
	event.stopPropagation = () => {
		(event as any)[PROPAGATION_STOPPED] = true;
		stopPropagation.call(event);
	};

	const stopImmediatePropagation = event.stopImmediatePropagation;
	event.stopImmediatePropagation = () => {
		(event as any)[IMMEDIATE_PROPAGATION_STOPPED] = true;
		(event as any)[PROPAGATION_STOPPED] = true;
		stopImmediatePropagation.call(event);
	};
}

/**
 * Check if event propagation was stopped
 */
export function isPropagationStopped(event: Event) {
	return (event as any)[PROPAGATION_STOPPED];
}

/**
 * Check if event immediate propagation was stopped
 */
export function isImmediatePropagationStopped(event: Event) {
	return (event as any)[IMMEDIATE_PROPAGATION_STOPPED];
}
