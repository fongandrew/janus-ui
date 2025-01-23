import cx from 'classix';
import { AlertCircle, AlertTriangle, CheckCircle, Info, type LucideProps } from 'lucide-solid';
import { type Component, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { Box, type BoxProps } from '~/shared/components/box';

/** Base alert props shared by all alert variants */
type AlertBaseProps = BoxProps & {
	/** Optional icon override */
	icon?: Component<LucideProps>;
};

/** Base alert component used by specific variants */
function AlertBase(props: AlertBaseProps & { defaultIcon: typeof Info }) {
	const [local, rest] = splitProps(props, ['icon', 'children']);

	return (
		<Box {...rest} class={cx('c-alert', props.class)}>
			<span class="c-alert__icon">
				<Dynamic component={local.icon ?? props.defaultIcon} aria-hidden="true" />
			</span>
			<div class="c-alert__content">{local.children}</div>
		</Box>
	);
}

/** Info alert for general information */
export function InfoAlert(props: AlertBaseProps) {
	return <AlertBase {...props} defaultIcon={Info} />;
}

/** Success alert for positive messages */
export function SuccessAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			{...props}
			class={cx(props.class, 'c-alert--success')}
			defaultIcon={CheckCircle}
		/>
	);
}

/** Warning alert for potential issues */
export function WarningAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			{...props}
			class={cx(props.class, 'c-alert--warning')}
			defaultIcon={AlertTriangle}
		/>
	);
}

/** Danger alert for errors or critical issues */
export function DangerAlert(props: AlertBaseProps) {
	return (
		<AlertBase
			{...props}
			class={cx(props.class, 'c-alert--danger')}
			defaultIcon={AlertCircle}
		/>
	);
}
