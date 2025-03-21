import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { LabelledActionCard } from '~/shared/components/labelled-action';
import { ToggleSwitch } from '~/shared/components/toggle-switch';

export function LabelledActionDemo() {
	return (
		<Card id="labelled-action-demo">
			<CardHeader>
				<CardTitle>Input states</CardTitle>
				<CardDescription>Text input fields in different states</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<LabelledActionCard
						label="Do the thing"
						description="Doing the thing has consequences"
					>
						<Button class="v-colors-danger">Do the Thing</Button>
					</LabelledActionCard>
					<LabelledActionCard
						label="Do the thing"
						description="Doing the thing has consequences"
						errorMessage="Oops, doing the thing has been disabled"
					>
						<Button class="v-colors-danger" disabled>
							Do the Thing
						</Button>
					</LabelledActionCard>
					<LabelledActionCard
						label="Turn on the thing"
						description="Did you know you can turn on the thing?"
					>
						<ToggleSwitch />
					</LabelledActionCard>
				</div>
			</CardContent>
		</Card>
	);
}
