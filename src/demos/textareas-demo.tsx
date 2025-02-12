import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { LabelledInput } from '~/shared/components/labelled-control';
import { Textarea } from '~/shared/components/textarea';

function TextareasDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Text areas</CardTitle>
				<CardDescription>Larger input areas</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<LabelledInput label="Default">
						<Textarea placeholder="Default (medium) textarea" />
					</LabelledInput>
					<LabelledInput label="Error">
						<Textarea invalid placeholder="Error state textarea" />
					</LabelledInput>
					<LabelledInput label="Disabled">
						<Textarea disabled placeholder="Disabled textarea" />
					</LabelledInput>
				</div>
			</CardContent>
		</Card>
	);
}

export { TextareasDemo };
