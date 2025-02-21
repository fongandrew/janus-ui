import cx from 'classix';
import { children, createMemo, type JSX } from 'solid-js';
import { createUniqueId } from 'solid-js';

import { useFormElement } from '~/shared/components/form-element-context';

export interface ErrorMessageProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * Displays error message for this input group if any
 */
export function ErrorMessage(props: ErrorMessageProps) {
	const id = createMemo(() => props.id || createUniqueId());
	const formControl = useFormElement();

	const resolvedErrorMsg = children(() => {
		if (props.children) return props.children;
		return formControl?.error() ?? null;
	});

	// See https://cerovac.com/a11y/2024/06/support-for-aria-errormessage-is-getting-better-but-still-not-there-yet/
	// As of Dec 2024, aria-errormessage still isn't quite there in Voiceover at least.
	formControl?.extAttr('aria-describedby', () => (resolvedErrorMsg() ? id() : undefined));
	formControl?.defaultAttr('aria-invalid', () => (resolvedErrorMsg() ? 'true' : undefined));

	return (
		<div {...props} id={id()} class={cx('c-error-message', props.class)}>
			{resolvedErrorMsg()}
		</div>
	);
}
