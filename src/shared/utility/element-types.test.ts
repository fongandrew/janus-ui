import { isDialog, isInput, isTextInput } from '~/shared/utility/element-types';

describe('element-types utility functions', () => {
	it('isDialog should return true for dialog elements', () => {
		const dialog = document.createElement('dialog');
		expect(isDialog(dialog)).toBe(true);
	});

	it('isDialog should return false for non-dialog elements', () => {
		const div = document.createElement('div');
		expect(isDialog(div)).toBe(false);
	});

	it('isInput should return true for input elements', () => {
		const input = document.createElement('input');
		expect(isInput(input)).toBe(true);
	});

	it('isInput should return false for non-input elements', () => {
		const button = document.createElement('button');
		expect(isInput(button)).toBe(false);
	});

	it('isTextInput should return true for text input elements', () => {
		const textInput = document.createElement('input');
		textInput.type = 'text';
		expect(isTextInput(textInput)).toBe(true);
	});

	it('isTextInput should return false for non-text input elements', () => {
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		expect(isTextInput(checkbox)).toBe(false);
	});
});
