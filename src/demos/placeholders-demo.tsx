import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import {
	ChatPlaceholder,
	ImgPlaceholder,
	InlineMissingPlaceholder,
	ParagraphPlaceholder,
} from '~/shared/components/placeholder';

export function PlaceholdersDemo() {
	return (
		<Card id="placeholders-demo">
			<CardHeader>
				<CardTitle>Placeholders</CardTitle>
				<CardDescription>Loading state placeholders for content</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<ChatPlaceholder />
					<div class="o-group">
						<ImgPlaceholder aspectRatio={3 / 4} />
						<ImgPlaceholder aspectRatio={16 / 9} />
					</div>
					<InlineMissingPlaceholder />
					<ParagraphPlaceholder />
					<ImgPlaceholder height={150} width={300} />
				</div>
			</CardContent>
		</Card>
	);
}
