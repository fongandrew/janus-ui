import { createUniqueId } from 'solid-js';

import { toggle } from '~/shared/callback-attrs/toggle';
import {
	Callout,
	DangerAlert,
	InfoAlert,
	SuccessAlert,
	WarningAlert,
} from '~/shared/components/alert';
import { Button } from '~/shared/components/button';
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
		<Card>
			<CardHeader>
				<CardTitle>Alerts</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<ToggleBox id={infoId}>
						<InfoAlert>This is an info alert with useful information</InfoAlert>
					</ToggleBox>
					<ToggleBox id={calloutId}>
						<Callout>
							This is a callout with useful information that does not trigger ARIA
							alerts
						</Callout>
					</ToggleBox>
					<ToggleBox id={successId}>
						<SuccessAlert>Operation completed successfully</SuccessAlert>
					</ToggleBox>
					<ToggleBox id={warningId}>
						<WarningAlert>Please review your input before proceeding</WarningAlert>
					</ToggleBox>
					<ToggleBox id={dangerId}>
						<DangerAlert>An error occurred while processing your request</DangerAlert>
					</ToggleBox>
					<div class="o-group">
						<Button
							aria-controls={infoId}
							aria-expanded="false"
							{...callbackAttrs(toggle)}
						>
							Toggle Info Alert
						</Button>
						<Button
							aria-controls={calloutId}
							aria-expanded="false"
							{...callbackAttrs(toggle)}
						>
							Toggle Callout
						</Button>
						<Button
							aria-controls={successId}
							aria-expanded="false"
							{...callbackAttrs(toggle)}
						>
							Toggle Success Alert
						</Button>
						<Button
							aria-controls={warningId}
							aria-expanded="false"
							{...callbackAttrs(toggle)}
						>
							Toggle Warning Alert
						</Button>
						<Button
							aria-controls={dangerId}
							aria-expanded="false"
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
