import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { LabelledInput } from '~/shared/components/labelled-control';
import { Stack } from '~/shared/components/stack';
import { Textarea } from '~/shared/components/textarea';

function TextareasDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Text areas</CardTitle>
				<CardDescription>Larger input areas</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack>
					<LabelledInput label="Default">
						<Textarea placeholder="Default (medium) textarea" />
					</LabelledInput>
					<LabelledInput label="Error">
						<Textarea aria-invalid placeholder="Error state textarea" />
					</LabelledInput>
					<LabelledInput label="Disabled">
						<Textarea disabled placeholder="Disabled textarea" />
					</LabelledInput>
				</Stack>
			</CardContent>
		</Card>
	);
}

export { TextareasDemo };
