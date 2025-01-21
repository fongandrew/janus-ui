import { fireEvent, render, screen } from '@solidjs/testing-library';
import { type Component, createSignal } from 'solid-js';

import { PropBuilder } from '~/shared/utility/solid/prop-builder';

describe('PropBuilder', () => {
	it('should merge refs', () => {
		const builder = new PropBuilder<'div'>();
		let refValue: HTMLDivElement | undefined;

		const Parent: Component = () => {
			builder.addRef((el) => {
				refValue = el;
			});
			return <Child />;
		};

		const Child: Component = () => {
			return <div {...builder.merge({ 'data-testid': 'test-div' })}>Test</div>;
		};

		render(() => <Parent />);
		const div = screen.getByTestId('test-div');

		expect(refValue).toBe(div);
		expect(builder.ref()).toBe(div);
	});

	it('should extend attributes', () => {
		const builder = new PropBuilder<'div'>();

		const Parent: Component = () => {
			builder.extAttr('class', 'ext-class');
			return <Child />;
		};

		const Child: Component = () => {
			return (
				<div {...builder.merge({ class: 'another-class', 'data-testid': 'test-div' })}>
					Test
				</div>
			);
		};

		render(() => <Parent />);
		const div = screen.getByTestId('test-div');

		expect(div.className).toBe('another-class ext-class');
	});

	it('should extend attributes and track reactivity', () => {
		const builder = new PropBuilder<'div'>();

		const [dynamicClass, setDynamicClass] = createSignal('test-class');
		const [baseClass, setBaseClass] = createSignal('base-class');

		const Parent: Component = () => {
			builder.extAttr('class', () => dynamicClass());
			builder.extAttr('class', () => 'another-class');
			return <Child class={baseClass()} />;
		};

		const Child: Component<{ class?: string }> = (props) => {
			return (
				<div {...builder.merge({ class: props.class, 'data-testid': 'test-div' })}>
					Test
				</div>
			);
		};

		render(() => <Parent />);
		const div = screen.getByTestId('test-div');

		expect(div.className).toBe('base-class test-class another-class');

		setDynamicClass('updated-class');
		expect(div.className).toBe('base-class updated-class another-class');

		setBaseClass('new-base-class');
		expect(div.className).toBe('new-base-class updated-class another-class');
	});

	it('should set attributes', () => {
		const builder = new PropBuilder<'div'>();

		const Parent: Component = () => {
			builder.setAttr('aria-label', 'test label');
			return <Child />;
		};

		const Child: Component = () => {
			return <div {...builder.merge({ 'data-testid': 'test-div' })}>Test</div>;
		};

		render(() => <Parent />);
		const div = screen.getByTestId('test-div');

		expect(div.getAttribute('aria-label')).toBe('test label');
	});

	it('should unset attributes', () => {
		const builder = new PropBuilder<'div'>();

		const Parent: Component = () => {
			builder.setAttr('aria-label', 'test label');
			return <Child />;
		};

		const Child: Component = () => {
			builder.setAttr('aria-label', undefined);
			return <div {...builder.merge({ 'data-testid': 'test-div' })}>Test</div>;
		};

		render(() => <Parent />);
		const div = screen.getByTestId('test-div');

		expect(div.getAttribute('aria-label')).toBe(null);
	});

	it('should set attributes and track reactivity', () => {
		const builder = new PropBuilder<'div'>();

		const [label, setLabel] = createSignal('test label');
		const [childLabel, setChildLabel] = createSignal('child label');

		const Parent: Component = () => {
			builder.setAttr('aria-label', () => label());
			return <Child ariaLabel={childLabel()} />;
		};

		const Child: Component<{ ariaLabel?: string }> = (props) => {
			return (
				<div
					{...builder.merge({
						'aria-label': props.ariaLabel,
						'data-testid': 'test-div',
					})}
				>
					Test
				</div>
			);
		};

		render(() => <Parent />);
		const div = screen.getByTestId('test-div');

		// Parent's setAttr takes precedence over Child's prop
		expect(div.getAttribute('aria-label')).toBe('test label');

		setLabel('updated label');
		expect(div.getAttribute('aria-label')).toBe('updated label');

		// Child's prop change should not affect the attribute since Parent's setAttr takes precedence
		setChildLabel('new child label');
		expect(div.getAttribute('aria-label')).toBe('updated label');
	});

	it('should handle events', () => {
		const builder = new PropBuilder<'div'>();
		const clicks: number[] = [];

		const Parent: Component = () => {
			builder.handle('onClick', () => clicks.push(1));
			builder.handle('onClick', () => clicks.push(2));
			return <Child />;
		};

		const Child: Component = () => {
			return (
				<div
					{...builder.merge({
						'data-testid': 'test-div',
						onClick: () => clicks.push(3),
					})}
				>
					Test
				</div>
			);
		};

		render(() => <Parent />);
		const div = screen.getByTestId('test-div');

		fireEvent.click(div);
		expect(clicks).toEqual([1, 2, 3]);
	});

	it('should track ID assigned via prop', () => {
		const builder = new PropBuilder<'div'>();
		const TestComponent: Component<{ id: string }> = (props) => {
			return <div {...builder.merge({ id: props.id })}>Test</div>;
		};

		const [id, setId] = createSignal('initial');
		render(() => <TestComponent id={id()} />);

		const div = screen.getByText('Test');
		expect(div.id).toBe('initial');
		expect(builder.id()).toBe('initial');

		setId('updated');
		expect(div.id).toBe('updated');
		expect(builder.id()).toBe('updated');
	});

	it('should track ID assigned via builder', () => {
		const builder = new PropBuilder<'div'>();
		const [id, setId] = createSignal('initial');
		const TestComponent: Component = () => {
			builder.setAttr('id', () => id());
			return <div {...builder.merge({})}>Test</div>;
		};

		render(() => <TestComponent />);

		const div = screen.getByText('Test');
		expect(div.id).toBe('initial');
		expect(builder.id()).toBe('initial');

		setId('updated');
		expect(div.id).toBe('updated');
		expect(builder.id()).toBe('updated');
	});

	it('should merge all props together', () => {
		const builder = new PropBuilder<'div'>();
		const clicked = { value: false };

		const Parent: Component = () => {
			builder.extAttr('class', () => 'ext-class');
			builder.setAttr('aria-label', () => 'test label');
			builder.handle('onClick', () => {
				clicked.value = true;
			});
			return <Child />;
		};

		const Child: Component = () => {
			return (
				<div
					{...builder.merge({
						id: 'test-id',
						class: 'base-class',
						style: 'color: red',
						'data-testid': 'test-div',
					})}
				>
					Test
				</div>
			);
		};

		render(() => <Parent />);
		const div = screen.getByTestId('test-div');

		expect(div.id).toBe('test-id');
		expect(div.className).toBe('base-class ext-class');
		expect(div.style.color).toBe('red');
		expect(div.getAttribute('aria-label')).toBe('test label');

		fireEvent.click(div);
		expect(clicked.value).toBe(true);
	});

	it('should update sibling components previously rendered with the same builder', () => {
		const builder = new PropBuilder<'div'>();

		const Child1: Component = () => {
			builder.extAttr('class', 'ext-class-1');
			return <div {...builder.merge({ 'data-testid': 'test1' })}>Test 1</div>;
		};

		const Child2: Component = () => {
			builder.extAttr('class', 'ext-class-2');
			return <div>Test 2</div>;
		};

		render(() => (
			<>
				<Child1 />
				<Child2 />
			</>
		));
		const div1 = screen.getByTestId('test1');
		expect(div1.className).toBe('ext-class-1 ext-class-2');
	});
});
