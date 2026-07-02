import { type JSX } from 'solid-js';

import { PageLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

/*
 * The static CSS component gallery (§20.4, PLAN 3.S): every component from
 * §10 rendered with CSS classes + native HTML only — no data-js, no
 * hydration, zero client JS. Modals open via commandfor; popovers via
 * popovertarget. Phase 9 upgrades this same page with real interactivity;
 * this static render remains the zero-JS reference output.
 */

function Demo(props: { id: string; title: string; children: JSX.Element }) {
	return (
		<section id={props.id} class="c-card o-box">
			<div class="o-stack">
				<header>
					<h2>{props.title}</h2>
				</header>
				{props.children}
			</div>
		</section>
	);
}

function GalleryPage() {
	return (
		<PageLayout current="components">
			<hgroup>
				<h1>Components</h1>
				<p>
					The <code>c-*</code> catalogue rendered from CSS classes and native HTML alone —
					this page ships zero JavaScript. Hover a button, focus an input, open the modal
					(via <code>commandfor</code>): the chrome is all CSS. Behavior wiring arrives
					with the DOM layer.
				</p>
			</hgroup>

			<div class="o-grid p-gallery" style={{ '--o-grid__min': '24rem' }}>
				<Demo id="buttons-demo" title="Buttons">
					<div class="o-row">
						<button type="button" class="c-button o-input-box">
							Default
						</button>
						<button type="button" class="c-button o-input-box v-colors-primary">
							Primary
						</button>
						<button type="button" class="c-button o-input-box v-colors-danger">
							Danger
						</button>
					</div>
					<div class="o-row">
						<button type="button" class="c-button o-input-box" disabled>
							Disabled
						</button>
						<button type="button" class="c-button o-input-box" aria-disabled="true">
							Aria-disabled
						</button>
						<button
							type="button"
							class="c-button c-button--icon o-input-box"
							aria-label="Add"
						>
							+
						</button>
						<button
							type="button"
							class="c-button c-button--icon t-radius-full o-input-box"
							aria-label="Menu"
						>
							☰
						</button>
					</div>
				</Demo>

				<Demo id="cards-demo" title="Cards & surfaces">
					<div class="c-card o-box">
						<div class="o-prose">
							<h3>A card</h3>
							<p>
								Card-tone surface, dynamic border, resting shadow. In-card rhythm
								defaults to the card's own padding.
							</p>
						</div>
					</div>
					<div class="o-grid" style={{ '--o-grid__min': '9rem' }}>
						<div class="o-box v-surface-card">card</div>
						<div class="o-box v-surface-elevated">elevated</div>
						<div class="o-box v-surface-sunken">sunken</div>
						<div class="o-box v-surface-glass">glass</div>
						<div class="o-box v-surface-gradient">gradient</div>
					</div>
				</Demo>

				<Demo id="alerts-demo" title="Alerts">
					<div class="o-stack">
						<div role="alert" class="c-alert">
							A neutral alert with the base palette.
						</div>
						<div role="alert" class="c-alert v-colors-success">
							Saved — everything is up to date.
						</div>
						<div role="alert" class="c-alert v-colors-warn">
							Careful — this bumps the whole weight stack for legibility.
						</div>
						<div role="alert" class="c-alert v-colors-danger">
							Something failed and needs attention.
						</div>
						<div role="alert" class="c-alert v-colors-info">
							For your information: tinted surfaces bump weights too.
						</div>
					</div>
				</Demo>

				<Demo id="inputs-demo" title="Inputs">
					<div class="o-stack" style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}>
						<label for="gal-input-1">Labelled input</label>
						<input
							id="gal-input-1"
							class="c-input o-input-box"
							placeholder="Placeholder"
						/>
						<p class="o-caption">A description at the field inset.</p>
					</div>
					<div class="o-stack" style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}>
						<label for="gal-input-2">Invalid</label>
						<input
							id="gal-input-2"
							class="c-input o-input-box"
							aria-invalid="true"
							value="not-an-email"
						/>
					</div>
					<div class="o-row">
						<input
							class="c-input o-input-box"
							value="With value"
							aria-label="With value"
						/>
						<input
							class="c-input o-input-box"
							disabled
							value="Disabled"
							aria-label="Disabled"
						/>
					</div>
				</Demo>

				<Demo id="textareas-demo" title="Textareas">
					<div class="o-stack" style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}>
						<label for="gal-textarea">Notes</label>
						<textarea
							id="gal-textarea"
							class="c-input o-input-box"
							placeholder="Multi-line…"
						/>
					</div>
				</Demo>

				<Demo id="checkboxes-demo" title="Checkboxes">
					<div class="o-row">
						<input type="checkbox" class="c-checkbox" aria-label="Unchecked" />
						<input type="checkbox" class="c-checkbox" checked aria-label="Checked" />
						<input type="checkbox" class="c-checkbox" disabled aria-label="Disabled" />
						<input
							type="checkbox"
							class="c-checkbox"
							disabled
							checked
							aria-label="Disabled checked"
						/>
					</div>
				</Demo>

				<Demo id="radios-demo" title="Radios">
					<div class="o-row">
						<label class="o-row">
							<input type="radio" name="gal-radio" class="c-radio" checked /> One
						</label>
						<label class="o-row">
							<input type="radio" name="gal-radio" class="c-radio" /> Two
						</label>
						<label class="o-row">
							<input type="radio" name="gal-radio" class="c-radio" disabled />{' '}
							Disabled
						</label>
					</div>
				</Demo>

				<Demo id="toggles-demo" title="Toggles">
					<div class="o-row">
						<input type="checkbox" role="switch" class="c-toggle" aria-label="Off" />
						<input
							type="checkbox"
							role="switch"
							class="c-toggle"
							checked
							aria-label="On"
						/>
						<input
							type="checkbox"
							role="switch"
							class="c-toggle"
							disabled
							aria-label="Disabled"
						/>
					</div>
				</Demo>

				<Demo id="selects-demo" title="Native select">
					<div class="o-stack" style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}>
						<label for="gal-select">Flavor</label>
						<select id="gal-select" class="c-select-native o-input-box">
							<option>Vanilla</option>
							<option selected>Pistachio</option>
							<option>Stracciatella</option>
						</select>
					</div>
				</Demo>

				<Demo id="tags-demo" title="Tags">
					<div class="o-row">
						<span class="c-tag o-caption">Default</span>
						<span class="c-tag o-caption v-colors-primary">Primary</span>
						<span class="c-tag o-caption v-colors-success">Success</span>
						<span class="c-tag o-caption">
							Removable
							<button type="button" class="c-tag__remove" aria-label="Remove">
								×
							</button>
						</span>
					</div>
				</Demo>

				<Demo id="badges-demo" title="Badges">
					<div class="o-row">
						<span class="c-badge o-caption">3</span>
						<span class="c-badge o-caption">128</span>
						<span class="c-badge o-caption v-colors-danger">9+</span>
						<span class="c-badge c-badge--dot" aria-label="Unread" />
					</div>
				</Demo>

				<Demo id="avatars-demo" title="Avatars">
					<div class="o-row">
						<span class="c-avatar o-square">AJ</span>
						<span class="c-avatar o-square" style={{ '--v-radius': '50%' }}>
							KO
						</span>
						<span class="c-avatar o-square" style={{ '--v-input-height': '3rem' }}>
							XL
						</span>
					</div>
				</Demo>

				<Demo id="spinners-demo" title="Spinners">
					<div class="o-row">
						<span class="c-spinner" aria-label="Loading" />
						<span
							class="c-spinner"
							style={{ 'font-size': '1.5rem' }}
							aria-label="Loading"
						/>
						<button type="button" class="c-button o-input-box" aria-disabled="true">
							<span class="c-spinner" aria-hidden="true" /> Saving…
						</button>
					</div>
				</Demo>

				<Demo id="skeletons-demo" title="Skeletons">
					<div class="o-row">
						<span
							class="c-skeleton c-skeleton--circle"
							style={{ 'inline-size': '2.5rem', 'block-size': '2.5rem' }}
						/>
						<div
							class="o-stack t-flex-fill"
							style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}
						>
							<span class="c-skeleton" style={{ 'inline-size': '80%' }} />
							<span class="c-skeleton" style={{ 'inline-size': '60%' }} />
						</div>
					</div>
				</Demo>

				<Demo id="disclosure-demo" title="Disclosure">
					<details class="c-disclosure">
						<summary>Closed by default</summary>
						<div class="c-disclosure__content o-prose">
							<p>Native details/summary with styled chrome and a rotating marker.</p>
						</div>
					</details>
					<details class="c-disclosure" open>
						<summary>Open by default</summary>
						<div class="c-disclosure__content o-prose">
							<p>The open state squares the summary's bottom corners.</p>
						</div>
					</details>
				</Demo>

				<Demo id="tables-demo" title="Tables">
					<table class="c-table" id="gal-table-default">
						<thead>
							<tr>
								<th>Name</th>
								<th>Role</th>
								<th>Notes</th>
							</tr>
						</thead>
						<tbody>
							<tr id="gal-table-row-single">
								<td>Amara</td>
								<td>Design</td>
								<td>Control height</td>
							</tr>
							<tr>
								<td>Bo</td>
								<td>Engineering</td>
								<td
									id="gal-table-cell-multi"
									style={{ 'max-inline-size': '12rem' }}
								>
									A multi-line cell simply grows the row past the control-height
									minimum without disturbing its neighbors.
								</td>
							</tr>
							<tr>
								<td>Chidi</td>
								<td>
									<input
										class="c-input o-input-box"
										value="Inline editable"
										aria-label="Role"
										id="gal-table-inline-input"
									/>
								</td>
								<td>Heights align</td>
							</tr>
						</tbody>
					</table>
					<p class="o-caption">Scoped dense override (rows drop; page controls don't):</p>
					<table
						class="c-table"
						id="gal-table-dense"
						style={{ '--c-table__row-height': '1.5rem' }}
					>
						<tbody>
							<tr id="gal-table-dense-row">
								<td>Dense row one</td>
								<td>1.5rem minimum</td>
							</tr>
							<tr>
								<td>Dense row two</td>
								<td>decoupled from --v-input-height</td>
							</tr>
						</tbody>
					</table>
				</Demo>

				<Demo id="tabs-demo" title="Tabs (static chrome)">
					<div class="c-tabs">
						<div role="tablist" aria-label="Sample tabs">
							<button type="button" role="tab" aria-selected="true">
								First
							</button>
							<button type="button" role="tab" aria-selected="false">
								Second
							</button>
							<button type="button" role="tab" aria-disabled="true">
								Disabled
							</button>
						</div>
						<div role="tabpanel">
							The selected indicator is an inset shadow mixed against the accent — it
							self-themes inside tonal subtrees, and neighbors don't shift.
						</div>
					</div>
				</Demo>

				<Demo id="modals-demo" title="Modals">
					<div class="o-row">
						<button
							type="button"
							class="c-button o-input-box"
							commandfor="gallery-modal"
							command="show-modal"
						>
							Open modal
						</button>
						<button
							type="button"
							class="c-button o-input-box"
							commandfor="gallery-modal-narrow"
							command="show-modal"
						>
							Open narrow modal
						</button>
					</div>
				</Demo>

				<Demo id="drawers-demo" title="Drawers">
					<div class="o-row">
						<button
							type="button"
							class="c-button o-input-box"
							commandfor="gallery-drawer-left"
							command="show-modal"
						>
							Left drawer
						</button>
						<button
							type="button"
							class="c-button o-input-box"
							commandfor="gallery-drawer-right"
							command="show-modal"
						>
							Right drawer
						</button>
					</div>
				</Demo>

				<Demo id="popovers-demo" title="Popover">
					<button
						type="button"
						class="c-button o-input-box"
						popovertarget="gallery-popover"
						style={{ 'anchor-name': '--popover-anchor' }}
					>
						Toggle popover
					</button>
					<div id="gallery-popover" popover class="c-popover">
						<div class="o-prose">
							<p>Anchor-positioned popover matching card chrome.</p>
						</div>
					</div>
				</Demo>

				<Demo id="tooltips-demo" title="Tooltip">
					<button
						type="button"
						class="c-button o-input-box"
						popovertarget="gallery-tooltip"
						style={{ 'anchor-name': '--tooltip-anchor' }}
					>
						Toggle tooltip
					</button>
					<div id="gallery-tooltip" popover="manual" class="c-tooltip o-caption">
						Inverted, caption-scale, anchored above (Chromium positions it; elsewhere it
						still renders).
					</div>
				</Demo>

				<Demo id="menus-demo" title="Menu (static chrome)">
					<button
						type="button"
						class="c-button o-input-box"
						popovertarget="gallery-menu"
						style={{ 'anchor-name': '--menu-anchor' }}
					>
						Open menu
					</button>
					<div id="gallery-menu" popover class="c-menu o-menu" role="menu">
						<button type="button" class="o-menu-item" role="menuitem">
							Rename…
						</button>
						<button type="button" class="o-menu-item" role="menuitem">
							Duplicate
						</button>
						<hr />
						<button type="button" class="o-menu-item" role="menuitem">
							Delete
						</button>
					</div>
				</Demo>

				<Demo id="styled-selects-demo" title="Styled select (static chrome)">
					<div class="c-styled-select">
						<button type="button" class="c-button o-input-box c-styled-select__button">
							Pistachio
						</button>
						<div
							class="c-styled-select__listbox o-menu"
							role="listbox"
							style={{ position: 'static' }}
						>
							<button
								type="button"
								class="o-menu-item"
								role="option"
								aria-selected="false"
							>
								🍦 Vanilla
							</button>
							<button
								type="button"
								class="o-menu-item"
								role="option"
								aria-selected="true"
							>
								🟢 Pistachio
							</button>
							<button
								type="button"
								class="o-menu-item"
								role="option"
								aria-selected="false"
							>
								🍫 Stracciatella
							</button>
						</div>
					</div>
				</Demo>
			</div>

			{/* Overlay elements live outside the grid so their frames are clean */}
			<dialog id="gallery-modal" class="c-modal o-dialog">
				<button
					type="button"
					class="c-button c-button--icon t-radius-full o-input-box c-modal__close"
					commandfor="gallery-modal"
					command="close"
					aria-label="Close"
				>
					×
				</button>
				<header class="c-modal__header">
					<h2>
						<span class="c-modal__mark" aria-hidden="true">
							◆
						</span>
						A scroll-away header
					</h2>
				</header>
				<div class="c-modal__body">
					<div class="o-prose">
						<p>
							The dialog frame is the transparent scroll container; this header rounds
							the top corners and scrolls away — only the X stays pinned. Scroll to
							see the edge shadows.
						</p>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere
							erat a ante venenatis dapibus posuere velit aliquet. Cras mattis
							consectetur purus sit amet fermentum. Sed posuere consectetur est at
							lobortis.
						</p>
						<p>
							Vestibulum id ligula porta felis euismod semper. Maecenas faucibus
							mollis interdum. Donec ullamcorper nulla non metus auctor fringilla.
							Nullam quis risus eget urna mollis ornare vel eu leo.
						</p>
						<p>
							Aenean lacinia bibendum nulla sed consectetur. Duis mollis, est non
							commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec
							elit.
						</p>
						<p>
							Curabitur blandit tempus porttitor. Nulla vitae elit libero, a pharetra
							augue. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
						</p>
					</div>
					<footer class="c-modal__footer">
						<button
							type="button"
							class="c-button o-input-box"
							commandfor="gallery-modal"
							command="close"
						>
							Cancel
						</button>
						<button type="button" class="c-button o-input-box v-colors-primary">
							Confirm
						</button>
					</footer>
				</div>
			</dialog>

			<dialog id="gallery-modal-narrow" class="c-modal c-modal--narrow o-dialog">
				<button
					type="button"
					class="c-button c-button--icon t-radius-full o-input-box c-modal__close"
					commandfor="gallery-modal-narrow"
					command="close"
					aria-label="Close"
				>
					×
				</button>
				<header class="c-modal__header">
					<h2>Narrow preset</h2>
				</header>
				<div class="c-modal__body">
					<div class="o-prose">
						<p>--c-modal__width: 22rem — the mobile-ish preset.</p>
					</div>
				</div>
			</dialog>

			<dialog id="gallery-drawer-left" class="c-drawer c-drawer--left o-dialog">
				<div class="o-stack">
					<h2>Left drawer</h2>
					<button
						type="button"
						class="c-button o-input-box"
						commandfor="gallery-drawer-left"
						command="close"
					>
						Close
					</button>
				</div>
			</dialog>

			<dialog id="gallery-drawer-right" class="c-drawer c-drawer--right o-dialog">
				<div class="o-stack">
					<h2>Right drawer</h2>
					<button
						type="button"
						class="c-button o-input-box"
						commandfor="gallery-drawer-right"
						command="close"
					>
						Close
					</button>
				</div>
			</dialog>
		</PageLayout>
	);
}

export function render() {
	return renderStatic(() => <GalleryPage />);
}
