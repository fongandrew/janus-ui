import cx from 'classix';
import { children, createEffect, type JSX, onCleanup, useContext } from 'solid-js';

import { FormControlContext } from '~/shared/components/form-control-context';
import { errorValidationMap } from '~/shared/components/merge-form-control-props';
import { updateAttributeList } from '~/shared/utility/attribute-list';
import { generateId } from '~/shared/utility/id-generator';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';

export interface ErrorMessageProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * Displays error message for this input group if any
 */
export function ErrorMessage(props: ErrorMessageProps) {
	const [input] = useContext(FormControlContext);

	const defaultId = generateId('error');
	const id = () => props.id || defaultId;

	const resolvedErrorMsg = children(() => {
		if (props.children) return props.children;
		const inputElm = input();
		if (!inputElm) return null;

		// Error validation map returns accessor for JSX so need to call it
		// again to get the actual JSX
		return errorValidationMap.get(inputElm)?.error()?.() ?? null;
	});

	const isMounted = createMountedSignal();
	createEffect(() => {
		if (!isMounted()) return;

		const inputElm = input();
		if (!inputElm) return;

		const errorMsg = resolvedErrorMsg();
		if (!errorMsg) return;

		const errorMsgId = id();

		// See https://cerovac.com/a11y/2024/06/support-for-aria-errormessage-is-getting-better-but-still-not-there-yet/
		// As of Dec 2024, aria-errormessage still isn't quite there in Voiceover at least.
		updateAttributeList(inputElm, 'aria-describedby', [errorMsgId]);
		onCleanup(() => {
			updateAttributeList(inputElm, 'aria-describedby', [], [errorMsgId]);
		});
	});

	return (
		<div {...props} id={id()} class={cx('c-error-message', props.class)}>
			{resolvedErrorMsg()}
		</div>
	);
}
