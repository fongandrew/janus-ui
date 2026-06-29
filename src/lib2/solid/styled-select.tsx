/**
 * `StyledSelect` (§13.7) — the one composite component. A button trigger that opens
 * a `[popover]` listbox wired for roving focus, active-descendant, and typeahead. A
 * hidden native `<select>` mirrors the value so the control participates in forms.
 */
import cx from 'classix';
import { createSignal, createUniqueId, For, type JSX, splitProps } from 'solid-js';

export interface StyledSelectOption<T extends string = string> {
	value: T;
	label: string;
	render?: () => JSX.Element;
}

export interface StyledSelectProps<T extends string = string> {
	name?: string;
	options: StyledSelectOption<T>[];
	value?: T;
	placeholder?: string;
	disabled?: boolean;
	onChange?: (value: T) => void;
	class?: string;
	id?: string;
}

export function StyledSelect<T extends string = string>(props: StyledSelectProps<T>) {
	const [local] = splitProps(props, [
		'name',
		'options',
		'value',
		'placeholder',
		'disabled',
		'onChange',
		'class',
		'id',
	]);
	const listId = createUniqueId();
	/* eslint-disable-next-line solid/reactivity -- id is resolved once; a stable id anchors the popover + listbox */
	const triggerId = props.id ?? createUniqueId();
	// eslint-disable-next-line solid/reactivity -- initial uncontrolled value; `local.value` (controlled) takes precedence in `selected()`
	const [value, setValue] = createSignal<T | undefined>(local.value);

	const selected = () => local.options.find((o) => o.value === (local.value ?? value()));
	const commit = (v: T) => {
		setValue(() => v);
		local.onChange?.(v);
	};

	return (
		<>
			<button
				type="button"
				id={triggerId}
				popovertarget={listId}
				aria-haspopup="listbox"
				aria-disabled={local.disabled || undefined}
				class={cx('c-styled-select', local.class)}
			>
				<span class="c-styled-select__value">
					{selected() ? (selected()!.render?.() ?? selected()!.label) : local.placeholder}
				</span>
				<span class="c-styled-select__chevron" aria-hidden="true">
					›
				</span>
			</button>
			<div
				id={listId}
				popover="auto"
				role="listbox"
				data-js="t-roving-focus t-active-descendant t-typeahead-filter"
				aria-orientation="vertical"
				class="c-menu o-menu"
				style={{ 'position-anchor': `--${triggerId}` } as Record<string, string>}
			>
				<For each={local.options}>
					{(opt) => (
						<button
							type="button"
							role="option"
							aria-selected={selected()?.value === opt.value ? 'true' : 'false'}
							class="o-menu-item"
							onClick={() => commit(opt.value)}
						>
							{opt.render?.() ?? opt.label}
						</button>
					)}
				</For>
			</div>
			<select
				name={local.name}
				value={local.value ?? value() ?? ''}
				hidden
				tabindex={-1}
				aria-hidden="true"
			>
				<For each={local.options}>{(o) => <option value={o.value}>{o.label}</option>}</For>
			</select>
		</>
	);
}
