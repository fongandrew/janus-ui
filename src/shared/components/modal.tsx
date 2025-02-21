import cx from 'classix';
import { X } from 'lucide-solid';
import {
	createEffect,
	createMemo,
	createSignal,
	type JSX,
	onCleanup,
	Show,
	splitProps,
	useContext,
} from 'solid-js';
import { createUniqueId } from 'solid-js';

import { Button, type ButtonProps, IconButton } from '~/shared/components/button';
import { FormContextProvider } from '~/shared/components/form-context-provider';
import { FORM_CONTROL_ATTR } from '~/shared/components/form-element-control';
import { ModalContext, type ModalContextValue } from '~/shared/components/modal-context';
import { firstFocusable } from '~/shared/utility/focusables';
import { pullLast } from '~/shared/utility/list';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';
import { T } from '~/shared/utility/text/t-components';
import { t } from '~/shared/utility/text/t-tag';

export interface DialogProps extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
	/** Controls whether the dialog is shown */
	open: boolean;
	/**
	 * Callback when dialog is closed. This is required because the "open" state of
	 * a modal has to be managed externally (i.e. it's a controlled component) and
	 * logic within the modal needs to be able to trigger the close. Without this,
	 * the prop and the actual state of the dialog could end up out of sync.
	 */
	onClose: JSX.EventHandlerUnion<HTMLDialogElement, Event>;
	/**
	 * Callback for when closing the dialog is requested. Return false to prevent
	 * the dialog from closing. This is useful for speed bumps or other confirmations.
	 */
	onRequestClose?: (() => boolean | void) | undefined;
	/** Require children */
	children: JSX.Element;
}

/**
 * Magic attribute for button that requests form close -- should reference the ID of
 * the modal being closed
 */
export const FORM_REQUEST_CLOSE_ATTR = 'data-dialog-cancel';

/**
 * Magic attribute to identify modal content (used to find focusable elements)
 */
export const MODAL_CONTENT_ATTR = 'data-dialog-content';

/**
 * Magic attribute to identify modal footer (used to find focusable elements)
 */
export const MODAL_FOOTER_ATTR = 'data-dialog-footer';

/**
 * Magic attribute for button that closes the form for real (used by speed bump).
 * Should also reference the ID of the modal being closed.
 */
export const FORM_CLOSE_ATTR = 'data-dialog-close';

/**
 * Set an autofocus attribute on the first focusable element in the modal if none
 * there to ensure focus moves into the modal from the trigger.
 */
export function setAutofocus(dialog: HTMLDialogElement) {
	if (dialog.querySelector('[autofocus]')) return;

	// Prefer form control element that is not the close button (input)
	let target: HTMLElement | null | undefined = dialog.querySelector<HTMLElement>(
		'[' +
			FORM_CONTROL_ATTR +
			']:not([' +
			FORM_CLOSE_ATTR +
			']):not([' +
			FORM_REQUEST_CLOSE_ATTR +
			'])',
	);
	if (target) {
		target.autofocus = true;
		return;
	}

	// Prefer focusable in content
	const content = dialog.querySelector<HTMLElement>('[' + MODAL_CONTENT_ATTR + ']');
	target = content ? firstFocusable(content) : undefined;
	if (target) {
		target.autofocus = true;
		return;
	}

	// If no content, look in footer
	const footer = dialog.querySelector<HTMLElement>('[' + MODAL_FOOTER_ATTR + ']');
	target = footer ? firstFocusable(footer) : undefined;
	if (target) {
		target.autofocus = true;
		return;
	}

	// Else just autofocus the first focusable in the dialog
	target = firstFocusable(dialog);
	if (target) {
		target.autofocus = true;
	}
}

export function Modal(props: DialogProps) {
	const [dialog, setDialog] = createSignal<HTMLDialogElement | null>(null);
	const isMounted = createMountedSignal();
	const [local, rest] = splitProps(props, ['children', 'id', 'open']);

	// Auto-generate ID if needed
	const id = createMemo(() => local.id ?? createUniqueId());

	// Modal context that'll be accessible to child components
	const requestCloseCallbacks: DialogProps['onRequestClose'][] = [];
	const modalContext: ModalContextValue = {
		id,
		open: () => !!local.open,
		onRequestClose: (callback) => {
			requestCloseCallbacks.push(callback);
			onCleanup(() => {
				pullLast(requestCloseCallbacks, callback);
			});
		},
	};

	// Handle open state changes after mount
	createEffect(() => {
		const dialogElm = dialog();
		if (!isMounted() || !dialogElm) return;

		if (local.open) {
			setAutofocus(dialogElm);
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

		// Prevent default (dialog closing if this is triggered via form method="dialog"
		// submit) since we'll be manually closing dialog (if applicable)
		e.preventDefault();

		for (const callback of [...requestCloseCallbacks, props.onRequestClose]) {
			const ret = callback?.();
			if (ret === false) return;
		}

		dialog()?.close();
	};

	/** Whether mousedown target is this dialog */
	let initialClickTargetIsDialog = false;

	/**
	 * Handle the mouse down event to track initial click target. This is necessary
	 * because we don't want a click that starts on the dialog but moves outside to the
	 * backdrop to close the dialog (as is sometimes the case when selecting text).
	 */
	const handleMouseDown = (e: MouseEvent) => {
		initialClickTargetIsDialog = e.target === dialog();
	};

	/** Click handler for things that might close the modal */
	const handleClick = (e: MouseEvent) => {
		const target = e.target as HTMLElement | null;
		if (!target) return;

		// Clicking the backdrop should close it. This should not fire if clicking
		// the dialog body itself since target will be the dialog content element
		// or a child of it.
		if (target === dialog() && initialClickTargetIsDialog) {
			maybeCloseDialog(e);
			return;
		}

		// Force close and don't allow for speedbump / interruption
		if (target.closest('[' + FORM_CLOSE_ATTR + ']')?.getAttribute(FORM_CLOSE_ATTR) === id()) {
			// Close any child dialogs before closing this one (to trigger close events and
			// signal bookkeeping)
			for (const childDialog of dialog()?.querySelectorAll(':modal') ?? []) {
				(childDialog as HTMLDialogElement).close();
			}
			dialog()?.close();
			return;
		}

		//  Request close but allow for speedbump / interruption
		if (
			target
				.closest('[' + FORM_REQUEST_CLOSE_ATTR + ']')
				?.getAttribute(FORM_REQUEST_CLOSE_ATTR) === id()
		) {
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
		<Show when={local.open}>
			<ModalContext.Provider value={modalContext}>
				<dialog
					{...rest}
					id={id()}
					ref={combineRefs(setDialog, props.ref)}
					class={cx('c-modal', props.class)}
					onClick={handleClick}
					onMouseDown={handleMouseDown}
					onKeyDown={handleKeydown}
				>
					<FormContextProvider>
						<div class="c-modal__body">{local.children}</div>
					</FormContextProvider>
				</dialog>
			</ModalContext.Provider>
		</Show>
	);
}

/** X button in corner of modal */
export function ModalXButton(props: ButtonProps) {
	const modalContext = useContext(ModalContext);
	return (
		<IconButton
			label={t`Close`}
			{...{ [FORM_REQUEST_CLOSE_ATTR]: modalContext?.id() }}
			{...props}
			class={cx('c-modal__x', props.class)}
		>
			<X />
		</IconButton>
	);
}

/** Generic button for closing current modal */
export function ModalCloseButton(
	props: ButtonProps & { force?: boolean | undefined; targetId?: string | undefined } = {},
) {
	const modalContext = useContext(ModalContext);
	const targetId = () => props.targetId ?? modalContext?.id();
	return (
		<Button
			{...props}
			{...{
				[FORM_REQUEST_CLOSE_ATTR]: props.force ? undefined : targetId(),
				[FORM_CLOSE_ATTR]: props.force ? targetId() : undefined,
			}}
		>
			{props.children ?? <T>Close</T>}
		</Button>
	);
}

export function ModalTitle(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ['children']);
	return (
		<div {...rest} class={cx('o-group', 'c-modal__header', rest.class)}>
			<h2 class="c-modal__title">{local.children}</h2>
			<ModalXButton />
		</div>
	);
}

export function ModalContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [ref, setRef] = createSignal<HTMLDivElement | null>(null);
	const modalContext = useContext(ModalContext);

	const [scrolledToTop, setScrolledToTop] = createSignal(true);
	const [scrolledToBottom, setScrolledToBottom] = createSignal(true);

	// Scroll handler
	const updateScrollState = () => {
		const content = ref();
		if (!content) return;
		setScrolledToTop(content.scrollTop === 0);
		// 2px buffer to account for rounding errors and general weirdness
		setScrolledToBottom(content.scrollHeight - content.scrollTop - 2 <= content.clientHeight);
	};

	createEffect(() => {
		const content = ref();
		if (!content) return;
		if (!modalContext?.open?.()) return;
		content.addEventListener('scroll', updateScrollState, { passive: true });
		onCleanup(() => content.removeEventListener('scroll', updateScrollState));

		// Trigger once on mount in case there's nothing to scroll
		updateScrollState();
	});

	return (
		<div
			{...props}
			{...{ [MODAL_CONTENT_ATTR]: '' }}
			ref={combineRefs(setRef, props.ref)}
			class={cx(
				'c-modal__content',
				scrolledToTop() && 'c-modal__content--scroll-top',
				scrolledToBottom() && 'c-modal__content--scroll-bottom',
				props.class,
			)}
		/>
	);
}

export function ModalFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			{...props}
			{...{ [MODAL_FOOTER_ATTR]: '' }}
			class={cx('c-modal__footer', props.class)}
		/>
	);
}
