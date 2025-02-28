/**
 * Utilities for associating an element with a function meant to run on mount
 * via a data prop.
 */
import { createMagicProp } from '~/shared/utility/magic-prop';
import { data } from '~/shared/utility/magic-strings';

/** Data attribute used to identify delegated event handlers */
const MOUNT_ATTR = data('mount');

/**
 * Special property to denote handlers that have already been processed, as a
 * way to guard against reactivity weirdness where Solid or some other rendering
 * library might re-add the mount attr after removing it.
 */
const [processed, setProcessed] = createMagicProp<string[]>();

/**
 * Special property to stock on window or document to mark that a mount request
 * has been scheduled.
 */
const [raf, setRaf] = createMagicProp<ReturnType<typeof requestAnimationFrame>>();

/**
 * Mount registry mapping IDs to mount functions.
 */
const mountRegistry: Record<string, (node: HTMLElement) => void> = {};

/**
 * Register a delegated event handler with a given ID
 */
export function add(handlerId: string, handler: (element: HTMLElement) => void) {
	mountRegistry[handlerId] = handler;
}

/**
 * Remove delegated event handler with given ID. Probably no reason to call this
 * but it's here if needed.
 */
export function remove(handlerId: string) {
	return delete mountRegistry[handlerId];
}

/**
 * Create a function that will lazily register the handler with registry and returns
 * the given ID.
 */
export function createMounter(mounterId: string, mounter: (event: HTMLElement) => void) {
	function mount() {
		add(mounterId, (e) => mount.do(e));
		return mounterId;
	}

	// Stick original handler on the function so it can be easily composed with other handlers
	// or spied on for tests
	mount.do = mounter;

	return mount;
}

/**
 * Convenience function to return a spreadable props object with the handler ID(s)
 */
export function mounterProps(...mounterIds: (string | (() => string))[]): Record<string, string> {
	const ids = [];
	for (const id of mounterIds) {
		ids.push(typeof id === 'function' ? id() : id);
	}
	return { [MOUNT_ATTR]: ids.join(' ') };
}

/**
 * Process all mount attributes for a given node
 */
export function process(node: Element) {
	const attrValue = node.getAttribute(MOUNT_ATTR);
	if (!attrValue) return;

	const currentProcessed = processed(node) ?? [];

	// Wrap to prevent re-processing loops in case of error
	try {
		for (const handlerId of attrValue.split(' ')) {
			currentProcessed.push(handlerId);
			mountRegistry[handlerId]?.(node as HTMLElement);
		}

		// Redundant with `setProcessed` but avoids adding more overhead to
		// subsequent calls to `process`
		node.removeAttribute(MOUNT_ATTR);
	} finally {
		setProcessed(node, currentProcessed);
	}
}

/**
 * Process all monnt attributes for a given root
 */
export function processRoot(root: Window) {
	root.document.querySelectorAll(`[${MOUNT_ATTR}]`).forEach(process);
	setRaf(root, undefined);
}

/**
 * Schedule a processRoot call for a given root
 */
export function scheduleProcessRoot(root: Window) {
	if (raf(root)) return;
	setRaf(
		root,
		root.requestAnimationFrame(() => processRoot(root)),
	);
}
