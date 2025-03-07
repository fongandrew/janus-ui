import { VALID_SUBMIT_EVENT } from '~/shared/handlers/form';
import {
	closeModal,
	createClosedCallback,
	createRequestCloseCallback,
	openModal,
} from '~/shared/handlers/modal';
import { getValidatableElements, touched } from '~/shared/handlers/validation';
import { createHandler } from '~/shared/utility/event-handler-attrs';
import { data } from '~/shared/utility/magic-strings';

export const modalFormCloseOnSuccess = createHandler(
	VALID_SUBMIT_EVENT,
	'modal-form__close-on-success',
	(e) => {
		const dialog = e.currentTarget.closest(':modal') as HTMLDialogElement | null;
		if (!dialog) return;
		closeModal(dialog);
	},
);

export const modalFormResetOnClose = createClosedCallback('modal-form__reset-on-close', (elm) => {
	const form = elm as HTMLFormElement;
	form.reset();
});

export const modalFormMaybeShowSpeedBump = Object.assign(
	createRequestCloseCallback('modal-form__maybe_show_speed_bump', (e) => {
		const dialog = e.currentTarget.closest(':modal') as HTMLDialogElement | null;
		if (!dialog) return;

		const speedBump = dialog.querySelector<HTMLDialogElement>(
			`[${modalFormMaybeShowSpeedBump.SPEED_BUMP_ATTR}]`,
		);
		if (!speedBump) return;

		for (const element of getValidatableElements(dialog)) {
			if (touched(element)) {
				openModal(speedBump);
				return false;
			}
		}
	}),
	{
		SPEED_BUMP_ATTR: data('modal-form__speed_bump'),
	},
);
