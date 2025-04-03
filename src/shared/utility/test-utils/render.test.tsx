import { isServer } from 'solid-js/web';
import { describe, expect, it, vi } from 'vitest';

import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { createMounter } from '~/shared/utility/callback-attrs/mount';
import { renderContainer } from '~/shared/utility/test-utils/render';

describe('renderContainer', () => {
	if (isServer) {
		it('renders components, without hooking up Solid', async () => {
			const onClick = vi.fn();
			const elm = await renderContainer(() => (
				<button onClick={onClick} {...callbackAttrs()}>
					Click me
				</button>
			));

			elm.querySelector('button')?.click();
			expect(onClick).not.toHaveBeenCalled();
		});
	} else {
		it('renders components and callback attrs works', async () => {
			const onClick = vi.fn();
			const callback = createHandler('click', `$p-test__${Math.random()}`, onClick);
			const elm = await renderContainer(() => (
				<button {...callbackAttrs(callback)}>Click me</button>
			));

			elm.querySelector('button')?.click();
			expect(onClick).toHaveBeenCalled();
		});
	}

	it('processes mount callbacks', async () => {
		const mockMountHandler = vi.fn();
		const mountAttr = createMounter(`$p-test__${Math.random()}`, mockMountHandler);
		await renderContainer(() => <div {...callbackAttrs(mountAttr)}>Test Component</div>);
		expect(mockMountHandler).toHaveBeenCalledTimes(1);
	});
});
