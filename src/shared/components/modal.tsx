import cx from 'classix';
import { X } from 'lucide-solid';
import { createEffect, createSignal, type JSX, onCleanup, Show, splitProps } from 'solid-js';

import { Button, type ButtonProps, IconButton } from '~/shared/components/button';
import { FormContextProvider } from '~/shared/components/form-context';
import { FormElementPropsProvider } from '~/shared/components/form-element-context';
import { ModalContext } from '~/shared/components/modal-context';
import {
	closeModal,
	MODAL_CONTENT_ATTR,
	MODAL_FOOTER_ATTR,
	modalBackdropClick,
	modalBackdropMouseDown,
	modalEscapeKey,
	modalTriggerClose,
	modalTriggerOpen,
	modalTriggerRequestClose,
	openModal,
} from '~/shared/handlers/modal';
import { attrNoConflict } from '~/shared/utility/attribute';
import { extendHandlerProps, handlerProps } from '~/shared/utility/event-handler-attrs';
import { createAutoId } from '~/shared/utility/solid/auto-prop';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { T } from '~/shared/utility/text/t-components';
import { t } from '~/shared/utility/text/t-tag';

export type DialogProps = JSX.DialogHtmlAttributes<HTMLDialogElement> & {
	/**
	 * Callback for when closing the dialog is requested. Return false to prevent
	 * the dialog from closing. This is useful for speed bumps or other confirmations.
	 */
	onRequestClose?: (() => boolean | void) | undefined;
	/** Require children */
	children: JSX.Element;
} & (
		| {
				/** Controls whether the dialog is shown */
				open: boolean;
				/**
				 * If open is present, then must specify callback for when dialog is closed.
				 * It implies the "open" state of a modal is managed externally (i.e. it's a
				 * controlled component) but logic within the modal needs to be able to trigger
				 * the close. Without this, the prop and the actual state of the dialog could
				 * end up out of sync.
				 */
				onClose: JSX.EventHandlerUnion<HTMLDialogElement, Event>;
		  }
		| {
				open?: undefined;
		  }
	);

export function Modal(props: DialogProps) {
	const [dialog, setDialog] = createSignal<HTMLDialogElement | null>(null);
	const [local, rest] = splitProps(props, ['children', 'id', 'open']);

	// Auto-generate ID if needed
	const id = createAutoId(local);

	// Handle open state changes after mount
	createEffect(() => {
		const dialogElm = dialog();
		if (!dialogElm) return;
		if (local.open) {
			openModal(dialogElm);
		} else if (local.open === false && dialogElm.open) {
			closeModal(dialogElm);
		}
	});

	// Clean up by ensuring dialog is closed
	onCleanup(() => {
		const dialogElm = dialog();
		if (dialogElm?.open) {
			closeModal(dialogElm);
		}
	});

	return (
		// local.open being undefined implies we should show and rely on the dialog's
		// own open state to control visibility
		<Show when={local.open !== false}>
			<ModalContext.Provider value={id}>
				<dialog
					{...rest}
					{...handlerProps(
						rest,
						modalBackdropMouseDown,
						modalBackdropClick,
						modalEscapeKey,
					)}
					id={id()}
					ref={combineRefs(setDialog, props.ref)}
					class={cx('c-modal', props.class)}
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
	return (
		<IconButton
			label={t`Close`}
			{...props}
			{...handlerProps(props, modalTriggerRequestClose)}
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
	return (
		<Button
			{...props}
			{...handlerProps(props, props.force ? modalTriggerClose : modalTriggerRequestClose)}
			aria-controls={props.targetId}
		>
			{props.children ?? <T>Close</T>}
		</Button>
	);
}

/** Wrap around a button to make it open a particular modal */
export function ModalOpenTrigger(props: { children: JSX.Element; targetId: string }) {
	return (
		<FormElementPropsProvider
			aria-controls={(prev) => attrNoConflict(prev, props.targetId)}
			aria-expanded={() => false}
			aria-haspopup={(prev) => attrNoConflict(prev, 'dialog')}
			{...extendHandlerProps(modalTriggerOpen)}
		>
			{props.children}
		</FormElementPropsProvider>
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
	// const modalContext = useContext(ModalContext);

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

	// createEffect(() => {
	// 	const content = ref();
	// 	if (!content) return;
	// 	if (!modalContext?.open?.()) return;
	// 	content.addEventListener('scroll', updateScrollState, { passive: true });
	// 	onCleanup(() => content.removeEventListener('scroll', updateScrollState));

	// 	// Trigger once on mount in case there's nothing to scroll
	// 	updateScrollState();
	// });

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
