import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import {
	ChatPlaceholder,
	DelayedPlaceholder,
	ImgPlaceholder,
	InlineDelayedPlaceholder,
	InlineMissingPlaceholder,
	MissingPlaceholder,
	ParagraphPlaceholder,
} from '~/lib/components/placeholder';

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
					<div class="o-group">
						<div>
							<InlineMissingPlaceholder />
						</div>
						<InlineDelayedPlaceholder delay={5000}>
							<InlineMissingPlaceholder />
						</InlineDelayedPlaceholder>
					</div>
					<DelayedPlaceholder>
						<MissingPlaceholder />
					</DelayedPlaceholder>
					<ParagraphPlaceholder />
					<ImgPlaceholder height={150} width={300} />
				</div>
			</CardContent>
		</Card>
	);
}
