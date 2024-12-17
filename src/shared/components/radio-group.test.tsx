import { fireEvent, render, screen } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';

import { Radio } from '~/shared/components/radio';
import { RadioGroup } from '~/shared/components/radio-group';

describe('RadioGroup', () => {
	describe('uncontrolled', () => {
		it('should work with defaultValue', () => {
			render(() => (
				<RadioGroup name="test" defaultValue="2">
					<div>
						<Radio value="1" data-testid="radio-1" />
						<Radio value="2" data-testid="radio-2" />
					</div>
				</RadioGroup>
			));

			expect(screen.getByTestId('radio-1')).not.toBeChecked();
			expect(screen.getByTestId('radio-2')).toBeChecked();
		});

		it('should pass name prop to all radio inputs', () => {
			render(() => (
				<RadioGroup name="test-name">
					<div>
						<Radio value="1" data-testid="radio-1" />
						<Radio value="2" data-testid="radio-2" />
					</div>
				</RadioGroup>
			));

			const radio1 = screen.getByTestId('radio-1') as HTMLInputElement;
			const radio2 = screen.getByTestId('radio-2') as HTMLInputElement;

			expect(radio1.name).toBe('test-name');
			expect(radio2.name).toBe('test-name');
		});

		it('should update internal value when radio is clicked in uncontrolled mode', () => {
			const onChange = vi.fn();
			render(() => (
				<RadioGroup name="test" defaultValue="1" onChange={onChange}>
					<div>
						<Radio value="1" data-testid="radio-1" />
						<Radio value="2" data-testid="radio-2" />
					</div>
				</RadioGroup>
			));

			expect(screen.getByTestId('radio-1')).toBeChecked();
			expect(screen.getByTestId('radio-2')).not.toBeChecked();

			// Click second radio
			fireEvent.click(screen.getByTestId('radio-2'));

			// Value should change since it's uncontrolled
			expect(screen.getByTestId('radio-1')).not.toBeChecked();
			expect(screen.getByTestId('radio-2')).toBeChecked();

			// onChange should be called
			expect(onChange).toHaveBeenCalledTimes(1);
			expect(onChange.mock.calls[0]?.[0].target.value).toBe('2');
		});
	});

	describe('controlled', () => {
		it('should work in controlled mode with value prop', () => {
			const [value, setValue] = createSignal('1');
			const onChange = vi.fn();
			render(() => (
				<RadioGroup name="test" value={value()} onChange={onChange}>
					<div>
						<Radio value="1" data-testid="radio-1" />
						<Radio value="2" data-testid="radio-2" />
					</div>
				</RadioGroup>
			));

			expect(screen.getByTestId('radio-1')).toBeChecked();
			expect(screen.getByTestId('radio-2')).not.toBeChecked();

			// Updates when signal changes
			setValue('2');
			expect(screen.getByTestId('radio-1')).not.toBeChecked();
			expect(screen.getByTestId('radio-2')).toBeChecked();
		});
	});
});
