import { fireEvent, render } from '@solidjs/testing-library';
import { type JSX } from 'solid-js';

import { bindProp, combineEventHandlers } from '~/shared/utility/solid/combine-event-handlers';

describe('combineEventHandlers', () => {
	it('should call all handlers in order', () => {
		const handler1 = vi.fn();
		const handler2 = vi.fn();
		const callOrder: string[] = [];
		const combinedHandler = combineEventHandlers(
			() => {
				handler1();
				callOrder.push('handler1');
			},
			() => {
				handler2();
				callOrder.push('handler2');
			},
		);

		const { getByTestId } = render(() => (
			<button data-testid="button" onClick={combinedHandler}>
				Click me
			</button>
		));

		const button = getByTestId('button');
		fireEvent.click(button);

		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler2).toHaveBeenCalledTimes(1);
		expect(callOrder).toEqual(['handler1', 'handler2']);
	});

	it('should stop calling handlers if stopImmediatePropagation is called', () => {
		const handler1 = vi.fn((event: Event) => event.stopImmediatePropagation());
		const handler2 = vi.fn();
		const combinedHandler = combineEventHandlers(handler1, handler2);

		const { getByTestId } = render(() => (
			<button data-testid="button" onClick={combinedHandler}>
				Click me
			</button>
		));

		const button = getByTestId('button');
		fireEvent.click(button);

		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler2).not.toHaveBeenCalled();
	});

	it('should handle bound event handlers', () => {
		const handler1 = vi.fn();
		const handler2 = vi.fn();
		const handler3 = vi.fn();

		const combinedHandler = combineEventHandlers(
			[handler1, 'hello'],
			[handler2, 'world'],
			(e) => handler3('cat', e),
		);

		const { getByTestId } = render(() => (
			<button data-testid="button" onClick={combinedHandler}>
				Click me
			</button>
		));

		const button = getByTestId('button');
		fireEvent.click(button);

		expect(handler1).toHaveBeenCalledWith('hello', expect.any(Event));
		expect(handler2).toHaveBeenCalledWith('world', expect.any(Event));
		expect(handler3).toHaveBeenCalledWith('cat', expect.any(Event));
	});

	it('should work with prop event handlers', () => {
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		function TestButton(props: JSX.HTMLAttributes<HTMLButtonElement>) {
			const extendedOnClick = combineEventHandlers(handler1, bindProp(props, 'onClick'));
			return (
				<button {...props} onClick={extendedOnClick}>
					Click me
				</button>
			);
		}

		const { getByTestId } = render(() => (
			<TestButton data-testid="button" onClick={handler2} />
		));

		const button = getByTestId('button');
		fireEvent.click(button);

		expect(handler1).toHaveBeenCalled();
		expect(handler2).toHaveBeenCalled();
	});
});
