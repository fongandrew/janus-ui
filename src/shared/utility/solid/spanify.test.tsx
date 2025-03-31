import { children, type JSX } from 'solid-js';

import { spanify } from '~/shared/utility/solid/spanify';
import { renderContainer } from '~/shared/utility/test-utils/render';

// Simple test component that uses spanify
function TestComponent(props: { children: JSX.Element }) {
	const resolved = children(() => props.children);
	return <div data-testid="test-container">{spanify(resolved.toArray())}</div>;
}

describe('spanify', () => {
	it('wraps text nodes in spans', async () => {
		const container = await renderContainer(() => <TestComponent>Hello World</TestComponent>);

		const testContainer = container.querySelector('[data-testid="test-container"]');
		const span = testContainer?.querySelector('span');
		expect(span?.textContent).toBe('Hello World');
	});

	it('does not wrap JSX elements', async () => {
		const container = await renderContainer(() => (
			<TestComponent>
				<div data-testid="inner-div">I am already an element</div>
			</TestComponent>
		));

		const testContainer = container.querySelector('[data-testid="test-container"]');
		const innerDiv = testContainer?.querySelector('[data-testid="inner-div"]');
		expect(innerDiv?.textContent).toBe('I am already an element');

		// There should be no spans created
		const spans = testContainer?.querySelectorAll('span');
		expect(spans?.length).toBe(0);
	});

	it('handles mixed content correctly', async () => {
		const container = await renderContainer(() => (
			<TestComponent>
				Text before
				<div data-testid="inner-div">Element content</div>
				Text after
			</TestComponent>
		));

		const testContainer = container.querySelector('[data-testid="test-container"]');
		expect(testContainer?.textContent).toBe('Text beforeElement contentText after');

		// Should be 2 spans (one for each text node) and 1 div
		const spans = testContainer?.querySelectorAll('span');
		expect(spans?.length).toBe(2);
		expect(spans?.[0]?.textContent).toBe('Text before');
		expect(spans?.[1]?.textContent).toBe('Text after');

		// Preserve middle div
		const innerDiv = testContainer?.querySelector('[data-testid="inner-div"]');
		expect(innerDiv?.textContent).toBe('Element content');
	});
});
