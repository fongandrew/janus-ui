import { render } from '@solidjs/testing-library';
import { type JSX } from 'solid-js';
import { describe, expect, it } from 'vitest';

import { combineRefs } from '~/shared/utility/solid/combine-refs';

describe('combineRefs', () => {
	it('should combine multiple callback refs correctly', () => {
		const setRef1 = vi.fn();
		const setRef2 = vi.fn();

		const TestComponent = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
			return (
				<div {...props} ref={combineRefs(setRef1, props.ref)}>
					Test
				</div>
			);
		};

		const { container } = render(() => <TestComponent ref={setRef2} />);
		const divElement = container.querySelector('div');

		expect(setRef1).toHaveBeenCalledWith(divElement);
		expect(setRef2).toHaveBeenCalledWith(divElement);
	});

	it('should combine variable prop refs correctly', () => {
		let varRef: HTMLDivElement | undefined;
		const setRef = vi.fn();

		const TestComponent = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
			return (
				<div {...props} ref={combineRefs(setRef, props.ref)}>
					Test
				</div>
			);
		};

		const { container } = render(() => <TestComponent ref={varRef} />);
		const divElement = container.querySelector('div');

		expect(varRef).toBe(divElement);
		expect(setRef).toHaveBeenCalledWith(divElement);
	});
});
