import { render } from '@solidjs/testing-library';
import { type JSX } from 'solid-js';
import { describe, expect, it } from 'vitest';

import { createIncrSignal } from '~/lib/utility/solid/create-incr-signal';
import {
	createPropModContext,
	mergePropMods,
	type PropModGeneric,
	useSingleProp,
} from '~/lib/utility/solid/prop-mod-context';

describe('createPropModContext', () => {
	it('should create a context with Provider and Reset components', () => {
		const TestContext = createPropModContext<JSX.HTMLAttributes<HTMLDivElement>>();

		expect(TestContext).toHaveProperty('Provider');
		expect(TestContext).toHaveProperty('Reset');
	});

	it('should apply prop mods from Provider to nested components', () => {
		const TestContext = createPropModContext<JSX.HTMLAttributes<HTMLDivElement>>();

		function TestComponent(props: JSX.HTMLAttributes<HTMLDivElement>) {
			const mergedProps = mergePropMods(TestContext, props);
			return <div data-testid="test-element" {...mergedProps} />;
		}

		const propMods: PropModGeneric<JSX.HTMLAttributes<HTMLDivElement>> = {
			class: (prev) => `${prev || ''} mod-class`,
			id: () => 'mod-id',
		};

		const { getByTestId } = render(() => (
			<TestContext.Provider {...propMods}>
				<TestComponent class="original-class" data-other="foo" />
			</TestContext.Provider>
		));

		const element = getByTestId('test-element');
		expect(element).toHaveClass('original-class');
		expect(element).toHaveClass('mod-class');
		expect(element).toHaveAttribute('id', 'mod-id');
		expect(element).toHaveAttribute('data-other', 'foo');
	});

	it('should handle undefined props correctly', () => {
		const TestContext = createPropModContext<JSX.HTMLAttributes<HTMLDivElement>>();

		function TestComponent(props: JSX.HTMLAttributes<HTMLDivElement>) {
			const mergedProps = mergePropMods(TestContext, props);
			return <div data-testid="test-element" {...mergedProps} />;
		}

		const propMods: PropModGeneric<JSX.HTMLAttributes<HTMLDivElement>> = {
			class: () => 'mod-class',
			id: (prev) => (prev === undefined ? 'new-id' : prev),
		};

		const { getByTestId } = render(() => (
			<TestContext.Provider {...propMods}>
				<TestComponent />
			</TestContext.Provider>
		));

		const element = getByTestId('test-element');
		expect(element).toHaveClass('mod-class');
		expect(element).toHaveAttribute('id', 'new-id');
	});

	it('updates mod values reactively', () => {
		const [count, incr] = createIncrSignal();

		const TestContext = createPropModContext<{ 'data-count'?: number | undefined }>();

		function TestComponent(props: { 'data-count'?: number | undefined; onClick: () => void }) {
			const mergedProps = mergePropMods(TestContext, props);
			return <div data-testid="test-element" {...mergedProps} />;
		}

		const propMods: PropModGeneric<{ 'data-count'?: number | undefined }> = {
			'data-count': () => count(),
		};

		const { getByTestId } = render(() => (
			<TestContext.Provider {...propMods}>
				<TestComponent onClick={incr} />
			</TestContext.Provider>
		));

		const element = getByTestId('test-element');
		expect(element).toHaveAttribute('data-count', '0');
		element.click();
		expect(element).toHaveAttribute('data-count', '1');
	});

	it('should stack multiple Provider contexts', () => {
		const TestContext = createPropModContext<JSX.HTMLAttributes<HTMLDivElement>>();

		function TestComponent(props: JSX.HTMLAttributes<HTMLDivElement>) {
			const mergedProps = mergePropMods(TestContext, props);
			return <div data-testid="test-element" {...mergedProps} />;
		}

		const outerMods: PropModGeneric<JSX.HTMLAttributes<HTMLDivElement>> = {
			class: (prev) => `${prev || ''} outer-class`,
			'aria-label': () => 'outer-label',
		};

		const innerMods: PropModGeneric<JSX.HTMLAttributes<HTMLDivElement>> = {
			class: (prev) => `${prev || ''} inner-class`,
			id: () => 'inner-id',
		};

		const { getByTestId } = render(() => (
			<TestContext.Provider {...outerMods}>
				<TestContext.Provider {...innerMods}>
					<TestComponent class="original-class" />
				</TestContext.Provider>
			</TestContext.Provider>
		));

		const element = getByTestId('test-element');
		expect(element).toHaveAttribute('class', 'original-class outer-class inner-class');
		expect(element).toHaveAttribute('id', 'inner-id');
		expect(element).toHaveAttribute('aria-label', 'outer-label');
	});

	it('should reset context with Reset component', () => {
		const TestContext = createPropModContext<JSX.HTMLAttributes<HTMLDivElement>>();

		function TestComponent(props: JSX.HTMLAttributes<HTMLDivElement>) {
			const mergedProps = mergePropMods(TestContext, props);
			return <div data-testid="test-element" {...mergedProps} />;
		}

		const propMods: PropModGeneric<JSX.HTMLAttributes<HTMLDivElement>> = {
			class: (prev) => `${prev || ''} mod-class`,
			id: () => 'mod-id',
		};

		const { getByTestId } = render(() => (
			<TestContext.Provider {...propMods}>
				<TestContext.Reset>
					<TestComponent class="original-class" />
				</TestContext.Reset>
			</TestContext.Provider>
		));

		const element = getByTestId('test-element');
		expect(element).toHaveClass('original-class');
		expect(element).not.toHaveClass('mod-class');
		expect(element).not.toHaveAttribute('id', 'mod-id');
	});
});

describe('useSingleProp', () => {
	it('should return undefined when no prop mods exist', () => {
		const TestContext = createPropModContext<JSX.HTMLAttributes<HTMLDivElement>>();

		function TestComponent() {
			const id = useSingleProp(TestContext, 'id');
			return <div data-testid="test-element" data-result={id || 'none'} />;
		}

		const { getByTestId } = render(() => <TestComponent />);

		const element = getByTestId('test-element');
		expect(element).toHaveAttribute('data-result', 'none');
	});

	it('should return the prop value from a single provider', () => {
		const TestContext = createPropModContext<JSX.HTMLAttributes<HTMLDivElement>>();

		function TestComponent() {
			const id = useSingleProp(TestContext, 'id');
			return <div data-testid="test-element" data-result={id} />;
		}

		const propMods: PropModGeneric<JSX.HTMLAttributes<HTMLDivElement>> = {
			id: () => 'mod-id',
		};

		const { getByTestId } = render(() => (
			<TestContext.Provider {...propMods}>
				<TestComponent />
			</TestContext.Provider>
		));

		const element = getByTestId('test-element');
		expect(element).toHaveAttribute('data-result', 'mod-id');
	});

	it('should apply multiple providers to a single prop', () => {
		const TestContext = createPropModContext<{ text: string }>();

		function TestComponent() {
			const text = useSingleProp(TestContext, 'text', 'initial');
			return <div data-testid="test-element" data-text={text} />;
		}

		const outerMods = {
			text: (prev: string | undefined) => `${prev || ''}-outer`,
		};

		const innerMods = {
			text: (prev: string | undefined) => `${prev || ''}-inner`,
		};

		const { getByTestId } = render(() => (
			<TestContext.Provider {...outerMods}>
				<TestContext.Provider {...innerMods}>
					<TestComponent />
				</TestContext.Provider>
			</TestContext.Provider>
		));

		const element = getByTestId('test-element');
		expect(element).toHaveAttribute('data-text', 'initial-outer-inner');
	});
});
