import cx from 'classix';
import { createUniqueId, For, type JSX, Show, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface StyledSelectOption {
	value: string;
	label: string;
	/** Optional rich rendering for this option (previews, swatches, etc.). */
	render?: () => JSX.Element;
}

export interface StyledSelectProps {
	options: StyledSelectOption[];
	value?: string;
	onChange?: (value: string) => void;
	/** Override rendering for every option (falls back to `option.render` / label). */
	renderOption?: (option: StyledSelectOption) => JSX.Element;
	id?: string;
	class?: string;
	placeholder?: JSX.Element;
	disabled?: boolean;
}

/**
 * StyledSelect (§10.3) — the one composite component: a `c-styled-select`
 * trigger opening a `[popover]` listbox. Selection is Solid-controlled; keyboard
 * navigation is handled by the DOM layer's roving-focus / active-descendant /
 * typeahead behaviors.
 */
export function StyledSelect(props: StyledSelectProps) {
	const [local] = splitProps(props, [
		'options',
		'value',
		'onChange',
		'renderOption',
		'id',
		'class',
		'placeholder',
		'disabled',
	]);
	const id = local.id ?? createUniqueId();
	const listboxId = `${id}-listbox`;

	const selected = () => local.options.find((option) => option.value === local.value);
	const renderOption = (option: StyledSelectOption): JSX.Element =>
		local.renderOption ? local.renderOption(option) : (option.render?.() ?? option.label);

	const choose = (option: StyledSelectOption, trigger: HTMLElement) => {
		local.onChange?.(option.value);
		(trigger.closest('[popover]') as HTMLElement | null)?.hidePopover?.();
	};

	return (
		<>
			<button
				type="button"
				id={id}
				popovertarget={listboxId}
				aria-haspopup="listbox"
				{...ariaize({ disabled: local.disabled ?? false })}
				class={cx('c-styled-select', local.class)}
				style={{ 'anchor-name': `--${id}` }}
			>
				<Show when={selected()} fallback={<span>{local.placeholder ?? 'Select…'}</span>}>
					{(option) => <span>{renderOption(option())}</span>}
				</Show>
			</button>
			<div
				id={listboxId}
				popover
				role="listbox"
				data-js="t-roving-focus t-active-descendant t-typeahead-filter t-request-close"
				class="c-styled-select__listbox o-menu"
				style={{ 'position-anchor': `--${id}` }}
			>
				<For each={local.options}>
					{(option) => (
						<button
							type="button"
							role="option"
							aria-selected={option.value === local.value ? 'true' : 'false'}
							class="o-menu-item"
							onClick={(event) => choose(option, event.currentTarget)}
						>
							{renderOption(option)}
						</button>
					)}
				</For>
			</div>
		</>
	);
}
