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
		<Card>
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
						<span class="o-badge">Badge</span>
						<span class="o-badge v-colors-primary">Primary</span>
						<span class="o-badge v-colors-danger">Danger</span>
						<span class="o-badge v-colors-warning">Warning</span>
						<span class="o-badge v-colors-success">Success</span>
					</div>
					<div class="o-group">
						<span>Counts</span>
						<Count value={1} label={countLabel} />
						<Count value={10} label={countLabel} />
						<Count value={12} label={countLabel} digits={2} />
						<Count value={100} label={countLabel} digits={2} />
						<Count value={125} label={countLabel} digits={3} />
						<Count value={1000} label={countLabel} digits={3} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
