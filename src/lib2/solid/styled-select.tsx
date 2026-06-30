/**
 * `StyledSelect` (§13.7) — the one composite component: a styled trigger
 * button + a `c-menu`/`o-menu` popover listbox wired with `t-roving-focus`
 * + `t-active-descendant` + `t-typeahead-filter` (`dom/components/styled-select`).
 */

import { ChevronsUpDown } from 'lucide-solid';
import { createEffect, createSignal, createUniqueId, For, type JSX } from 'solid-js';

import { styledSelect } from '~/lib2/dom/components/styled-select';
import { ariaize } from '~/lib2/solid/aria';

export interface StyledSelectOption {
	value: string;
	label: string;
	render?: () => JSX.Element;
}

export interface StyledSelectProps {
	id?: string | undefined;
	options: StyledSelectOption[];
	value?: string | undefined;
	onChange?: ((value: string) => void) | undefined;
	placeholder?: string | undefined;
	disabled?: boolean | undefined;
	renderOption?: ((opt: StyledSelectOption) => JSX.Element) | undefined;
}

function renderOptionDefault(opt: StyledSelectOption): JSX.Element {
	return opt.render ? opt.render() : opt.label;
}

export function StyledSelect(props: StyledSelectProps): JSX.Element {
	// eslint-disable-next-line solid/reactivity -- id is captured once and stays stable
	const id = props.id ?? createUniqueId();
	const listboxId = `${id}-listbox`;

	// Seed from the initial value; the effect below keeps it synced reactively.
	// eslint-disable-next-line solid/reactivity
	const [selected, setSelected] = createSignal(props.value);
	createEffect(() => setSelected(() => props.value));

	const selectedOption = () => props.options.find((opt) => opt.value === selected());
	const render = () => props.renderOption ?? renderOptionDefault;

	let listboxEl: HTMLDivElement | undefined;

	function choose(opt: StyledSelectOption) {
		setSelected(() => opt.value);
		props.onChange?.(opt.value);
		listboxEl?.hidePopover?.();
	}

	return (
		<>
			<button
				type="button"
				id={id}
				popovertarget={listboxId}
				class="c-styled-select"
				role="combobox"
				aria-haspopup="listbox"
				aria-controls={listboxId}
				{...ariaize({ disabled: props.disabled })}
			>
				<span class="c-styled-select__value" data-placeholder={props.placeholder ?? ''}>
					{selectedOption() ? render()(selectedOption()!) : null}
				</span>
				<ChevronsUpDown class="c-styled-select__chevron" aria-hidden="true" />
			</button>
			<div
				{...styledSelect()}
				id={listboxId}
				class="c-menu o-menu"
				aria-labelledby={id}
				ref={listboxEl}
			>
				<For each={props.options}>
					{(opt) => (
						<button
							type="button"
							id={`${listboxId}-${opt.value}`}
							role="option"
							aria-selected={opt.value === selected()}
							class="o-menu-item"
							onClick={() => choose(opt)}
						>
							{render()(opt)}
						</button>
					)}
				</For>
			</div>
		</>
	);
}
