import { firstFocusable, focusables } from '~/shared/utility/focusables';
import { mountStr } from '~/shared/utility/test-utils/mount';

describe('focusables utility', () => {
	describe('focusables function', () => {
		it('should return all focusable elements within a container', () => {
			const container = mountStr(`
				<a href="#">Link</a>
				<button>Button</button>
				<input type="text" />
				<select><option>Option</option></select>
				<textarea></textarea>
				<details><summary>Details</summary>Content</details>
				<div tabindex="0">Focusable div</div>
                <div>Non-focusable div</div>
			`);

			const elements = focusables(container);
			expect(Array.from(elements).length).toBe(7);
		});

		it('should exclude disabled elements', () => {
			const container = mountStr(`
				<a href="#">Link</a>
				<button disabled>Disabled Button</button>
				<input type="text" disabled />
				<select disabled><option>Option</option></select>
				<textarea disabled></textarea>
				<details><summary>Details</summary>Content</details>
				<div tabindex="0">Focusable div</div>
			`);

			const elements = focusables(container);
			expect(Array.from(elements).length).toBe(3);
		});

		it('should exclude elements with tabindex="-1"', () => {
			const container = mountStr(`
				<a href="#" tabindex="-1">Link</a>
				<button>Button</button>
				<input type="text" tabindex="-1" />
			`);

			const elements = focusables(container);
			expect(Array.from(elements).length).toBe(1);
			expect(Array.from(elements)[0]?.tagName.toLowerCase()).toBe('button');
		});
	});

	describe('firstFocusable function', () => {
		it('should return the first focusable element within a container', () => {
			const container = mountStr(`
                <div>Non-focusable div</div>
                <a href="#">Link</a>
                <button>Button</button>
            `);

			const element = firstFocusable(container);
			expect(element).not.toBeNull();
			expect(element?.tagName.toLowerCase()).toBe('a');
		});

		it('should return null if no focusable elements exist', () => {
			const container = mountStr(`
                <div>Non-focusable div</div>
                <button disabled>Disabled button</button>
            `);

			const element = firstFocusable(container);
			expect(element).toBeNull();
		});
	});
});
