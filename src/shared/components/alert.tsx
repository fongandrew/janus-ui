import cx from 'classix';
import { AlertCircle, AlertTriangle, CheckCircle, Info, type LucideProps } from 'lucide-solid';
import { children, type Component, type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { emptyAttr } from '~/shared/utility/empty-attr';

/** Base alert props shared by all alert variants */
export type AlertBaseProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'id'> & {
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

/** Info alert for general information */
export function InfoAlert(props: AlertBaseProps) {
	return <AlertBase defaultIcon={Info} aria-live="polite" {...props} />;
}

/** Callout if an info alert that isn't treated that way for ARIA purposes */
export function Callout(props: AlertBaseProps) {
	return <InfoAlert role="note" aria-live="off" {...props} />;
}

/** Success alert for positive messages */
export function SuccessAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			defaultIcon={CheckCircle}
			{...props}
			class={cx('v-colors-success', props.class)}
		/>
	);
}

/** Warning alert for potential issues */
export function WarningAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			defaultIcon={AlertTriangle}
			{...props}
			class={cx('v-colors-warning', props.class)}
		/>
	);
}

/** Danger alert for errors or critical issues */
export function DangerAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			defaultIcon={AlertCircle}
			{...props}
			class={cx('v-colors-danger', props.class)}
		/>
	);
}
