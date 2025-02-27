import { createMagicProp } from '~/shared/utility/magic-prop';

const [propagationStopped, setPropagagationStopped] = createMagicProp<boolean, Event>();
const [immediatePropagationStopped, setImmediatePropagationStopped] = createMagicProp<
	boolean,
	Event
>();

/**
 * Override stopPropagation and stopImmediatePropagation methods on event so they're inspectable
 */
export function wrapStopPropagation(event: Event) {
	const stopPropagation = event.stopPropagation;
	event.stopPropagation = () => {
		setPropagagationStopped(event, true);
		stopPropagation.call(event);
	};

	const stopImmediatePropagation = event.stopImmediatePropagation;
	event.stopImmediatePropagation = () => {
		setImmediatePropagationStopped(event, true);
		setPropagagationStopped(event, true);
		stopImmediatePropagation.call(event);
	};
}

export {
	immediatePropagationStopped as isImmediatePropagationStopped,
	propagationStopped as isPropagationStopped,
};
