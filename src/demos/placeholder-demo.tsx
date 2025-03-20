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
						<ImgPlaceholder aspectRatio={3 / 4} />
						<ImgPlaceholder aspectRatio={16 / 9} />
					</div>
					<ParagraphPlaceholder />
					<ImgPlaceholder height={150} width={300} />
				</div>
			</CardContent>
		</Card>
	);
}
