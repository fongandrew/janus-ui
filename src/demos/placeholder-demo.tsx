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
	ParagraphPlaceholder,
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
					<div class="o-group">
						<ImagePlaceholder aspectRatio={3 / 4} />
						<ImagePlaceholder aspectRatio={16 / 9} />
					</div>
					<ParagraphPlaceholder />
					<ImagePlaceholder height={150} width={300} />
				</div>
			</CardContent>
		</Card>
	);
}
