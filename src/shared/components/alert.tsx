import cx from 'classix';
import { AlertCircle, AlertTriangle, CheckCircle, Info, type LucideProps } from 'lucide-solid';
import { type Component, type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

/** Base alert props shared by all alert variants */
type AlertBaseProps = JSX.HTMLAttributes<HTMLDivElement> & {
	/** Optional icon override */
	icon?: Component<LucideProps>;
};

/** Base alert component used by specific variants */
function AlertBase(props: AlertBaseProps & { defaultIcon: typeof Info }) {
	const [local, rest] = splitProps(props, ['icon', 'children', 'defaultIcon']);

	return (
		<div role="alert" aria-live="assertive" {...rest} class={cx('c-alert', props.class)}>
			<span class="c-alert__icon">
				<Dynamic component={local.icon ?? local.defaultIcon} aria-hidden="true" />
			</span>
			<div class="c-alert__content">{local.children}</div>
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
			class={cx(props.class, 'c-alert--success')}
		/>
	);
}

/** Warning alert for potential issues */
export function WarningAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			defaultIcon={AlertTriangle}
			{...props}
			class={cx(props.class, 'c-alert--warning')}
		/>
	);
}

/** Danger alert for errors or critical issues */
export function DangerAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			defaultIcon={AlertCircle}
			{...props}
			class={cx(props.class, 'c-alert--danger')}
		/>
	);
}
