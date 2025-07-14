import { Button } from '~/lib/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { LabelledActionCard } from '~/lib/components/labelled-action';
import { ToggleSwitch } from '~/lib/components/toggle-switch';

export function LabelledActionsDemo() {
	return (
		<Card id="labelled-actions-demo">
			<CardHeader>
				<CardTitle>Labelled actions</CardTitle>
				<CardDescription>Text with a button or toggle</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<LabelledActionCard
						label="Do the thing"
						description="Doing the thing has consequences"
					>
						<Button class="v-colors-danger">The Thing</Button>
					</LabelledActionCard>
					<LabelledActionCard
						label="Do the other thing"
						description="Doing the other thing has consequences"
						errorMessage="Oops, doing this thing has been disabled"
					>
						<Button class="v-colors-danger" disabled>
							Other Thing
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
