import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import {
	ChatPlaceholder,
	ImagePlaceholder,
	InlinePlaceholder,
	Placeholder,
} from '~/shared/components/placeholder';

export function PlaceholderDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Placeholders</CardTitle>
				<CardDescription>Loading state placeholders for content</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-text-stack">
					<ChatPlaceholder />
					<ImagePlaceholder aspectRatio={16 / 9} />

					<p>
						Here is some text with a <InlinePlaceholder /> inside of it. You can use
						this for loading <InlinePlaceholder /> or other inline elements.
					</p>

					<ImagePlaceholder height={150} width={300} />
					<ParagraphPlaceholder />
				</div>
			</CardContent>
		</Card>
	);
}
