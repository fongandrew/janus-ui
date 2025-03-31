import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { createMounter } from '~/shared/utility/callback-attrs/mount';
import { render } from '~/shared/utility/test-utils/render';

describe('render', () => {
	it('renders components, without hooking up Solid', async () => {
		const onClick = vi.fn();
		const elm = await render(() => (
			<button onClick={onClick} {...callbackAttrs()}>
				Click me
			</button>
		));

		elm.querySelector('button')?.click();
		expect(onClick).not.toHaveBeenCalled();
	});

	it('renders components and callback attrs works', async () => {
		const onClick = vi.fn();
		const callback = createHandler('click', `$p-test__${Math.random()}`, onClick);
		const elm = await render(() => <button {...callbackAttrs(callback)}>Click me</button>);

		elm.querySelector('button')?.click();
		expect(onClick).toHaveBeenCalled();
	});

	it('processes mount callbacks', async () => {
		const mockMountHandler = vi.fn();
		const mountAttr = createMounter(`$p-test__${Math.random()}`, mockMountHandler);
		await render(() => <div {...callbackAttrs(mountAttr)}>Test Component</div>);
		expect(mockMountHandler).toHaveBeenCalledTimes(1);
	});
});
