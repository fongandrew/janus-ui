import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';

export function EmptyStateDemo() {
	return (
		<Card id="empty-state-demo">
			<CardHeader>
				<CardTitle>Empty State Demo</CardTitle>
				<CardDescription>Plain box used to indicate content missing</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<div class="o-empty-state">
						<p>There’s nothing here yet.</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
