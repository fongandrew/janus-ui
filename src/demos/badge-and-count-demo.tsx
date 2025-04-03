import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Count } from '~/shared/components/count';

export function BadgeAndCountDemo() {
	const countLabel = (n: string | number) => `${n} item${n === 1 ? '' : 's'}`;

	return (
		<Card id="badge-and-count-demo">
			<CardHeader>
				<CardTitle>Badge & Count Demo</CardTitle>
				<CardDescription>
					Badge is just generic object shape. Count is specifically for numbers and has
					truncation and other styling.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<div class="o-group">
						<span class="o-badge" data-testid="generic-badge">
							Badge
						</span>
						<span class="o-badge v-colors-primary" data-testid="primary-badge">
							Primary
						</span>
						<span class="o-badge v-colors-danger" data-testid="danger-badge">
							Danger
						</span>
						<span class="o-badge v-colors-warning" data-testid="warning-badge">
							Warning
						</span>
						<span class="o-badge v-colors-success" data-testid="success-badge">
							Success
						</span>
					</div>
					<div class="o-group">
						<span>Counts</span>
						<Count value={1} label={countLabel} data-testid="count-1" />
						<Count value={10} label={countLabel} data-testid="count-10" />
						<Count
							value={12}
							label={countLabel}
							digits={2}
							data-testid="count-12-2digits"
						/>
						<Count
							value={100}
							label={countLabel}
							digits={2}
							data-testid="count-100-2digits"
						/>
						<Count
							value={125}
							label={countLabel}
							digits={3}
							data-testid="count-125-3digits"
						/>
						<Count
							value={1000}
							label={countLabel}
							digits={3}
							data-testid="count-1000-3digits"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
