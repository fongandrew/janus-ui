import { type JSX, splitProps, useContext } from 'solid-js';

import {
	type DialogProps,
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalTitle,
} from '~/shared/components/modal';
import { ModalContext } from '~/shared/components/modal-context';
import { T } from '~/shared/components/t-components';

export interface ModalSpeedBumpProps extends Omit<DialogProps, 'children'> {
	/** ID required for speed bump targeting to work */
	id: string;
	/** Title for the speed bump dialog */
	title?: string;
	/** Text for the cancel button */
	cancel?: string;
	/** Text for the confirm button */
	confirm?: string;
	/** Children to render in the speed bump */
	children?: JSX.Element;
}

export function ModalSpeedBump(props: ModalSpeedBumpProps) {
	const modalId = useContext(ModalContext);
	if (!modalId) {
		throw new Error('ModalSpeedBump must be used within a Modal');
	}

	const [local, modalProps] = splitProps(props, [
		'title',
		'cancel',
		'confirm',
		'children',
		'open',
	]);
	return (
		// Typecast to undefined to avoid TS error (should usually be undefined
		// but if explicit true/false passed, then Modal checks for a corresponding
		// onClose that isn't managed by this component)
		<Modal open={local.open as undefined} role="alertdialog" {...modalProps}>
			<ModalTitle>{local.title ?? <T>Please confirm</T>}</ModalTitle>
			<ModalContent>
				{local.children ?? (
					<T>
						Are you sure you want to close this? You may lose any data you've entered.
					</T>
				)}
			</ModalContent>
			<ModalFooter>
				<ModalCloseButton>{local.cancel ?? <T>Cancel</T>}</ModalCloseButton>
				<ModalCloseButton force class="v-colors-danger" targetId={modalId()}>
					{local.confirm ?? <T>Close</T>}
				</ModalCloseButton>
			</ModalFooter>
		</Modal>
	);
}
