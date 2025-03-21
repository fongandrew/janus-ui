import { createSignal } from 'solid-js';
import { isServer } from 'solid-js/web';

import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { setSupportLink } from '~/shared/components/error-fallback';
import { Modal } from '~/shared/components/modal';

setSupportLink('https://example.com/support');

/** Set this top-level variable to always throw */
let topLevelShouldThrow = false;

export function ErrorFallbackDemo() {
	// Signal to force re-render but also set top-level variable to put things in
	// an unrecoverable state
	const [shouldThrow, setShouldThrow] = createSignal(false);
	const setUnrecoverableError = () => {
		setShouldThrow(true);
		topLevelShouldThrow = true;
	};

	return (
		<>
			<Card id="error-fallback-demo" onError={isServer ? () => {} : undefined}>
				<CardHeader>
					<CardTitle>Error Boundaries</CardTitle>
					<CardDescription>Click to throw errors</CardDescription>
				</CardHeader>
				<CardContent class="o-text-stack">
					<p>
						The Section Error is recoverable because it's caught by the card error
						boundary, which resets the error state. The other errors are set to always
						throw, so reload will force a full page reload.
					</p>
					<div class="o-group">
						<RecoverableErrorButton />
						<Button onClick={setUnrecoverableError}>Page Error</Button>
						<ErrorModalButton />
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
			{(() => {
				if (topLevelShouldThrow || shouldThrow()) {
					throw new Error('This is a demo error thrown on purpose');
				}
				return null;
			})()}
		</>
	);
}

/**
 * When this errors, it should be caught by the card error boundary and the error state
 * unmounted. So reload will render in an unerrored state again.
 */
function RecoverableErrorButton() {
	const [shouldThrow, setShouldThrow] = createSignal(false);
	return (
		<>
			<Button onClick={[setShouldThrow, true]}>Section Error</Button>
			{(() => {
				if (shouldThrow()) {
					throw new Error('This is a demo error thrown on purpose');
				}
				return null;
			})()}
		</>
	);
}

/** A dialog with an error in it */
function ErrorModalButton() {
	const [isOpen, setIsOpen] = createSignal(false);
	return (
		<>
			<Button onClick={[setIsOpen, true]}>Modal Error</Button>
			<Modal open={isOpen()} onClose={[setIsOpen, false]}>
				{(() => {
					throw new Error('This is a demo error thrown on purpose');
				})()}
			</Modal>
		</>
	);
}
