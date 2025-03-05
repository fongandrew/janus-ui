import cx from 'classix';
import { splitProps } from 'solid-js';

import { Card, CardContent } from '~/shared/components/card';
import { Description } from '~/shared/components/description';
import { ErrorMessage } from '~/shared/components/error-message';
import { FormElementPropsProvider } from '~/shared/components/form-element-context';
import { LabelSpan } from '~/shared/components/label';
import { type LabelledInputProps } from '~/shared/components/labelled-control';
import { attrs } from '~/shared/utility/attribute-list';
import { createAuto } from '~/shared/utility/solid/auto-prop';

/** Label + squarish action trigger (like button or toggle) */
export function LabelledAction(props: LabelledInputProps) {
	const [local, rest] = splitProps(props, [
		'label',
		'labelId',
		'description',
		'descriptionId',
		'errorMessage',
		'errorId',
		'children',
	]);

	const descriptionId = createAuto(props, 'descriptionId');
	const errorId = createAuto(props, 'errorId');
	const labelId = createAuto(props, 'labelId');

	return (
		<div {...rest} class={cx('c-labelled-action', props.class)}>
			<div class="c-labelled-action__label">
				<LabelSpan id={labelId()}>{local.label}</LabelSpan>
				{local.description ? (
					<Description id={descriptionId()}>{local.description}</Description>
				) : null}
				<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
			</div>
			<FormElementPropsProvider
				aria-describedby={(prev) =>
					attrs(prev, props.description ? descriptionId() : null, errorId())
				}
				aria-labelledby={(prev) => attrs(prev, labelId())}
			>
				{local.children}
			</FormElementPropsProvider>
		</div>
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
