import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';

import {
	FormatCurrency,
	FormatDate,
	FormatDateTime,
	FormatInteger,
	FormatList,
	FormatPercentage,
	FormatRelativeTime,
	FormatTime,
	T,
} from '~/shared/components/t-components';
import { LocaleContext } from '~/shared/utility/solid/locale-context';

describe('T components', () => {
	it('renders text', () => {
		render(() => <T>Test</T>);
		expect(screen.getByText('Test')).toBeInTheDocument();
	});

	it('renders nested components', () => {
		render(() => (
			<div data-testid="test-t-nested">
				<T>
					The cat is <b data-testid="test-bold">bold</b>
				</T>
			</div>
		));
		expect(screen.getByTestId('test-t-nested').textContent).toEqual('The cat is bold');
		expect(screen.getByTestId('test-bold').tagName).toEqual('B');
		expect(screen.getByTestId('test-bold').textContent).toEqual('bold');
	});

	it('renders formatting', () => {
		vi.spyOn(Date, 'now').mockReturnValue(new Date(2021, 0, 1, 12, 36).getTime()); // Jan 1, 2021
		render(() => (
			<div data-testid="test-t-formatting">
				<LocaleContext.Provider value="en-US">
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
				</LocaleContext.Provider>
			</div>
		));
		expect(screen.getByTestId('test-t-formatting').textContent).toEqual(
			"I'd buy that for $5.99. Today's date is Jan 1, 2021. The time is 12:34 PM. The date + time is Jan 1, 2021, 12:34 PM. That was 2 minutes ago. My favorite number is 1,234,567. I'd give you 7%. We could shake and make it happen. My partners are Alice, Bob, and Scott.",
		);
	});
});
