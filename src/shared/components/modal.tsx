import cx from 'classix';
import { X } from 'lucide-solid';
import {
	type Component,
	createEffect,
	createSignal,
	type JSX,
	onCleanup,
	splitProps,
} from 'solid-js';

import { Button } from '~/shared/components/button';
import { Group } from '~/shared/components/group';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';

export interface DialogProps extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
	/** Callback ref for the dialog element */
	ref?: (element: HTMLDialogElement) => void;
	/** Controls whether the dialog is shown */
	open?: boolean;
	/** Callback for modal being closed */
	onRequestClose?: (e: KeyboardEvent | MouseEvent) => boolean | Promise<boolean>;
	/** Require children */
	children: JSX.Element;
}

// If dialog backdrop is closed, trigger close event
registerDocumentSetup((document) => {
	document.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;

		// Close any clicks that land on data-dialog-container. Clicks on the dialog content
		// itself should land on data-dialog-content, so we can ignore those.
		if (
			target &&
			target.hasAttribute('data-dialog-container') &&
			target instanceof HTMLDialogElement &&
			target.open
		) {
			target.close();
		}
	});
});

export const Modal: Component<DialogProps> = (props) => {
	const [dialog, setDialog] = createSignal<HTMLDialogElement | null>(null);
	const isMounted = createMountedSignal();
	const [local, rest] = splitProps(props, ['children', 'open']);

	// Handle open state changes after mount
	createEffect(() => {
		const dialogElm = dialog();
		if (!isMounted() || !dialogElm) return;

		if (local.open) {
			dialogElm.showModal();
		} else if (dialogElm.open) {
			dialogElm.close();
		}
	});

	// Clean up by ensuring dialog is closed
	onCleanup(() => {
		const dialogElm = dialog();
		if (dialogElm?.open) {
			dialogElm.close();
		}
	});

	/**
	 * Callback to close modal if callback allows it. Takes an event that would have
	 * or maybe should close the dialog. We do this with Keyboard and Mouse events
	 * since the close event can't be cancelled and the cancel event is a bit wonky.
	 */
	const maybeCloseDialog = (e: KeyboardEvent | MouseEvent) => {
		const dialogElm = dialog();
		if (!dialogElm?.open) return;

		// Prevent default since we'll be manually closing dialog (if applicable)
		e.preventDefault();

		if (!props.onRequestClose) {
			dialogElm.close();
			return;
		}

		const result = props.onRequestClose(e);
		if (result instanceof Promise) {
			result.then((shouldClose) => shouldClose && dialogElm.close());
		} else if (result) {
			dialog()?.close();
		}
	};

	/** Click handler for things that might close the modal */
	const handleClick = (e: MouseEvent) => {
		const target = e.target as HTMLElement | null;
		if (!target) return;

		// Clicking the backdrop should close it. This should not fire if clicking
		// the dialog body itself since target will be the dialog content element
		// or a child of it.
		if (target === dialog()) {
			maybeCloseDialog(e);
			return;
		}

		// If target is submit inside a form with method="dialog", check if we should close.
		// This is meant to maybe override the defualt behavior of closing the form on submit.
		const submitTarget = target.closest('[type="submit"]') as
			| HTMLButtonElement
			| HTMLInputElement
			| null;
		if (submitTarget && submitTarget.form?.method === 'dialog') {
			maybeCloseDialog(e);
			return;
		}

		// If target is a button with type="reset" not attached to a form, maybe close the
		// dialog. This is also meant to override default behavior.
		const resetTarget = target.closest('[type="reset"]') as
			| HTMLButtonElement
			| HTMLInputElement
			| null;
		if (resetTarget && !resetTarget.form) {
			maybeCloseDialog(e);
			return;
		}
	};

	/** Handle the escape key */
	const handleKeydown = (e: KeyboardEvent) => {
		// Don't auto close on escape if popover is open (escape should close
		// the popover here)
		if (e.key === 'Escape' && !dialog()?.querySelector(':popover-open')) {
			maybeCloseDialog(e);
		}
	};

	return (
		<dialog
			{...rest}
			ref={combineRefs(setDialog, props.ref)}
			class={cx('c-modal', props.class)}
			onClick={handleClick}
			onKeyDown={handleKeydown}
		>
			<div class="c-modal__body">{local.children}</div>
		</dialog>
	);
};

export function ModalCloseButton(props: JSX.DialogHtmlAttributes<HTMLButtonElement>) {
	return (
		<Button
			type="reset"
			aria-label="Close"
			{...props}
			class={cx('c-modal__close', props.class)}
			unstyled
		>
			<X />
		</Button>
	);
}

export function ModalTitle(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ['children']);
	return (
		<Group {...rest} class={cx('c-modal__header', rest.class)}>
			<h2 class="c-modal__title">{local.children}</h2>
			<ModalCloseButton />
		</Group>
	);
}

export function ModalContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return <div {...props} class={cx('c-modal__content', props.class)} />;
}
