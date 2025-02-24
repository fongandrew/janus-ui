import { fireEvent, screen } from '@testing-library/dom';

import { Control, initControls } from '~/shared/utility/controls/control';

class TestControl extends Control<HTMLElement, { value: string }> {
	protected override onMount() {
		this.listen('click', this.handleClick);
	}

	protected handleClick() {
		this.node.setAttribute('data-clicked', 'true');
	}
}

describe('Control', () => {
	let container: HTMLElement | undefined;

	beforeEach(() => {
		container = document.createElement('div');
		container.innerHTML = '<div data-testid="test" data-control=""><span>Test</span></div>';
		document.body.appendChild(container);
	});

	afterEach(() => {
		container?.remove();
	});

	it('should delegate click event', () => {
		initControls('data-control', TestControl, { value: 'foo' });

		const element = screen.getByTestId('test');
		fireEvent.click(element.querySelector<HTMLElement>('span')!);

		expect(element).toHaveAttribute('data-clicked', 'true');
	});
});
