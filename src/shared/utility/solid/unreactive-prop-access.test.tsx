import { render } from '@solidjs/testing-library';
import { createSignal, type JSX } from 'solid-js';
import { isServer } from 'solid-js/web';
import { describe, expect, it, vi } from 'vitest';

import { unreactivePropAccess } from '~/shared/utility/solid/unreactive-prop-access';
import { LoggerContext } from '~/shared/utility/solid/use-logger';

interface TestComponentProps {
	name: string;
	age: number;
	role?: string;
}

const TestComponent = (props: TestComponentProps): JSX.Element => {
	const [name, age, role] = unreactivePropAccess(props, ['name', 'age', 'role']);

	return (
		<div>
			<span data-testid="name">{name}</span>
			<span data-testid="age">{age}</span>
			<span data-testid="role">{role}</span>
		</div>
	);
};

describe('unreactivePropAccess', () => {
	it('should correctly access the initial props', () => {
		const { container } = render(() => (
			<TestComponent name="Alice" age={30} role="Developer" />
		));

		expect(container.querySelector('[data-testid="name"]')?.textContent).toBe('Alice');
		expect(container.querySelector('[data-testid="age"]')?.textContent).toBe('30');
		expect(container.querySelector('[data-testid="role"]')?.textContent).toBe('Developer');
	});

	it('should warn when props change', () => {
		if (isServer) return;

		const mockWarn = vi.fn();
		const testLogger = { warn: mockWarn, info: vi.fn(), error: vi.fn() };

		const [name, setName] = createSignal('Bob');
		const [age, setAge] = createSignal(25);

		render(() => (
			<LoggerContext.Provider value={testLogger as any}>
				<TestComponent name={name()} age={age()} />
			</LoggerContext.Provider>
		));

		// Change the props
		setName('Charlie');
		setAge(28);

		expect(mockWarn).toHaveBeenCalledTimes(2);
		expect(mockWarn).toHaveBeenCalledWith('Prop name changed from Bob to Charlie');
		expect(mockWarn).toHaveBeenCalledWith('Prop age changed from 25 to 28');
	});
});
