/**
 * Smoke tests: every component actually renders without throwing, and a
 * few interactive ones behave as documented. Not a substitute for the
 * full per-component E2E suite from PLAN 6.T -- a cheap, fast backstop
 * that catches runtime issues (bad imports, JSX mistakes, context misuse)
 * type-checking alone wouldn't.
 */
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { unmount as unmountDom } from '~/lib2/dom';
import { Alert } from '~/lib2/solid/alert';
import { Avatar } from '~/lib2/solid/avatar';
import { Badge } from '~/lib2/solid/badge';
import { Button, IconButton } from '~/lib2/solid/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/lib2/solid/card';
import { Checkbox } from '~/lib2/solid/checkbox';
import { Disclosure } from '~/lib2/solid/disclosure';
import { Drawer } from '~/lib2/solid/drawer';
import { Form, FormError, SubmitButton } from '~/lib2/solid/form';
import { Input } from '~/lib2/solid/input';
import { LabelledInput } from '~/lib2/solid/labelled-input';
import { Menu, MenuItem } from '~/lib2/solid/menu';
import { Modal } from '~/lib2/solid/modal';
import { ModalForm, ModalSpeedBump } from '~/lib2/solid/modal-form';
import { Password } from '~/lib2/solid/password';
import { Popover } from '~/lib2/solid/popover';
import { Radio, RadioGroup } from '~/lib2/solid/radio';
import { SelectNative } from '~/lib2/solid/select-native';
import { Skeleton } from '~/lib2/solid/skeleton';
import { Spinner } from '~/lib2/solid/spinner';
import { StyledSelect } from '~/lib2/solid/styled-select';
import { Tab, TabList, TabPanel, Tabs } from '~/lib2/solid/tabs';
import { Tag } from '~/lib2/solid/tag';
import { Textarea } from '~/lib2/solid/textarea';
import { Toggle } from '~/lib2/solid/toggle';
import { Tooltip } from '~/lib2/solid/tooltip';

afterEach(() => {
	cleanup();
	unmountDom();
});

describe('component smoke tests', () => {
	it('renders Button / IconButton', () => {
		render(() => (
			<>
				<Button variant="primary">Save</Button>
				<IconButton label="Close">×</IconButton>
			</>
		));
		expect(screen.getByText('Save')).toBeInTheDocument();
		expect(screen.getByLabelText('Close')).toBeInTheDocument();
	});

	it('renders the Card family', () => {
		render(() => (
			<Card surface="elevated">
				<CardHeader>
					<CardTitle>Title</CardTitle>
				</CardHeader>
				<CardContent>Body</CardContent>
			</Card>
		));
		expect(screen.getByText('Title')).toBeInTheDocument();
		expect(screen.getByText('Body')).toBeInTheDocument();
	});

	it('renders Alert', () => {
		render(() => <Alert variant="danger">Something broke</Alert>);
		expect(screen.getByRole('alert')).toHaveTextContent('Something broke');
	});

	it('renders Input inside LabelledInput with correct ARIA wiring', () => {
		render(() => (
			<LabelledInput label="Email" description="We never share it" required>
				{(p) => <Input {...p} name="email" />}
			</LabelledInput>
		));
		const input = screen.getByLabelText(/Email/) as HTMLInputElement;
		expect(input).toBeInTheDocument();
		expect(input.getAttribute('aria-describedby')).toContain('-desc');
		expect(input.getAttribute('aria-describedby')).toContain('-err');
		expect(input.getAttribute('aria-required')).toBe('true');
	});

	it('renders Textarea', () => {
		render(() => <Textarea name="bio" />);
		expect(document.querySelector('textarea[name="bio"]')).toBeInTheDocument();
	});

	it('Checkbox toggles checked state on click (native <label> association, no JS needed)', () => {
		render(() => (
			<Checkbox name="agree" data-testid="agree">
				I agree
			</Checkbox>
		));
		const input = document.querySelector('input[name="agree"]') as HTMLInputElement;
		expect(input.checked).toBe(false);
		fireEvent.click(screen.getByText('I agree'));
		expect(input.checked).toBe(true);
	});

	it('Checkbox reflects the indeterminate prop on the DOM node', () => {
		render(() => (
			<Checkbox name="partial" indeterminate>
				Partial
			</Checkbox>
		));
		const input = document.querySelector('input[name="partial"]') as HTMLInputElement;
		expect(input.indeterminate).toBe(true);
	});

	it('renders Radio / RadioGroup', () => {
		render(() => (
			<RadioGroup>
				<Radio name="size" value="sm">
					Small
				</Radio>
				<Radio name="size" value="lg">
					Large
				</Radio>
			</RadioGroup>
		));
		expect(screen.getByRole('radiogroup')).toBeInTheDocument();
		expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(2);
	});

	it('Toggle is a checkbox with role=switch', () => {
		render(() => <Toggle name="active">Active</Toggle>);
		const input = document.querySelector('input[role="switch"]') as HTMLInputElement;
		expect(input.type).toBe('checkbox');
	});

	it('renders SelectNative with options', () => {
		render(() => (
			<SelectNative
				name="color"
				options={[
					{ value: 'r', label: 'Red' },
					{ value: 'g', label: 'Green' },
				]}
			/>
		));
		expect(screen.getByText('Red')).toBeInTheDocument();
		expect(screen.getByText('Green')).toBeInTheDocument();
	});

	it('Tag renders a remove button when onRemove is given', () => {
		const onRemove = vi.fn();
		render(() => (
			<Tag onRemove={onRemove} removeLabel="Remove tag">
				css
			</Tag>
		));
		fireEvent.click(screen.getByLabelText('Remove tag'));
		expect(onRemove).toHaveBeenCalledTimes(1);
	});

	it('renders Badge / Avatar / Spinner / Skeleton', () => {
		render(() => (
			<>
				<Badge>3</Badge>
				<Avatar alt="A" fallback="AB" />
				<Spinner />
				<Skeleton width="4rem" />
			</>
		));
		expect(screen.getByText('3')).toBeInTheDocument();
		expect(screen.getByText('AB')).toBeInTheDocument();
		expect(screen.getByLabelText('Loading')).toBeInTheDocument();
	});

	it('renders Disclosure as <details><summary>', () => {
		render(() => <Disclosure summary="More info">Hidden content</Disclosure>);
		const details = document.querySelector('details.c-disclosure');
		expect(details).toBeInTheDocument();
		expect(screen.getByText('More info')).toBeInTheDocument();
	});

	it('renders Tooltip with its scoped anchor-name style', () => {
		render(() => (
			<>
				<button id="trigger">Hover me</button>
				<Tooltip anchor="trigger" content="A hint" />
			</>
		));
		expect(screen.getByRole('tooltip')).toBeInTheDocument();
	});

	it('renders Popover with its scoped anchor-name style', () => {
		render(() => (
			<>
				<button id="anchor-btn">Open</button>
				<Popover id="pop" anchor="anchor-btn">
					content
				</Popover>
			</>
		));
		expect(document.getElementById('pop')).toBeInTheDocument();
	});

	it('renders Tabs/TabList/Tab/TabPanel', () => {
		render(() => (
			<Tabs>
				<TabList>
					<Tab panelId="p1" selected>
						One
					</Tab>
					<Tab panelId="p2">Two</Tab>
				</TabList>
				<TabPanel tabId="t1" selected>
					Panel one
				</TabPanel>
				<TabPanel tabId="t2">Panel two</TabPanel>
			</Tabs>
		));
		expect(screen.getByRole('tablist')).toBeInTheDocument();
		expect(screen.getAllByRole('tab')).toHaveLength(2);
	});

	it('renders Modal / Drawer as <dialog>', () => {
		render(() => (
			<>
				<Modal id="m1">modal content</Modal>
				<Drawer id="d1" side="end">
					drawer content
				</Drawer>
			</>
		));
		expect(document.getElementById('m1')?.tagName).toBe('DIALOG');
		expect(document.getElementById('d1')?.classList.contains('c-drawer--end')).toBe(true);
	});

	it('renders Menu / MenuItem', () => {
		render(() => (
			<Menu id="menu1">
				<MenuItem>Profile</MenuItem>
				<MenuItem disabled>Settings</MenuItem>
			</Menu>
		));
		expect(document.getElementById('menu1')).toBeInTheDocument();
		expect(screen.getByText('Settings').closest('button')?.getAttribute('aria-disabled')).toBe(
			'true',
		);
	});

	it('StyledSelect shows the selected option and updates on click', () => {
		const [value, setValue] = createSignal('a');
		render(() => (
			<StyledSelect
				options={[
					{ value: 'a', label: 'Alpha' },
					{ value: 'b', label: 'Beta' },
				]}
				value={value()}
				onChange={setValue}
			/>
		));
		expect(screen.getByRole('combobox')).toHaveTextContent('Alpha');
		fireEvent.click(screen.getByText('Beta'));
		// eslint-disable-next-line solid/reactivity -- plain assertion read, not component logic
		expect(value()).toBe('b');
	});

	it('renders Form / FormError / SubmitButton', () => {
		render(() => (
			<Form id="f1">
				<FormError />
				<SubmitButton>Save</SubmitButton>
			</Form>
		));
		const form = document.getElementById('f1');
		expect(form?.getAttribute('data-js')).toBe('t-validate t-submit');
		expect(screen.getByText('Save').closest('button')?.getAttribute('form')).toBe('f1');
	});

	it('ModalForm composes t-close-on-success and t-reset-on-close by default', () => {
		render(() => <ModalForm id="mf1" />);
		const tokens = document.getElementById('mf1')?.getAttribute('data-js')?.split(/\s+/);
		expect(tokens).toEqual(
			expect.arrayContaining([
				't-validate',
				't-submit',
				't-close-on-success',
				't-reset-on-close',
			]),
		);
	});

	it('renders ModalSpeedBump as a nested <dialog>', () => {
		render(() => <ModalSpeedBump />);
		const dialog = document.querySelector('dialog[data-js="c-modal__speed-bump"]');
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText('You have unsaved changes.')).toBeInTheDocument();
	});

	it('Password toggles between password and text input type', () => {
		render(() => <Password name="pw" />);
		const input = document.querySelector('input[name="pw"]') as HTMLInputElement;
		expect(input.type).toBe('password');
		fireEvent.click(screen.getByLabelText('Show password'));
		expect(input.type).toBe('text');
	});
});
