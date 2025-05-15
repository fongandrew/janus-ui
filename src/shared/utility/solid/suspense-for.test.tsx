import { render } from '@solidjs/testing-library';
import { type Component, createResource, type JSX, Suspense } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';

import { createDeferred } from '~/shared/utility/deferred';
import { SuspenseFor } from '~/shared/utility/solid/suspense-for';

describe('SuspenseFor', () => {
	it('should render items progressively', async () => {
		const items = ['Item 1', 'Item 2', 'Item 3'];
		const renderedItems: string[] = [];
		const deferreds = items.map(() => createDeferred<void>());

		const { container } = render(() => (
			<SuspenseFor each={items}>
				{(item, index) => {
					// Track that this item was rendered
					renderedItems.push(item);

					// Create a resource that resolves when we decide
					const [data] = createResource(async () => {
						await deferreds[index()];
						return item;
					});

					return <div data-testid={`item-${item}`}>{data()}</div>;
				}}
			</SuspenseFor>
		));

		// Initially, only the first item should be in the rendering queue
		expect(renderedItems).toEqual(['Item 1']);
		expect(container.querySelectorAll('[data-testid]').length).toBe(0); // Still suspended

		// Resolve the first item
		deferreds[0]?.resolve();
		await vi.waitFor(() => {
			expect(container.querySelector('[data-testid="item-Item 1"]')).not.toBeNull();
		});

		// After first item resolves, second item should be in queue
		expect(renderedItems).toEqual(['Item 1', 'Item 2']);
		expect(container.querySelectorAll('[data-testid]').length).toBe(1); // Only first item visible

		// Resolve the second item
		deferreds[1]?.resolve();
		await vi.waitFor(() => {
			expect(container.querySelector('[data-testid="item-Item 2"]')).not.toBeNull();
		});

		// After second item resolves, third item should be in queue
		expect(renderedItems).toEqual(['Item 1', 'Item 2', 'Item 3']);
		expect(container.querySelectorAll('[data-testid]').length).toBe(2); // First and second visible

		// Resolve the third item
		deferreds[2]?.resolve();
		await vi.waitFor(() => {
			expect(container.querySelector('[data-testid="item-Item 3"]')).not.toBeNull();
		});

		// All items should now be visible
		expect(container.querySelectorAll('[data-testid]').length).toBe(3);
	});

	it('should respect delay parameter', async () => {
		vi.useFakeTimers();
		const items = ['A', 'B', 'C'];
		const renderCalls: string[] = [];

		// Create a component with a 100ms delay
		render(() => (
			<SuspenseFor each={items} delay={100}>
				{(item) => {
					renderCalls.push(item);
					return <div data-testid={`item-${item}`}>{item}</div>;
				}}
			</SuspenseFor>
		));

		// Initially only first item should be rendered
		expect(renderCalls).toEqual(['A']);

		// Advance timers by 99ms - not enough to trigger second item
		await vi.advanceTimersByTimeAsync(99);
		expect(renderCalls).toEqual(['A']);

		// Advance by 1 more millisecond - should trigger second item
		await vi.advanceTimersByTimeAsync(1);
		expect(renderCalls).toEqual(['A', 'B']);

		// Advance by 100ms more - should trigger third item
		await vi.advanceTimersByTimeAsync(100);
		expect(renderCalls).toEqual(['A', 'B', 'C']);

		vi.useRealTimers();
	});

	it('should work with custom suspense components', async () => {
		const deferred = createDeferred<void>();
		const items = ['Item'];

		const CustomSuspenseComponent: Component<{
			fallback?: JSX.Element;
			children: JSX.Element;
		}> = (props) => {
			return <Suspense fallback={<div>Custom Fallback</div>}>{props.children}</Suspense>;
		};

		const { container } = render(() => (
			<SuspenseFor each={items} suspenseComponent={CustomSuspenseComponent}>
				{(item) => {
					const [data] = createResource(async () => {
						await deferred;
						return item;
					});
					return <div>{data()}</div>;
				}}
			</SuspenseFor>
		));

		await vi.waitFor(() => {
			expect(container.textContent).toContain('Custom Fallback');
		});

		deferred.resolve();
		await vi.waitFor(() => {
			expect(container.textContent).toContain('Item');
		});
		expect(container.textContent).not.toContain('Custom Fallback');
	});

	it('should handle fallback correctly', async () => {
		const deferred = createDeferred<void>();
		const items = ['Test Item'];

		const { container } = render(() => (
			<SuspenseFor each={items} fallback={<div data-testid="fallback">Loading...</div>}>
				{(item) => {
					const [data] = createResource(async () => {
						await deferred;
						return item;
					});
					return <div data-testid="item">{data()}</div>;
				}}
			</SuspenseFor>
		));

		expect(container.querySelector('[data-testid="fallback"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="fallback"]')?.textContent).toBe('Loading...');

		deferred.resolve();
		await vi.waitFor(() => {
			expect(container.querySelector('[data-testid="item"]')).not.toBeNull();
		});
		expect(container.querySelector('[data-testid="fallback"]')).toBeNull();
		expect(container.querySelector('[data-testid="item"]')?.textContent).toBe('Test Item');
	});

	it('should support function fallbacks that receive the item', async () => {
		const deferred = createDeferred<void>();
		const items = ['Special Item'];

		const { container } = render(() => (
			<SuspenseFor
				each={items}
				fallback={(item) => <div data-testid="function-fallback">Loading {item}...</div>}
			>
				{(item) => {
					const [data] = createResource(async () => {
						await deferred;
						return item;
					});
					return <div data-testid="item">{data()}</div>;
				}}
			</SuspenseFor>
		));

		expect(container.querySelector('[data-testid="function-fallback"]')?.textContent).toBe(
			'Loading Special Item...',
		);
		deferred.resolve();
		await vi.waitFor(() => {
			expect(container.querySelector('[data-testid="item"]')).not.toBeNull();
		});
	});
});
