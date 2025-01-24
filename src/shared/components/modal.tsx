import cx from 'classix';
import { X } from 'lucide-solid';
import {
	type Component,
	createEffect,
	createSignal,
	type JSX,
	onCleanup,
	splitProps,
	useContext,
} from 'solid-js';

import { Button, type ButtonProps, IconButton } from '~/shared/components/button';
import { FormContextProvider } from '~/shared/components/form-context-provider';
import { Group } from '~/shared/components/group';
import { ModalContext } from '~/shared/components/modal-context';
import { combineRefs } from '~/shared/utility/solid/combine-refs';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';
import { T } from '~/shared/utility/text/t-components';
import { t } from '~/shared/utility/text/t-tag';

export interface DialogProps extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
	/** Controls whether the dialog is shown */
	open?: boolean;
	/** Callback for modal being closed */
	onRequestClose?: (e: KeyboardEvent | MouseEvent) => boolean | Promise<boolean>;
	/** Require children */
	children: JSX.Element;
}

/** Magic attribute for button that requests form close */
export const FORM_REQUEST_CLOSE_ATTR = 'data-dialog-cancel';

/** Magic attribute for button that closes the form for real */
export const FORM_CLOSE_ATTR = 'data-dialog-close';

export const Modal: Component<DialogProps> = (props) => {
	const [dialog, setDialog] = createSignal<HTMLDialogElement | null>(null);
	const isMounted = createMountedSignal();
	const [local, rest] = splitProps(props, ['children', 'open']);

	let initialClickTarget: HTMLElement | null = null;
	const setInitialClickTarget = (target: HTMLElement | null) => {
		initialClickTarget = target;
	};

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
		if (target === dialog() && initialClickTarget === dialog()) {
			maybeCloseDialog(e);
			return;
		}

		// Force close and don't allow for speedbump / interruption
		if (target.closest('[' + FORM_CLOSE_ATTR + '="true"]')) {
			dialog()?.close();
			return;
		}

		//  Request close but allow for speedbump / interruption
		if (target.closest('[' + FORM_REQUEST_CLOSE_ATTR + '="true"]')) {
			maybeCloseDialog(e);
			return;
		}
	};

	/** Handle the mouse down event to track initial click target */
	const handleMouseDown = (e: MouseEvent) => {
		setInitialClickTarget(e.target as HTMLElement);
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
		<ModalContext.Provider value={{ open: () => !!props.open }}>
			<dialog
				{...rest}
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
	);
};

export function ModalXButton(props: ButtonProps) {
	return (
		<IconButton
			type="reset"
			label={t`Close`}
			{...{ [FORM_REQUEST_CLOSE_ATTR]: 'true' }}
			{...props}
			class={cx('text-muted', props.class)}
		>
			<X />
		</IconButton>
	);
}

export function ModalCloseButton(props: ButtonProps & { force?: boolean | undefined }) {
	return (
		<Button
			{...props}
			{...{
				[FORM_REQUEST_CLOSE_ATTR]: props.force ? undefined : 'true',
				[FORM_CLOSE_ATTR]: props.force ? 'true' : undefined,
			}}
		>
			{props.children ?? <T>Close</T>}
		</Button>
	);
}

export function ModalTitle(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ['children']);
	return (
		<Group {...rest} class={cx('c-modal__header', rest.class)}>
			<h2 class="c-modal__title">{local.children}</h2>
			<ModalXButton />
		</Group>
	);
}

export function ModalContent(
	props: JSX.HTMLAttributes<HTMLDivElement> & { ref?: (elm: HTMLDivElement) => void },
) {
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
	return <div {...props} class={cx('c-modal__footer', props.class)} />;
}
