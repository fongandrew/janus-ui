import { setAttrs } from '~/shared/utility/attribute';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { mountStr } from '~/shared/utility/test-utils/mount';

describe('event delegation', () => {
	describe('bubbling events', () => {
		it('should handle click events delegated to child elements', () => {
			const clickHandler = vi.fn();
			const handlerId = `p-test__${Math.random()}`;
			const handler = createHandler('click', handlerId, clickHandler);

			const container = mountStr(`
				<div id="parent">
					<button id="child">Hi</button>
				</div>
			`);

			const child = container.querySelector('#child') as HTMLElement;
			setAttrs(child, callbackAttrs(handler));
			child.click();

			expect(clickHandler).toHaveBeenCalledTimes(1);
			expect(clickHandler).toHaveBeenCalledWith(
				expect.objectContaining({ type: 'click', target: child }),
			);
		});

		it('should set currentTarget on element with data attribute', () => {
			let currentTargetAtClick = null;
			const clickHandler = vi.fn((e) => {
				currentTargetAtClick = e.currentTarget;
			});

			const handlerId = `p-test__${Math.random()}`;
			const handler = createHandler('click', handlerId, clickHandler);

			const container = mountStr(`
				<div id="parent">
					<button id="child">Hi</button>
				</div>
			`);

			const parent = container.querySelector('#parent') as HTMLElement;
			setAttrs(parent, callbackAttrs(handler));

			const child = container.querySelector('#child') as HTMLElement;
			child.click();

			// Roundabout way to check currentTarget because e.currentTarget
			// gets redefined as event bubbles, so if we check it now, it'll
			// just be the document or something
			expect(currentTargetAtClick).toBe(parent);
		});

		it('should respect stopPropagation in click events', () => {
			const parentHandler = vi.fn();
			const childHandler = vi.fn((e) => e.stopPropagation());

			const parentHandlerId = `p-test-parent__${Math.random()}`;
			const childHandlerId = `p-test-child__${Math.random()}`;

			const parentClickHandler = createHandler('click', parentHandlerId, parentHandler);
			const childClickHandler = createHandler('click', childHandlerId, childHandler);

			const container = mountStr(`
				<div id="parent">
					<div id="child"></div>
				</div>
			`);

			const parent = container.querySelector('#parent') as HTMLElement;
			const child = container.querySelector('#child') as HTMLElement;

			setAttrs(parent, callbackAttrs(parentClickHandler));
			setAttrs(child, callbackAttrs(childClickHandler));

			// Click on child should trigger child handler but stop propagation to parent
			child.click();

			expect(childHandler).toHaveBeenCalledTimes(1);
			expect(parentHandler).not.toHaveBeenCalled();
		});
	});

	describe('capturing events', () => {
		it('should handle toggle events in capture phase', () => {
			const toggleHandler = vi.fn();
			const handlerId = `p-test__${Math.random()}`;
			const handler = createHandler('toggle', handlerId, toggleHandler);

			const container = mountStr(`
                <details id="details">
                    <summary>Toggle me</summary>
                    <p>Content</p>
                </details>
			`);

			const details = container.querySelector('#details') as HTMLDetailsElement;
			setAttrs(details, callbackAttrs(handler));

			// Simulate toggle event
			const toggleEvent = new Event('toggle', { bubbles: true });
			details.dispatchEvent(toggleEvent);

			expect(toggleHandler).toHaveBeenCalledTimes(1);
			expect(toggleHandler).toHaveBeenCalledWith(toggleEvent);
		});
	});
});
