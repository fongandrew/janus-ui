import '~/shared/components/error-message.css';

import cx from 'classix';
import { children, createMemo, type JSX } from 'solid-js';

import { useFormElement } from '~/shared/components/form-element-context';
import { generateId } from '~/shared/utility/id-generator';

export interface ErrorMessageProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * Displays error message for this input group if any
 */
export function ErrorMessage(props: ErrorMessageProps) {
	const id = createMemo(() => props.id || generateId('error'));
	const formControl = useFormElement();

	const resolvedErrorMsg = children(() => {
		if (props.children) return props.children;
		return formControl?.error() ?? null;
	});

	// See https://cerovac.com/a11y/2024/06/support-for-aria-errormessage-is-getting-better-but-still-not-there-yet/
	// As of Dec 2024, aria-errormessage still isn't quite there in Voiceover at least.
	formControl?.extAttr('aria-describedby', () => (resolvedErrorMsg() ? id() : undefined));
	formControl?.setAttr('aria-invalid', () => (resolvedErrorMsg() ? 'true' : undefined));

	return (
		<div {...props} id={id()} class={cx('c-error-message', props.class)}>
			{resolvedErrorMsg()}
		</div>
	);
}
