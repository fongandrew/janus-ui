import cx from 'classix';
import { AlertCircle, AlertTriangle, CheckCircle, Info, type LucideProps } from 'lucide-solid';
import { children, type Component, type ComponentProps, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { emptyAttr } from '~/shared/utility/empty-attr';

/** Base alert props shared by all alert variants */
export type AlertBaseProps = Omit<ComponentProps<'div'>, 'id'> & {
	/** ID for container element */
	containerId?: string | undefined;
	/** ID for the actual thing with role="alert" */
	alertId?: string | undefined;
	/** Optional icon override */
	icon?: Component<LucideProps>;
};

/** Base alert component used by specific variants */
function AlertBase(props: AlertBaseProps & { defaultIcon: typeof Info }) {
	const [local, rest] = splitProps(props, [
		'alertId',
		'class',
		'containerId',
		'icon',
		'children',
		'defaultIcon',
		'style',
	]);

	const resolved = children(() => local.children);

	return (
		<div id={local.containerId} class={cx('c-alert', local.class)} style={local.style}>
			<span class="t-flex-static">
				<Dynamic component={local.icon ?? local.defaultIcon} aria-hidden="true" />
			</span>
			<div
				role="alert"
				id={local.alertId}
				aria-live="assertive"
				class="c-alert__children t-flex-fill"
				{...emptyAttr(resolved())}
				{...rest}
			>
				{resolved()}
			</div>
		</div>
	);
}

/** Info alert for general information
 *
 * @example
 * ```tsx
 * 	<InfoAlert>This is an info alert with useful information</InfoAlert>
 * ```
 */
export function InfoAlert(props: AlertBaseProps) {
	return <AlertBase defaultIcon={Info} aria-live="polite" {...props} />;
}

/** Callout if an info alert that isn't treated that way for ARIA purposes
 *
 * @example
 * ```tsx
 * 	<Callout>This is a callout with useful information that does not trigger ARIA alerts</Callout>
 * ```
 */
export function Callout(props: AlertBaseProps) {
	return <InfoAlert role="note" aria-live="off" {...props} />;
}

/** Success alert for positive messages
 *
 * @example
 * ```tsx
 * 	<SuccessAlert>Operation completed successfully</SuccessAlert>
 * ```
 */
export function SuccessAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			defaultIcon={CheckCircle}
			{...props}
			class={cx('v-colors-success', props.class)}
		/>
	);
}

/** Warning alert for potential issues
 *
 * @example
 * ```tsx
 * 	<WarningAlert>Please review your input before proceeding</WarningAlert>
 * ```
 */
export function WarningAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			defaultIcon={AlertTriangle}
			{...props}
			class={cx('v-colors-warning', props.class)}
		/>
	);
}

/** Danger alert for errors or critical issues
 *
 * @example
 * ```tsx
 * 	<DangerAlert>An error occurred while processing your request</DangerAlert>
 * ```
 */
export function DangerAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			defaultIcon={AlertCircle}
			{...props}
			class={cx('v-colors-danger', props.class)}
		/>
	);
}
