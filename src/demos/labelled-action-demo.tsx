import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { LabelledActionCard } from '~/shared/components/labelled-action';
import { Stack } from '~/shared/components/stack';
import { ToggleSwitch } from '~/shared/components/toggle-switch';

export function LabelledActionDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Input states</CardTitle>
				<CardDescription>Text input fields in different states</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelledActionCard
						label="Do the thing"
						description="Doing the thing has consequences"
					>
						<Button class="c-button--danger">Do the thing</Button>
					</LabelledActionCard>
					<LabelledActionCard
						label="Do the thing"
						description="Doing the thing has consequences"
						errorMessage="Oops, doing the thing has been disabled"
					>
						<Button class="c-button--danger" disabled>
							Do the thing
						</Button>
					</LabelledActionCard>
					<LabelledActionCard
						label="Turn on the thing"
						description="Did you know you can turn on the thing?"
					>
						<ToggleSwitch />
					</LabelledActionCard>
				</Stack>
			</CardContent>
		</Card>
	);
}
