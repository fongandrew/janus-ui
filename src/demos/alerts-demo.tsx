import { createSignal } from 'solid-js';

import {
	Callout,
	DangerAlert,
	InfoAlert,
	SuccessAlert,
	WarningAlert,
} from '~/shared/components/alert';
import { Button } from '~/shared/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/card';
import { Stack } from '~/shared/components/stack';

const toggle = (value: boolean) => !value;

export function AlertsDemo() {
	const [showInfo, setShowInfo] = createSignal(false);
	const [showCallout, setShowCallout] = createSignal(false);
	const [showSuccess, setShowSuccess] = createSignal(false);
	const [showWarning, setShowWarning] = createSignal(false);
	const [showDanger, setShowDanger] = createSignal(false);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Alerts</CardTitle>
			</CardHeader>
			<CardContent>
				<Stack>
					{showInfo() && (
						<InfoAlert>This is an info alert with useful information</InfoAlert>
					)}
					{showCallout() && (
						<Callout>
							This is a callout with useful information that does not trigger ARIA
							alerts
						</Callout>
					)}
					{showSuccess() && <SuccessAlert>Operation completed successfully</SuccessAlert>}
					{showWarning() && (
						<WarningAlert>Please review your input before proceeding</WarningAlert>
					)}
					{showDanger() && (
						<DangerAlert>An error occurred while processing your request</DangerAlert>
					)}
					<div class="o-group">
						<Button onClick={() => setShowInfo(toggle)}>Toggle Info Alert</Button>
						<Button onClick={() => setShowCallout(toggle)}>Toggle Callout</Button>
						<Button onClick={() => setShowSuccess(toggle)}>Toggle Success Alert</Button>
						<Button onClick={() => setShowWarning(toggle)}>Toggle Warning Alert</Button>
						<Button onClick={() => setShowDanger(toggle)}>Toggle Danger Alert</Button>
					</div>
				</Stack>
			</CardContent>
		</Card>
	);
}
