import { DangerAlert, InfoAlert, SuccessAlert, WarningAlert } from '~/shared/components/alert';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/card';
import { Stack } from '~/shared/components/stack';

export function AlertsDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Alerts</CardTitle>
			</CardHeader>
			<CardContent>
				<Stack>
					<InfoAlert>This is an info alert with useful information</InfoAlert>
					<SuccessAlert>Operation completed successfully</SuccessAlert>
					<WarningAlert>Please review your input before proceeding</WarningAlert>
					<DangerAlert>An error occurred while processing your request</DangerAlert>
				</Stack>
			</CardContent>
		</Card>
	);
}
