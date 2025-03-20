import { createResource, createSignal } from 'solid-js';
import { isServer } from 'solid-js/web';

import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import {
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalTitle,
} from '~/shared/components/modal';
import { combineEventHandlers } from '~/shared/utility/solid/combine-event-handlers';

export function SuspenseDemo() {
	const [count, incr] = createIncrResource();
	return (
		<>
			<Card onError={isServer ? () => {} : undefined}>
				<CardHeader>
					<CardTitle>Suspense Loaders</CardTitle>
					<CardDescription>Click to trigger loading state</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="o-group">
						<CardLoadButton />
						<Button onClick={incr}>Page Load</Button>
						<ModalLoadButton />
					</div>
					{(() => {
						// Test error thrown during SSR
						if (isServer) {
							throw new Error('This is a demo error thrown on purpose');
						}
						return null;
					})()}
				</CardContent>
			</Card>
			{count() && null}
		</>
	);
}

/**
 * When this triggers suspense, it should be caught by the card suspense boundary.
 */
function CardLoadButton() {
	const [count, incr] = createIncrResource();
	return (
		<>
			<Button onClick={incr}>Card Load</Button>
			{count() && null}
		</>
	);
}

/** A dialog that trigger a suspense boundary on load */
function ModalLoadButton() {
	const [count, incr] = createIncrResource();
	const [isOpen, setIsOpen] = createSignal(false);
	return (
		<>
			<Button onClick={combineEventHandlers([setIsOpen, true], incr)}>Modal Load</Button>
			<Modal open={isOpen()} onClose={[setIsOpen, false]}>
				<ModalTitle>Example Modal</ModalTitle>
				<ModalContent>
					<p>Click outside or the close button to dismiss</p>
					{count() && null}
				</ModalContent>
				<ModalFooter>
					<ModalCloseButton />
				</ModalFooter>
			</Modal>
		</>
	);
}

function createIncrResource() {
	const initialValue = 1;
	const [signal, setSignal] = createSignal(initialValue);
	const [data] = createResource(
		signal,
		(n) =>
			new Promise<number>((resolve) => {
				setTimeout(() => resolve(n), 60000);
			}),
	);
	return [
		// Don't trigger data until triggered
		// eslint-disable-next-line solid/reactivity
		() => (signal() !== initialValue ? data() : initialValue),
		() => setSignal((n) => n + 1),
	] as const;
}
