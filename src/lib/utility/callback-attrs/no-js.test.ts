import { describe, expect, it } from 'vitest';

import { setAttrs } from '~/lib/utility/attribute';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { processRoot } from '~/lib/utility/callback-attrs/mount';
import { mountAttr, mountRmAttr } from '~/lib/utility/callback-attrs/no-js';
import { mount } from '~/lib/utility/test-utils/mount';

describe('no-js callback attributes', () => {
	describe('mountAttr', () => {
		it('should set attribute on element when processRoot is called', () => {
			const elm = document.createElement('div');

			setAttrs(
				elm,
				callbackAttrs(mountAttr('data-test', 'value'), mountAttr('aria-hidden', 'true')),
			);
			mount(elm);

			processRoot(document);

			expect(elm.getAttribute('data-test')).toBe('value');
			expect(elm.getAttribute('aria-hidden')).toBe('true');
		});
	});

	describe('mountRmAttr', () => {
		it('should remove attribute from element when processRoot is called', () => {
			const elm = document.createElement('div');
			elm.setAttribute('data-test', 'remove-me');

			setAttrs(elm, callbackAttrs(mountRmAttr('data-test')));
			mount(elm);

			processRoot(document);

			expect(elm.hasAttribute('data-test')).toBe(false);
		});
	});
});
