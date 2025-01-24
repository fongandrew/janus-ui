import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Form } from '~/shared/components/form';
import {
	Input,
	InputDate,
	InputDateTime,
	InputMonth,
	InputTime,
	InputWeek,
} from '~/shared/components/input';
import { Label } from '~/shared/components/label';
import { LabelStack } from '~/shared/components/label-stack';
import { LabelledControl } from '~/shared/components/labelled-control';
import { Stack } from '~/shared/components/stack';

function InputStates() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Input States</CardTitle>
				<CardDescription>Text input fields in different states</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelStack>
						<Label>Default Input</Label>
						<Input placeholder="Placeholder content" />
					</LabelStack>
					<LabelStack>
						<Label>Error State Input</Label>
						<Input aria-invalid="true" placeholder="Some wrong value" />
					</LabelStack>
					<LabelStack>
						<Label>Disabled Input</Label>
						<Input disabled placeholder="Can't touch this" />
					</LabelStack>
				</Stack>
			</CardContent>
		</Card>
	);
}

function DateTimeInputs() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Date/Time Inputs</CardTitle>
				<CardDescription>Text input fields for selecting dates and times</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelledControl label="Date Input">
						<InputDate placeholder="Pick a date" value="2024-12-25" />
					</LabelledControl>
					<LabelledControl label="Time Input">
						<InputTime placeholder="Pick a time" value="13:15" />
					</LabelledControl>
					<LabelledControl label="Date Time Input">
						<InputDateTime placeholder="Pick a date" value="2024-12-25T13:15" />
					</LabelledControl>
					<LabelledControl label="Week Input">
						<InputWeek placeholder="Pick a week" value="2024-W52" />
					</LabelledControl>
					<LabelledControl label="Month Input">
						<InputMonth placeholder="Pick a month" value="2024-12" />
					</LabelledControl>
				</Stack>
			</CardContent>
		</Card>
	);
}

function TextInputVariations() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Text Inputs</CardTitle>
				<CardDescription>
					Text input fields with built-in validation or semnatic differences
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form names={{}} onSubmit={() => {}}>
					<Stack>
						<LabelledControl label="Email Input">
							<Input type="email" autocomplete="email" />
						</LabelledControl>
						<LabelledControl label="Number Input">
							<Input type="number" />
						</LabelledControl>
						<LabelledControl label="Password Input">
							<Input type="password" autocomplete="current-password" />
						</LabelledControl>
						<LabelledControl label="Search Input">
							<Input type="search" />
						</LabelledControl>
						<LabelledControl label="Telephone Input">
							<Input type="tel" />
						</LabelledControl>
						<LabelledControl label="URL Input">
							<Input type="url" />
						</LabelledControl>
					</Stack>
				</Form>
			</CardContent>
		</Card>
	);
}

function MiscInputVariations() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Miscellaneous Inputs</CardTitle>
				<CardDescription>Non-Textual Inputs</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelStack>
						<Label>Color Input</Label>
						<Input type="color" />
					</LabelStack>
					<LabelStack>
						<Label>File Input</Label>
						<Input type="file" />
					</LabelStack>

					<LabelStack>
						<Label>Range Input</Label>
						<Input type="range" />
					</LabelStack>
				</Stack>
			</CardContent>
		</Card>
	);
}

export function InputsDemo() {
	return (
		<>
			<InputStates />
			<DateTimeInputs />
			<TextInputVariations />
			<MiscInputVariations />
		</>
	);
}
