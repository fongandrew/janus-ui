/**
 * Utilities for associating an element with a function meant to run on mount
 * via a data prop.
 */
import { createCallbackRegistry } from '~/lib/utility/callback-attrs/callback-registry';
import { createMagicProp } from '~/lib/utility/magic-prop';

/** Mount functions */
export type MountHandler = (this: HTMLElement, element: HTMLElement) => void;

/** Data attribute used to identify delegated event handlers */
const MOUNT_ATTR = 'data-t-mount';

const mountRegistry = createCallbackRegistry<MountHandler>(MOUNT_ATTR);
export const createMounter = mountRegistry.create;

/**
 * Special property to denote nodes that have already been processed as a
 * way to guard against reactivity weirdness where Solid or some other rendering
 * library might re-add the mount attr after removing it.
 */
const [processed, setProcessed] = createMagicProp<boolean>();

/**
 * Special property to stock on window or document to mark that a mount request
 * has been scheduled.
 */
const [raf, setRaf] = createMagicProp<ReturnType<typeof requestAnimationFrame>>();

/**
 * Process all mount attributes for a given node
 */
export function process(node: HTMLElement) {
	const attrValue = node.getAttribute(MOUNT_ATTR);
	if (!attrValue) return;

	if (processed(node)) return;

	// Wrap to prevent re-processing loops in case of error
	try {
		for (const handler of mountRegistry.iter(node)) {
			handler(node);
		}
	} finally {
		setProcessed(node, true);

		// Redundant with `setProcessed` but avoids adding more overhead to
		// subsequent calls to `process`
		node.removeAttribute(MOUNT_ATTR);
	}
}

/**
 * Process all mount attributes for a given root
 */
export function processRoot(root: HTMLElement | Document) {
	root.querySelectorAll<HTMLElement>(`[${MOUNT_ATTR}]`).forEach(process);
	setRaf(root, undefined);
}

/**
 * Schedule a processRoot call for a given root (called as part of update cycle).
 * Call `addMounterRenderEffect` to use this.
 */
export function scheduleProcessRoot(win: Window) {
	if (raf(win.document)) return;
	setRaf(
		win.document,
		win.requestAnimationFrame(() => processRoot(win.document)),
	);
}

/** Add a callback when mounter renders something */
export const addMounterRenderEffect = (
	callback: (scheduleForWindow: (root: Window) => void) => void,
) =>
	mountRegistry.listen('render', () => {
		callback(scheduleProcessRoot);
	});
