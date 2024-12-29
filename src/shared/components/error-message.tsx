import cx from 'classix';
import {
	children,
	createEffect,
	type JSX,
	onCleanup,
	Show,
	splitProps,
	useContext,
} from 'solid-js';

import { FormControlContext } from '~/shared/components/form-control-context';
import { updateAttributeList } from '~/shared/utility/attribute-list';
import { generateId } from '~/shared/utility/id-generator';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';

export interface ErrorMessageProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * Displays error message for this input group if any
 */
export function ErrorMessage(props: ErrorMessageProps) {
	const [local, rest] = splitProps(props, ['children']);
	const context = useContext(FormControlContext);
	const resolvedErrorMsg = children(() => local.children ?? context?.error() ?? null);

	const defaultId = generateId('error');
	const id = () => props.id || defaultId;

	const isMounted = createMountedSignal();
	createEffect(() => {
		if (!isMounted()) return;

		const input = context?.input();
		if (!input) return;

		const errorMsg = resolvedErrorMsg();
		if (!errorMsg) return;

		const errorMsgId = id();

		// See https://cerovac.com/a11y/2024/06/support-for-aria-errormessage-is-getting-better-but-still-not-there-yet/
		// As of Dec 2024, aria-errormessage still isn't quite there in Voiceover at least.
		updateAttributeList(input, 'aria-describedby', [errorMsgId]);
		onCleanup(() => {
			updateAttributeList(input, 'aria-describedby', [], [errorMsgId]);
		});
	});

	return (
		<Show when={resolvedErrorMsg()}>
			<div {...rest} id={id()} class={cx('c-error-message', rest.class)}>
				{resolvedErrorMsg()}
			</div>
		</Show>
	);
}
