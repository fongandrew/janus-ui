/**
 * StyledSelect (§13.7, §10.3) — the one composite: a custom button + listbox
 * in a [popover], for options that need rendered content. A hidden input
 * carries the value for the form engine; clicking (or Enter-ing) an option
 * updates it and the button label.
 */
import cx from 'classix';
import { createSignal, createUniqueId, For, type JSX, splitProps } from 'solid-js';

export interface StyledSelectOption {
	value: string;
	label: JSX.Element;
}

export interface StyledSelectProps {
	id?: string | undefined;
	/** Form field name for the hidden input. */
	name?: string | undefined;
	value?: string | undefined;
	onChange?: ((value: string) => void) | undefined;
	options: StyledSelectOption[];
	renderOption?: ((option: StyledSelectOption) => JSX.Element) | undefined;
	placeholder?: JSX.Element;
	class?: string | undefined;
}

export function StyledSelect(props: StyledSelectProps) {
	const [local] = splitProps(props, ['options', 'onChange', 'renderOption']);
	const fallbackId = createUniqueId();
	const id = () => props.id ?? fallbackId;
	const listboxId = () => `${id()}-listbox`;

	// Uncontrolled after first selection; props.value seeds the initial state.
	const [picked, setPicked] = createSignal<string>();
	const value = () => picked() ?? props.value ?? '';
	const selectedOption = () => local.options.find((option) => option.value === value());

	const pick = (ev: MouseEvent & { currentTarget: HTMLDivElement }) => {
		if (!(ev.target instanceof Element)) return;
		const option = ev.target.closest<HTMLElement>('[role="option"]');
		const next = option?.getAttribute('data-value');
		if (next == null) return;
		setPicked(next);
		local.onChange?.(next);
		ev.currentTarget.hidePopover();
	};

	return (
		<div class={cx('c-styled-select', props.class)}>
			<input type="hidden" name={props.name} value={value()} />
			<button
				type="button"
				id={id()}
				class="c-button o-input-box c-styled-select__button"
				popovertarget={listboxId()}
				aria-haspopup="listbox"
				style={{ 'anchor-name': '--select-anchor' }}
			>
				{selectedOption()?.label ?? props.placeholder ?? 'Select…'}
			</button>
			<div
				id={listboxId()}
				popover
				role="listbox"
				aria-orientation="vertical"
				class="c-styled-select__listbox o-menu"
				data-js="t-roving-focus t-active-descendant t-typeahead-filter t-request-close"
				onClick={pick}
			>
				<For each={local.options}>
					{(option) => (
						<button
							type="button"
							role="option"
							class="o-menu-item"
							data-value={option.value}
							aria-selected={option.value === value() ? 'true' : 'false'}
						>
							{local.renderOption?.(option) ?? option.label}
						</button>
					)}
				</For>
			</div>
		</div>
	);
}
