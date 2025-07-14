import { render } from '@solidjs/testing-library';
import { type Component } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LocaleContext, useLocale, useT } from '~/lib/utility/solid/locale-context';
import { clearTFunctions, registerTFunction } from '~/lib/utility/text/t-tag';

const TestComponent: Component = () => {
	const locale = useLocale();
	const t = useT();

	return (
		<div data-testid="locale-test">
			<span data-testid="locale">{locale}</span>
			<span data-testid="translated">{t`Hello world`}</span>
		</div>
	);
};

describe('LocaleContext', () => {
	beforeEach(() => {
		// Set up document language for testing
		document.documentElement.lang = 'en-US';

		// Register custom t functions for testing
		registerTFunction('en-US', (strings, ...values) => {
			return `[en-US] ${strings.reduce((result, string, i) => {
				return result + string + (values[i] !== undefined ? values[i] : '');
			}, '')}`;
		});

		registerTFunction('fr-FR', (strings, ...values) => {
			return `[fr-FR] ${strings.reduce((result, string, i) => {
				return result + string + (values[i] !== undefined ? values[i] : '');
			}, '')}`;
		});
	});

	afterEach(() => {
		// Clean up
		clearTFunctions();
	});

	it('should use the document language by default', () => {
		const { container } = render(() => <TestComponent />);

		const localeEl = container.querySelector('[data-testid="locale"]');
		const translatedEl = container.querySelector('[data-testid="translated"]');

		expect(localeEl?.textContent).toBe('en-US');
		expect(translatedEl?.textContent).toBe('[en-US] Hello world');
	});

	it('should use the locale provided via LocaleContext', () => {
		const { container } = render(() => (
			<LocaleContext.Provider value="fr-FR">
				<TestComponent />
			</LocaleContext.Provider>
		));

		const localeEl = container.querySelector('[data-testid="locale"]');
		const translatedEl = container.querySelector('[data-testid="translated"]');

		expect(localeEl?.textContent).toBe('fr-FR');
		expect(translatedEl?.textContent).toBe('[fr-FR] Hello world');
	});
});
