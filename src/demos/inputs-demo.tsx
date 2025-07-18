import { createSignal, createUniqueId } from 'solid-js';
import { isServer } from 'solid-js/web';

import { inputUpdateText } from '~/demos/callbacks/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { ColorPicker } from '~/lib/components/color-picker';
import {
	DatePicker,
	DateTimePicker,
	MonthPicker,
	TimePicker,
	WeekPicker,
} from '~/lib/components/date-time-picker';
import { Form } from '~/lib/components/form';
import { Input } from '~/lib/components/input';
import { LabelledInput, LabelledInputGroup } from '~/lib/components/labelled-control';
import { Password } from '~/lib/components/password';
import { Slider } from '~/lib/components/slider';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

function InputStates() {
	return (
		<Card id="inputs-demo">
			<CardHeader>
				<CardTitle>Input states</CardTitle>
				<CardDescription>Text input fields in different states</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<LabelledInput label="Default input">
						<Input placeholder="Placeholder content" />
					</LabelledInput>
					<LabelledInput label="Error state input">
						<Input invalid placeholder="Some wrong value" />
					</LabelledInput>
					<LabelledInput label="Disabled input">
						<Input disabled placeholder="Can't touch this" />
					</LabelledInput>
				</div>
			</CardContent>
		</Card>
	);
}

function DateTimeInputs() {
	return (
		<Card id="date-time-inputs-demo">
			<CardHeader>
				<CardTitle>Date / time inputs</CardTitle>
				<CardDescription>Text input fields for selecting dates and times</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<LabelledInput label="Date input">
						<DatePicker placeholder="Pick a date" value="2024-12-25" />
					</LabelledInput>
					<LabelledInput label="Time input">
						<TimePicker placeholder="Pick a time" value="13:15" />
					</LabelledInput>
					<LabelledInput label="Date time input">
						<DateTimePicker placeholder="Pick a date" value="2024-12-25T13:15" />
					</LabelledInput>
					<LabelledInput label="Week input">
						<WeekPicker placeholder="Pick a week" value="2024-W52" />
					</LabelledInput>
					<LabelledInput label="Month input">
						<MonthPicker placeholder="Pick a month" value="2024-12" />
					</LabelledInput>
				</div>
			</CardContent>
		</Card>
	);
}

function TextInputVariations() {
	return (
		<Card id="text-input-variations-demo">
			<CardHeader>
				<CardTitle>Text Inputs</CardTitle>
				<CardDescription>
					Text input fields with built-in validation or semantic differences
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form names={{}} onSubmit={() => {}}>
					<LabelledInput label="Email input">
						<Input type="email" autocomplete="email" />
					</LabelledInput>
					<LabelledInput label="Number input">
						<Input type="number" />
					</LabelledInput>
					<LabelledInput label="Password input">
						<Password autocomplete="current-password" />
					</LabelledInput>
					<LabelledInput label="Search input">
						<Input type="search" />
					</LabelledInput>
					<LabelledInput label="Telephone input">
						<Input type="tel" />
					</LabelledInput>
					<LabelledInput label="URL input">
						<Input type="url" />
					</LabelledInput>
				</Form>
			</CardContent>
		</Card>
	);
}

function MiscInputVariations() {
	const sliderDescriptionId = createUniqueId();
	const [sliderValue, setSliderValue] = createSignal<number | null>(null);

	return (
		<Card id="misc-input-variations-demo">
			<CardHeader>
				<CardTitle>Miscellaneous inputs</CardTitle>
				<CardDescription>Non-textual inputs</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<LabelledInput label="Color input">
						<ColorPicker />
					</LabelledInput>
					<LabelledInput label="Color input (disabled)">
						<ColorPicker disabled />
					</LabelledInput>

					<LabelledInput label="File input">
						<Input type="file" />
					</LabelledInput>
					<LabelledInput label="File input (disabled)">
						<Input type="file" disabled />
					</LabelledInput>

					<LabelledInput
						label="Range / slider input"
						description={sliderValue() !== null ? `Value: ${sliderValue()}` : undefined}
						descriptionId={sliderDescriptionId}
					>
						<Slider
							unit="%"
							onValue={setSliderValue}
							{...callbackAttrs(isServer && inputUpdateText(sliderDescriptionId))}
						/>
					</LabelledInput>
					<LabelledInput label="Range / slider input (disabled)">
						<Slider unit="%" disabled />
					</LabelledInput>
				</div>
			</CardContent>
		</Card>
	);
}

function InputGroups() {
	return (
		<Card id="input-groups-demo">
			<CardHeader>
				<CardTitle>Input groups</CardTitle>
				<CardDescription>Groups of related inputs with a single label</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<LabelledInputGroup
						label="Time range"
						description="Specify start and end times"
					>
						<div class="o-group" style={{ 'align-items': 'center' }}>
							<TimePicker
								id="start-time"
								placeholder="Start time"
								value="09:00"
								style={{ flex: '1 1 40%' }}
							/>
							<span>to</span>
							<TimePicker
								id="end-time"
								placeholder="End time"
								value="17:00"
								style={{ flex: '1 1 40%' }}
							/>
						</div>
					</LabelledInputGroup>
				</div>
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
			<InputGroups />
		</>
	);
}
