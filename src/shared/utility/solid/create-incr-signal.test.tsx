import { render } from '@solidjs/testing-library';
import { isServer } from 'solid-js/web';
import { describe, expect, it } from 'vitest';

import { createIncrSignal } from '~/shared/utility/solid/create-incr-signal';

// Component to test basic functionality with default value
const DefaultValueComponent = () => {
	const [value, incr] = createIncrSignal();
	return (
		<div>
			<div data-testid="value">{value()}</div>
			<button data-testid="increment" onClick={incr}>
				Increment
			</button>
		</div>
	);
};

// Component to test custom initial value
const CustomValueComponent = () => {
	const [value, incr] = createIncrSignal(10);
	return (
		<div>
			<div data-testid="value">{value()}</div>
			<button data-testid="increment" onClick={incr}>
				Increment
			</button>
		</div>
	);
};

describe('createIncrSignal', () => {
	it('should initialize with default value of 0 and increment on click', () => {
		const { container } = render(() => <DefaultValueComponent />);
		const valueElement = container.querySelector('[data-testid="value"]');
		expect(valueElement?.textContent).toBe('0');

		if (isServer) return;
		const incrementButton = container.querySelector<HTMLButtonElement>(
			'[data-testid="increment"]',
		);
		incrementButton?.click();
		expect(valueElement?.textContent).toBe('1');
	});

	it('should initialize with a custom value', () => {
		const { container } = render(() => <CustomValueComponent />);
		const valueElement = container.querySelector('[data-testid="value"]');
		expect(valueElement?.textContent).toBe('10');

		if (isServer) return;
		const incrementButton = container.querySelector<HTMLButtonElement>(
			'[data-testid="increment"]',
		);
		incrementButton?.click();
		expect(valueElement?.textContent).toBe('11');
	});
});
