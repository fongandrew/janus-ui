import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { createAuto, createAutoId } from '~/shared/utility/solid/auto-prop';

const TestAutoComponent = (props: { testProp?: string; otherProp?: string }) => {
	const testPropAuto = createAuto(props, 'testProp');

	return <div data-test-auto={testPropAuto()} data-other-prop={props.otherProp} />;
};

const TestAutoIdComponent = (props: { id?: string }) => {
	const autoId = createAutoId(props);

	return <div id={autoId()}>Test ID Component</div>;
};

describe('auto-prop utilities', () => {
	describe('createAuto', () => {
		it('should use the provided prop value when available', async () => {
			const element = render(() => <TestAutoComponent testProp="explicit-value" />).container
				.firstChild as HTMLElement;
			expect(element.getAttribute('data-test-auto')).toBe('explicit-value');
		});

		it('should generate a unique ID when no prop value is provided', async () => {
			const element = render(() => <TestAutoComponent />).container.firstChild as HTMLElement;
			expect(element.getAttribute('data-test-auto')).toBeTruthy();
			expect(element.getAttribute('data-test-auto')).toMatch(/^[a-z0-9-]+$/i);
		});
	});

	describe('createAutoId', () => {
		it('should use the provided id when available', async () => {
			const element = render(() => <TestAutoIdComponent id="explicit-id" />).container
				.firstChild as HTMLElement;

			expect(element.id).toBe('explicit-id');
		});

		it('should generate a unique ID when no id is provided', async () => {
			const element = render(() => <TestAutoIdComponent />).container
				.firstChild as HTMLElement;

			expect(element.id).toBeTruthy();
			expect(element.id).toMatch(/^[a-z0-9-]+$/i);
		});
	});
});
