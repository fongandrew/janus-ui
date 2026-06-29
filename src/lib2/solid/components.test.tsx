import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { Alert } from '~/lib2/solid/alert';
import { Button, IconButton } from '~/lib2/solid/button';
import { Checkbox } from '~/lib2/solid/checkbox';
import { Input } from '~/lib2/solid/input';
import { LabelledInput } from '~/lib2/solid/labelled-input';
import { Tab, TabList } from '~/lib2/solid/tabs';

describe('Button', () => {
	it('renders c-button with tone and aria-disabled (never native disabled)', () => {
		const { getByRole } = render(() => (
			<Button variant="primary" disabled>
				Save
			</Button>
		));
		const btn = getByRole('button');
		expect(btn.className).toContain('c-button');
		expect(btn.className).toContain('v-colors-primary');
		expect(btn.getAttribute('aria-disabled')).toBe('true');
		expect(btn.hasAttribute('disabled')).toBe(false);
		expect(btn.getAttribute('type')).toBe('button');
	});

	it('IconButton is square and labelled', () => {
		const { getByRole } = render(() => <IconButton label="Add">+</IconButton>);
		const btn = getByRole('button');
		expect(btn.className).toContain('c-button--icon');
		expect(btn.getAttribute('aria-label')).toBe('Add');
	});
});

describe('Alert', () => {
	it('defaults to role=alert and tones via v-colors', () => {
		const { getByRole } = render(() => <Alert variant="danger">Bad</Alert>);
		const el = getByRole('alert');
		expect(el.className).toContain('c-alert');
		expect(el.className).toContain('v-colors-danger');
	});
});

describe('LabelledInput', () => {
	it('wires deterministic label / describedby IDs to the control', () => {
		const { getByText, container } = render(() => (
			<LabelledInput id="email" label="Email" description="Used for login">
				{(p) => <Input {...p} type="email" name="email" />}
			</LabelledInput>
		));
		const input = container.querySelector('input')!;
		expect(input.id).toBe('email');
		expect(input.getAttribute('aria-labelledby')).toBe('email-label');
		expect(input.getAttribute('aria-describedby')).toBe('email-desc email-err');
		expect(getByText('Email').id).toBe('email-label');
		const err = container.querySelector('#email-err')!;
		expect(err.getAttribute('data-js')).toBe('t-validate-error');
	});
});

describe('Checkbox', () => {
	it('renders the custom control over a native checkbox', () => {
		const { container } = render(() => <Checkbox checked>Agree</Checkbox>);
		expect(container.querySelector('label.c-checkbox')).toBeTruthy();
		const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(input.checked).toBe(true);
	});
});

describe('Tabs', () => {
	it('TabList carries the roving-focus + select behaviors', () => {
		const { getByRole } = render(() => (
			<TabList>
				<Tab controls="p1" selected>
					One
				</Tab>
			</TabList>
		));
		expect(getByRole('tablist').getAttribute('data-js')).toBe('t-roving-focus c-tabs__select');
		expect(getByRole('tab').getAttribute('aria-selected')).toBe('true');
	});
});
