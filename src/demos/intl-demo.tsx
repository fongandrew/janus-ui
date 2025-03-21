import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import {
	FormatCurrency,
	FormatDate,
	FormatDateTime,
	FormatInteger,
	FormatList,
	FormatPercentage,
	FormatRelativeTime,
	FormatTime,
} from '~/shared/components/t-components';

export function IntlDemo() {
	return (
		<Card id="intl-demo">
			<CardHeader>
				<CardTitle>Text Formatting</CardTitle>
				<CardDescription>
					Some wrappers around the <code>Intl</code> API
				</CardDescription>
			</CardHeader>
			<CardContent class="o-text-stack">
				<p>
					I'd buy that for <FormatCurrency value={5.99} currency="USD" />.
				</p>{' '}
				<p>
					Today's date is <FormatDate value={new Date(2021, 0, 1)} />.
				</p>{' '}
				<p>
					The time is <FormatTime value={new Date(2021, 0, 1, 12, 34)} />.
				</p>{' '}
				<p>
					The date + time is <FormatDateTime value={new Date(2021, 0, 1, 12, 34)} />.
				</p>{' '}
				<p>
					That was <FormatRelativeTime value={new Date(2021, 0, 1, 12, 34)} />.
				</p>{' '}
				<p>
					My favorite number is <FormatInteger value={1234567} />.
				</p>{' '}
				<p>
					I'd give you <FormatPercentage value={0.07} />. We could shake and make it
					happen.
				</p>{' '}
				<p>
					My partners are <FormatList parts={['Alice', 'Bob', 'Scott']} />.
				</p>
			</CardContent>
		</Card>
	);
}
