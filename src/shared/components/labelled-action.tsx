import cx from 'classix';
import { splitProps } from 'solid-js';

import { Card, CardContent } from '~/shared/components/card';
import { Description } from '~/shared/components/description';
import { ErrorMessage } from '~/shared/components/error-message';
import { FormElementProvider } from '~/shared/components/form-element-provider';
import { Label } from '~/shared/components/label';
import { type LabelledInputProps } from '~/shared/components/labelled-control';

/** Label + squarish action trigger (like button or toggle) */
export function LabelledAction(props: LabelledInputProps) {
	const [local, rest] = splitProps(props, ['label', 'description', 'errorMessage', 'children']);
	return (
		<FormElementProvider>
			<div {...rest} class={cx('c-labelled-action', props.class)}>
				<div class="c-labelled-action__label">
					<Label>{local.label}</Label>
					{local.description ? <Description>{local.description}</Description> : null}
					<ErrorMessage>{local.errorMessage}</ErrorMessage>
				</div>
				{local.children}
			</div>
		</FormElementProvider>
	);
}

/** LabelledAciton wrapped in Card */
export function LabelledActionCard(props: LabelledInputProps) {
	return (
		<Card>
			<CardContent>
				<LabelledAction {...props} />
			</CardContent>
		</Card>
	);
}
