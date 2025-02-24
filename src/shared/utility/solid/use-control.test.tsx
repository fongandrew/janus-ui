import { render } from '@solidjs/testing-library';
import { createSignal, mergeProps } from 'solid-js';

import { Control } from '~/shared/utility/controls/control';
import { useControl } from '~/shared/utility/solid/use-control';

class TestControl extends Control<HTMLElement, { count: number }> {
	sibling?: HTMLElement;

	override onMount() {
		this.node.setAttribute('data-mounted', this.props.count.toString());

		const sibling = document.createElement('div');
		sibling.setAttribute('data-testid', 'sibling');
		this.sibling = sibling;
		this.node.parentElement?.appendChild(sibling);
	}

	override onUpdate() {
		this.node.setAttribute('data-updated', this.props.count.toString());
	}

	override onCleanUp() {
		this.sibling?.remove();
	}
}

describe('useControl', () => {
	function TestComponent(props: { id?: string | undefined }) {
		const [count, setCount] = createSignal(0);
		const incr = () => setCount((n) => n + 1);

		const merged = mergeProps(() => ({ count: count() }), props);
		const ctrlProps = useControl(TestControl, merged);
		return (
			<button data-testid="control" onClick={incr} {...ctrlProps}>
				Test
			</button>
		);
	}

	it('assigns initial attributes', () => {
		const { getByTestId } = render(() => <TestComponent />);

		const control = getByTestId('control');
		expect(control).toHaveAttribute('id');
		expect(control).toHaveAttribute('data-mounted', '0');

		expect(getByTestId('sibling')).toBeInTheDocument();
	});

	it('works with an explicit ID', () => {
		const { getByTestId } = render(() => <TestComponent id="explicit-id" />);

		const control = getByTestId('control');
		expect(control).toHaveAttribute('id', 'explicit-id');
		expect(control).toHaveAttribute('data-mounted', '0');
	});

	it('re-runs update on prop change', () => {
		const { getByTestId } = render(() => <TestComponent />);

		const control = getByTestId('control');
		control.click();

		expect(control).toHaveAttribute('data-updated', '1');
	});

	it('cleans up on unmount', () => {
		const { getByTestId, unmount } = render(() => <TestComponent />);
		unmount();
		expect(() => getByTestId('sibling')).toThrow();
	});
});
