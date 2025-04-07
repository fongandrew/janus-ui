import { fireEvent, render } from '@solidjs/testing-library';
import { type JSX } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';

import { handleEvent } from '~/shared/utility/solid/handle-event';

describe('handleEvent', () => {
	const buttonClick = vi.fn();
	const propsClick = vi.fn();

	function TestButton(props: JSX.HTMLAttributes<HTMLButtonElement>) {
		function handleClick(this: HTMLElement, event: MouseEvent | KeyboardEvent) {
			buttonClick(event);
			handleEvent(this, props.onClick, event);
		}
		return (
			<button {...props} onClick={handleClick}>
				Click me
			</button>
		);
	}

	it('should call the function handler', () => {
		const { container } = render(() => <TestButton onClick={propsClick} />);

		const button = container.querySelector('button');
		fireEvent.click(button!);

		expect(buttonClick).toHaveBeenCalledWith(expect.any(Event));
		expect(propsClick).toHaveBeenCalledWith(expect.any(Event));
	});

	it('should call the bound handler', () => {
		const { container } = render(() => <TestButton onClick={[propsClick, 'hello']} />);

		const button = container.querySelector('button');
		fireEvent.click(button!);

		expect(buttonClick).toHaveBeenCalledWith(expect.any(Event));
		expect(propsClick).toHaveBeenCalledWith('hello', expect.any(Event));
	});
});
