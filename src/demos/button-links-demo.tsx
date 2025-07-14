import { ButtonLink, GhostButtonLink } from '~/lib/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';

export function ButtonLinksDemo() {
	return (
		<Card id="button-links-demo">
			<CardHeader>
				<CardTitle>Button Links</CardTitle>
				<CardDescription>Links styled as buttons</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-group">
					<ButtonLink href="#">Default</ButtonLink>
					<ButtonLink class="v-colors-primary" href="#">
						Primary
					</ButtonLink>
					<GhostButtonLink href="#">Ghost</GhostButtonLink>
					<ButtonLink href="#">
						Some very long text to see how it wraps and breaks and here is an
						unbreakable string:
						abcderfghijklmnopqrstuvwxyz01234567890abcderfghijklmnopqrstuvwxyz01234567890
					</ButtonLink>
				</div>
			</CardContent>
		</Card>
	);
}
