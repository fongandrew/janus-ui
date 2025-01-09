import { type JSX, splitProps } from 'solid-js';

import { Description } from '~/shared/components/description';
import { ErrorMessage } from '~/shared/components/error-message';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';

export interface LabelledControlProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** The actual label */
	label: JSX.Element;
	/** Optional description content */
	description?: JSX.Element;
	/** Optional error message content, will otherwise pull from input itself */
	errorMessage?: JSX.Element;
	/** Child required (this is the input) */
	children: JSX.Element;
}

export function LabelledControl(props: LabelledControlProps) {
	const [local, rest] = splitProps(props, ['label', 'description', 'errorMessage', 'children']);
	return (
		<LabelStack {...rest}>
			<Label>{local.label}</Label>
			{local.description ? <Description>{local.description}</Description> : null}
			{local.children}
			<ErrorMessage>{local.errorMessage}</ErrorMessage>
		</LabelStack>
	);
}
