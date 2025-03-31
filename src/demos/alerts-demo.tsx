import { createUniqueId } from 'solid-js';

import {
	Callout,
	DangerAlert,
	InfoAlert,
	SuccessAlert,
	WarningAlert,
} from '~/shared/components/alert';
import { Button } from '~/shared/components/button';
import { toggle } from '~/shared/components/callbacks/toggle';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/card';
import { ToggleBox } from '~/shared/components/toggle-box';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export function AlertsDemo() {
	const infoId = createUniqueId();
	const calloutId = createUniqueId();
	const successId = createUniqueId();
	const warningId = createUniqueId();
	const dangerId = createUniqueId();

	return (
		<Card id="alerts-demo">
			<CardHeader>
				<CardTitle>Alerts</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<ToggleBox id={infoId} data-testid="info-alert-container">
						<InfoAlert data-testid="info-alert">This is an info alert with useful information</InfoAlert>
					</ToggleBox>
					<ToggleBox id={calloutId} data-testid="callout-container">
						<Callout data-testid="callout">
							This is a callout with useful information that does not trigger ARIA
							alerts
						</Callout>
					</ToggleBox>
					<ToggleBox id={successId} data-testid="success-alert-container">
						<SuccessAlert data-testid="success-alert">Operation completed successfully</SuccessAlert>
					</ToggleBox>
					<ToggleBox id={warningId} data-testid="warning-alert-container">
						<WarningAlert data-testid="warning-alert">Please review your input before proceeding</WarningAlert>
					</ToggleBox>
					<ToggleBox id={dangerId} data-testid="danger-alert-container">
						<DangerAlert data-testid="danger-alert">An error occurred while processing your request</DangerAlert>
					</ToggleBox>
					<div class="o-group">
						<Button
							aria-controls={infoId}
							aria-expanded="false"
							data-testid="toggle-info-button"
							{...callbackAttrs(toggle)}
						>
							Toggle Info Alert
						</Button>
						<Button
							aria-controls={calloutId}
							aria-expanded="false"
							data-testid="toggle-callout-button"
							{...callbackAttrs(toggle)}
						>
							Toggle Callout
						</Button>
						<Button
							aria-controls={successId}
							aria-expanded="false"
							data-testid="toggle-success-button"
							{...callbackAttrs(toggle)}
						>
							Toggle Success Alert
						</Button>
						<Button
							aria-controls={warningId}
							aria-expanded="false"
							data-testid="toggle-warning-button"
							{...callbackAttrs(toggle)}
						>
							Toggle Warning Alert
						</Button>
						<Button
							aria-controls={dangerId}
							aria-expanded="false"
							data-testid="toggle-danger-button"
							{...callbackAttrs(toggle)}
						>
							Toggle Danger Alert
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
