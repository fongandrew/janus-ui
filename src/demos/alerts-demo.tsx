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
import { Group } from '~/shared/components/group';
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
					<Group>
						<Button onClick={() => setShowInfo(toggle)}>Toggle info alert</Button>
						<Button onClick={() => setShowCallout(toggle)}>Toggle callout</Button>
						<Button onClick={() => setShowSuccess(toggle)}>Toggle success alert</Button>
						<Button onClick={() => setShowWarning(toggle)}>Toggle warning alert</Button>
						<Button onClick={() => setShowDanger(toggle)}>Toggle danger alert</Button>
					</Group>
				</Stack>
			</CardContent>
		</Card>
	);
}
