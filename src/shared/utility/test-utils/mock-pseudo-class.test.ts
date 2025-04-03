import { describe, expect, it } from 'vitest';

import { mockPseudoClass } from '~/shared/utility/test-utils/mock-pseudo-class';
import { mountStr } from '~/shared/utility/test-utils/mount';

describe('mockPseudoClass', () => {
	it('should replace fake pseudo classes for querySelector', () => {
		mountStr(`<div>
            <span data-foo>foo</span>
            <span data-bar>bar</span>
            <span data-baz>baz</span>
        </div>`);

		mockPseudoClass(':foo', '[data-foo]');
		mockPseudoClass(':bar', '[data-bar]');

		expect(document.querySelector('span:foo')?.textContent).toBe('foo');
		expect(document.querySelector('span:bar')?.textContent).toBe('bar');
	});

	it('should replace fake pseudo classes for querySelectorAll', () => {
		mountStr(`<div>
            <span data-foo>foo1</span>
            <span data-foo>foo2</span>
            <span data-bar>bar</span>
        </div>`);

		mockPseudoClass(':foo', '[data-foo]');

		const foos = document.querySelectorAll('span:foo');
		expect(foos.length).toBe(2);
	});

	it('should replace fake pseudo classes for closest', () => {
		mountStr(`<div data-baz>
            <span data-bar>
                <span data-foo>foo</span>
                bar
            </span>
            baz
        </div>`);

		mockPseudoClass(':foo', '[data-foo]');
		mockPseudoClass(':bar', '[data-bar]');

		expect(
			document.querySelector(':foo')?.closest(':bar')?.textContent?.replace(/\s+/gm, ''),
		).toBe('foobar');
	});
});
