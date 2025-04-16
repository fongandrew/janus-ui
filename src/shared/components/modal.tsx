import cx from 'classix';
import { X } from 'lucide-solid';
import {
	createEffect,
	createRenderEffect,
	createSignal,
	type JSX,
	onCleanup,
	Show,
	splitProps,
} from 'solid-js';

import { Button, type ButtonProps, IconButton } from '~/shared/components/button';
import {
	closeModal,
	MODAL_CONTENT_ATTR,
	MODAL_FOOTER_ATTR,
	modalBackdropClick,
	modalBackdropMouseDown,
	modalClosedScrollState,
	modalEscapeKey,
	modalOpenScrollState,
	modalTriggerClose,
	modalTriggerOpen,
	modalTriggerRequestClose,
	openModal,
} from '~/shared/components/callbacks/modal';
import { ErrorFallback } from '~/shared/components/error-fallback';
import { FormElementPropsProvider } from '~/shared/components/form-element-context';
import { ModalContext } from '~/shared/components/modal-context';
import { SpinnerSuspense } from '~/shared/components/spinner';
import { T } from '~/shared/components/t-components';
import { attrNoConflict } from '~/shared/utility/attribute';
import { callbackAttrMods, callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { createAutoId } from '~/shared/utility/solid/auto-prop';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { useT } from '~/shared/utility/solid/locale-context';

/** How long between open prop changes before syncing show state to allow for transitions */
const MODAL_CLOSE_SYNC_DELAY = 5 * 1000;

export type DialogProps = JSX.DialogHtmlAttributes<HTMLDialogElement> & {
	/** Error boundary render callback */
	onError?: ((err: Error & { code: string }, eventId: string) => void) | undefined;
	/** Error boundary reload callback */
	onReload?: (() => void) | undefined;
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

/**
 * Modal dialog component
 *
 * @example
 * ```tsx
 * // Triggered Modal (using element ID)
 * const dialogId = createUniqueId();
 *
 * 	<ModalOpenTrigger targetId={dialogId}>
 * 		<Button>Open Modal</Button>
 * 	</ModalOpenTrigger>
 *
 * 	<Modal id={dialogId}>
 * 		<ModalTitle>Example Modal</ModalTitle>
 * 		<ModalContent>
 * 			<p>Content goes here</p>
 * 		</ModalContent>
 * 		<ModalFooter>
 * 			<ModalCloseButton />
 * 		</ModalFooter>
 * 	</Modal>
 *
 * // Form Modal
 * const FormNames = {
 * 		name: 'name',
 * 		email: 'email',
 * };
 *
 * 	<Modal>
 * 		<ModalTitle>Form Example</ModalTitle>
 * 		<FormContextProvider>
 * 			<ModalFormContent names={FormNames} onSubmit={handleSubmit}>
 * 				<LabelledInput label="Name">
 * 					<Input name={FormNames.name} />
 * 				</LabelledInput>
 * 				<LabelledInput label="Email">
 * 					<Input name={FormNames.email} type="email" />
 * 				</LabelledInput>
 * 			</ModalFormContent>
 * 			<ModalFooter>
 * 				<ModalCancelButton />
 * 				<ModalSubmitButton />
 * 			</ModalFooter>
 * 		</FormContextProvider>
 * 	</Modal>
 * ```
 */
export function Modal(props: DialogProps) {
	const [dialog, setDialog] = createSignal<HTMLDialogElement | null>(null);
	const [local, rest] = splitProps(props, ['children', 'id', 'open', 'onError', 'onReload']);

	// Open state
	const [open, setOpen] = createSignal<boolean | undefined>();
	createRenderEffect(() => {
		if (local.open !== false) {
			setOpen(true);
			return;
		}

		// Defer updating closed state for a set amount of time to allow for transitions
		// This can be long since there are other things
		const timeout = setTimeout(() => setOpen(false), MODAL_CLOSE_SYNC_DELAY);
		onCleanup(() => clearTimeout(timeout));
	});

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
		<Show when={open()}>
			<ModalContext.Provider value={id}>
				<dialog
					{...rest}
					{...callbackAttrs(
						rest,
						modalBackdropMouseDown,
						modalBackdropClick,
						modalEscapeKey,
					)}
					id={id()}
					ref={combineRefs(setDialog, props.ref)}
					class={cx('c-modal', props.class)}
				>
					<div class="c-modal__body">
						<ErrorFallback onError={local.onError} onReload={local.onReload} stretch>
							<SpinnerSuspense>{local.children}</SpinnerSuspense>
						</ErrorFallback>
					</div>
				</dialog>
			</ModalContext.Provider>
		</Show>
	);
}

/**
 * X button in corner of modal
 *
 * @example
 * ```tsx
 * 	<ModalTitle>
 * 		Modal Title
 * 		<ModalXButton />
 * 	</ModalTitle>
 * ```
 */
export function ModalXButton(props: ButtonProps) {
	const t = useT();
	return (
		<IconButton
			label={t`Close`}
			{...props}
			{...callbackAttrs(props, modalTriggerRequestClose)}
			class={cx('c-modal__x', props.class)}
		>
			<X />
		</IconButton>
	);
}

/**
 * Generic button for closing current modal
 *
 * @example
 * ```tsx
 * 	<ModalFooter>
 * 		<ModalCloseButton>Cancel</ModalCloseButton>
 * 	</ModalFooter>
 *
 * // With force close option
 * 	<ModalCloseButton force>Close</ModalCloseButton>
 *
 * // Targeting a specific modal
 * 	<ModalCloseButton targetId="my-modal-id">Close</ModalCloseButton>
 * ```
 */
export function ModalCloseButton(
	props: ButtonProps & { force?: boolean | undefined; targetId?: string | undefined } = {},
) {
	return (
		<Button
			{...props}
			{...callbackAttrs(props, props.force ? modalTriggerClose : modalTriggerRequestClose)}
			aria-controls={props.targetId}
		>
			{props.children ?? <T>Close</T>}
		</Button>
	);
}

/**
 * Wrapper component that makes its child open a particular modal
 *
 * @example
 * ```tsx
 * // Open a modal by ID
 * const dialogId = createUniqueId();
 *
 * 	<ModalOpenTrigger targetId={dialogId}>
 * 		<Button>Open Modal</Button>
 * 	</ModalOpenTrigger>
 *
 * 	<Modal id={dialogId}>
 * 		<ModalTitle>Example Modal</ModalTitle>
 * 		<ModalContent>Content here...</ModalContent>
 * 	</Modal>
 * ```
 */
export function ModalOpenTrigger(props: { children: JSX.Element; targetId: string }) {
	return (
		<FormElementPropsProvider
			aria-controls={(prev) => attrNoConflict(prev, props.targetId)}
			aria-expanded={() => false}
			aria-haspopup={(prev) => attrNoConflict(prev, 'dialog')}
			{...callbackAttrMods(modalTriggerOpen)}
		>
			{props.children}
		</FormElementPropsProvider>
	);
}

/**
 * Modal title component with header styling
 *
 * @example
 * ```tsx
 * 	<Modal id={dialogId}>
 * 		<ModalTitle>Modal Title</ModalTitle>
 * 		<ModalContent>Content goes here</ModalContent>
 * 	</Modal>
 * ```
 */
export function ModalTitle(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ['children']);
	return (
		<div {...rest} class={cx('c-modal__header', rest.class)}>
			<h2 class="c-modal__title">{local.children}</h2>
			<ModalXButton />
		</div>
	);
}

/**
 * Modal content container with proper styling and scroll behavior
 *
 * @example
 * ```tsx
 * 	<Modal id={dialogId}>
 * 		<ModalTitle>Modal Title</ModalTitle>
 * 		<ModalContent>
 * 			<p>This is the main content area of the modal.</p>
 * 			<p>It can contain any elements or components.</p>
 * 		</ModalContent>
 * 	</Modal>
 * ```
 */
export function ModalContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			{...props}
			{...callbackAttrs(props, modalOpenScrollState, modalClosedScrollState)}
			{...{ [MODAL_CONTENT_ATTR]: '' }}
			class={cx('c-modal__content', props.class)}
		/>
	);
}

/**
 * Modal footer container for action buttons
 *
 * @example
 * ```tsx
 * 	<Modal id={dialogId}>
 * 		<ModalTitle>Modal Title</ModalTitle>
 * 		<ModalContent>Content goes here</ModalContent>
 * 		<ModalFooter>
 * 			<ModalCloseButton>Cancel</ModalCloseButton>
 * 			<Button class="v-colors-primary">Confirm</Button>
 * 		</ModalFooter>
 * 	</Modal>
 * ```
 */
export function ModalFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			{...props}
			{...{ [MODAL_FOOTER_ATTR]: '' }}
			class={cx('c-modal__footer', props.class)}
		/>
	);
}
