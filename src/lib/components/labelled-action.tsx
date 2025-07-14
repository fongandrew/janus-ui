import cx from 'classix';
import { splitProps } from 'solid-js';

import { Card, CardContent } from '~/lib/components/card';
import { Description } from '~/lib/components/description';
import { ErrorMessage } from '~/lib/components/error-message';
import { FormElementPropsProvider } from '~/lib/components/form-element-context';
import { LabelSpan } from '~/lib/components/label';
import { type LabelledInputProps } from '~/lib/components/labelled-control';
import { attrs } from '~/lib/utility/attribute-list';
import { createAuto } from '~/lib/utility/solid/auto-prop';

/** Label + squarish action trigger (like button or toggle)
 *
 * Use this component to pair a label with an action element like a button or toggle switch.
 * The label appears on the left and the action appears on the right.
 *
 * @example
 * ```tsx
 * 	// With a button
 * 	<LabelledAction
 *  	label="Delete account"
 *  	description="This action cannot be undone"
 * 	>
 * 		<Button class="v-colors-danger">Delete</Button>
 * 	</LabelledAction>
 *
 * 	// With a toggle switch
 * 	<LabelledAction
 *  	label="Dark mode"
 *  	description="Use dark colors for UI elements"
 * 	>
 *  	<ToggleSwitch checked={isDarkMode()} onChange={toggleDarkMode} />
 * 	</LabelledAction>
 *
 * 	// With an error message
 * 	<LabelledAction
 * 		label="Clear data"
 * 		description="Remove all saved information"
 * 		errorMessage="You don't have permission to clear data"
 * 	>
 * 		<Button disabled>Clear</Button>
 *	</LabelledAction>
 * ```
 */
export function LabelledAction(props: LabelledInputProps) {
	const [local, rest] = splitProps(props, [
		'label',
		'labelId',
		'description',
		'descriptionId',
		'errorMessage',
		'errorId',
		'required',
		'children',
	]);

	const descriptionId = createAuto(props, 'descriptionId');
	const errorId = createAuto(props, 'errorId');
	const labelId = createAuto(props, 'labelId');

	return (
		<div {...rest} class={cx('c-labelled-action', props.class)}>
			<div class="c-labelled-action__label">
				<LabelSpan id={labelId()} required={local.required}>
					{local.label}
				</LabelSpan>
				{local.description || local.descriptionId ? (
					<Description id={descriptionId()}>{local.description}</Description>
				) : null}
				<ErrorMessage id={errorId()}>{local.errorMessage}</ErrorMessage>
			</div>
			<FormElementPropsProvider
				aria-describedby={(prev) =>
					attrs(
						prev,
						props.description || props.descriptionId ? descriptionId() : null,
						errorId(),
					)
				}
				aria-labelledby={(prev) => attrs(prev, labelId())}
			>
				{local.children}
			</FormElementPropsProvider>
		</div>
	);
}

/** LabelledAction wrapped in a Card component
 *
 * This is a convenience component that combines LabelledAction with a Card container.
 * Use this when you need to display the action in a card-style container.
 *
 * @example
 * ```tsx
 * 	// Button in a card
 * 	<LabelledActionCard
 *  	label="Export data"
 *  	description="Download all your data as a CSV file"
 * 	>
 * 		<Button>Export</Button>
 * 	</LabelledActionCard>
 *
 * 	// Toggle in a card
 * 	<LabelledActionCard
 *  	label="Notifications"
 *  	description="Receive alerts about important events"
 * 	>
 *  	<ToggleSwitch checked={notificationsEnabled()} onChange={toggleNotifications} />
 *	</LabelledActionCard>
 * ```
 */
export function LabelledActionCard(props: LabelledInputProps) {
	return (
		<Card as="div">
			<CardContent>
				<LabelledAction {...props} />
			</CardContent>
		</Card>
	);
}
