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
import { T } from '~/shared/utility/text/t-components';

export interface ModalSpeedBumpProps extends Omit<DialogProps, 'children'> {
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
	const modalContext = useContext(ModalContext);
	if (!modalContext) {
		throw new Error('ModalSpeedBump must be used within a Modal');
	}

	const [local, modalProps] = splitProps(props, ['title', 'cancel', 'confirm', 'children']);
	return (
		<Modal role="alertdialog" {...modalProps}>
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
				<ModalCloseButton force class="v-colors-danger" targetId={modalContext.id()}>
					{local.confirm ?? <T>Close</T>}
				</ModalCloseButton>
			</ModalFooter>
		</Modal>
	);
}
