import { type JSX } from 'solid-js';

import { Layout } from '../layout';
import { renderPage } from '../render';

/**
 * Components (§20.4) — the static CSS component gallery. Renders every component
 * from §10.1 in its major states plus variant demonstrations, using only CSS
 * classes and native HTML (commandfor / popovertarget for zero-JS interaction).
 * Phase 9 upgrades this into the full interactive Components page.
 */

function DemoCard(props: { id: string; title: string; children: JSX.Element }) {
	return (
		<section class="c-card o-box p-gallery-card" id={props.id}>
			<header>
				<h2>{props.title}</h2>
			</header>
			<div class="o-stack">{props.children}</div>
		</section>
	);
}

function Components() {
	return (
		<Layout section="components" title="Components">
			<div class="o-prose p-doc-section">
				<p>
					Every component rendered with only CSS classes and native HTML — no framework, no{' '}
					<code>data-js</code>. Modals open via <code>commandfor</code>, popovers via{' '}
					<code>popovertarget</code>.
				</p>
			</div>

			<div class="o-grid" style={{ '--o-grid__min': '20rem' }}>
				<DemoCard id="buttons-demo" title="Buttons">
					<div class="o-row">
						<button class="c-button o-input-box" type="button">
							Default
						</button>
						<button class="c-button o-input-box v-colors-primary" type="button" data-testid="btn-primary">
							Primary
						</button>
						<button class="c-button o-input-box v-colors-danger" type="button" data-testid="btn-danger">
							Danger
						</button>
						<button class="c-button o-input-box" type="button" disabled>
							Disabled
						</button>
						<button
							class="c-button c-button--icon o-input-box"
							type="button"
							aria-label="Icon"
							data-testid="btn-icon"
						>
							★
						</button>
					</div>
				</DemoCard>

				<DemoCard id="cards-demo" title="Cards / surfaces">
					<div class="o-grid" style={{ '--o-grid__min': '8rem' }}>
						<div class="o-box v-surface-card">card</div>
						<div class="o-box v-surface-elevated" data-testid="surface-elevated">elevated</div>
						<div class="o-box v-surface-sunken">sunken</div>
						<div class="o-box v-surface-glass">glass</div>
						<div class="o-box v-surface-gradient">gradient</div>
					</div>
				</DemoCard>

				<DemoCard id="alerts-demo" title="Alerts">
					<div class="c-alert v-colors-info">Info alert</div>
					<div class="c-alert v-colors-success" data-testid="alert-success">Success alert</div>
					<div class="c-alert v-colors-warn">Warning alert</div>
					<div class="c-alert v-colors-danger">Danger alert</div>
				</DemoCard>

				<DemoCard id="inputs-demo" title="Inputs">
					<input class="c-input o-input-box" type="text" placeholder="Default" data-testid="input-default" />
					<input class="c-input o-input-box" type="email" value="not-an-email" aria-invalid="true" data-testid="input-invalid" />
					<input class="c-input o-input-box" type="text" value="Disabled" disabled />
					<textarea class="c-input o-input-box" placeholder="Textarea" />
				</DemoCard>

				<DemoCard id="checkboxes-demo" title="Checkboxes / radios">
					<label class="o-row">
						<input class="c-checkbox" type="checkbox" data-testid="checkbox-unchecked" /> Unchecked
					</label>
					<label class="o-row">
						<input class="c-checkbox" type="checkbox" checked data-testid="checkbox-checked" /> Checked
					</label>
					<label class="o-row">
						<input class="c-radio" type="radio" name="demo-r" /> Radio one
					</label>
					<label class="o-row">
						<input class="c-radio" type="radio" name="demo-r" checked /> Radio two
					</label>
				</DemoCard>

				<DemoCard id="toggles-demo" title="Toggles">
					<label class="o-row">
						<input class="c-toggle" type="checkbox" role="switch" data-testid="toggle-off" /> Off
					</label>
					<label class="o-row">
						<input class="c-toggle" type="checkbox" role="switch" checked data-testid="toggle-on" /> On
					</label>
				</DemoCard>

				<DemoCard id="selects-demo" title="Native select">
					<select class="c-select-native o-input-box">
						<option>Option one</option>
						<option>Option two</option>
					</select>
				</DemoCard>

				<DemoCard id="tags-demo" title="Tags / badges">
					<div class="o-row">
						<span class="c-tag o-caption">Tag</span>
						<span class="c-tag o-caption v-colors-primary">Primary</span>
						<span class="c-badge o-caption">3</span>
						<span class="c-badge c-badge--dot" />
					</div>
				</DemoCard>

				<DemoCard id="avatars-demo" title="Avatars / spinner / skeleton">
					<div class="o-row">
						<span class="c-avatar o-square">AB</span>
						<span class="c-spinner o-square" role="status" aria-label="Loading" />
						<span class="c-skeleton" style={{ 'inline-size': '6rem' }} />
					</div>
				</DemoCard>

				<DemoCard id="disclosure-demo" title="Disclosure">
					<details class="c-disclosure">
						<summary>Show more</summary>
						<p>Hidden content revealed on toggle.</p>
					</details>
				</DemoCard>

				<DemoCard id="tables-demo" title="Table">
					<table class="c-table" data-testid="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Role</th>
							</tr>
						</thead>
						<tbody>
							<tr data-testid="table-row">
								<td>Single line</td>
								<td>Cell</td>
							</tr>
							<tr>
								<td>Multi-line cell that wraps across two lines to grow the row past the minimum height</td>
								<td>Cell</td>
							</tr>
						</tbody>
					</table>
				</DemoCard>

				<DemoCard id="tabs-demo" title="Tabs (static)">
					<div class="c-tabs">
						<div class="c-tabs__list" role="tablist">
							<button class="c-tab" role="tab" aria-selected="true">
								Tab one
							</button>
							<button class="c-tab" role="tab" aria-selected="false">
								Tab two
							</button>
						</div>
						<div class="c-tab-panel" role="tabpanel">
							Panel one content.
						</div>
					</div>
				</DemoCard>

				<DemoCard id="tooltips-demo" title="Tooltip (@chromium-only positioning)">
					<button
						class="c-button o-input-box"
						type="button"
						popovertarget="demo-tooltip"
						id="tip-anchor"
						style={{ 'anchor-name': '--tip-anchor' }}
						data-testid="tooltip-trigger"
					>
						Toggle tooltip
					</button>
					<div
						id="demo-tooltip"
						popover
						class="c-tooltip o-caption v-colors-tooltip"
						style={{ 'position-anchor': '--tip-anchor' }}
						data-testid="tooltip"
					>
						A tooltip anchored to its trigger.
					</div>
				</DemoCard>

				<DemoCard id="popovers-demo" title="Popover">
					<button class="c-button o-input-box" type="button" popovertarget="demo-popover" data-testid="popover-trigger">
						Open popover
					</button>
					<div id="demo-popover" popover class="c-popover" data-testid="popover">
						<p>Popover content.</p>
					</div>
				</DemoCard>

				<DemoCard id="modals-demo" title="Modal (commandfor)">
					<button
						class="c-button o-input-box v-colors-primary"
						type="button"
						command="show-modal"
						commandfor="demo-modal"
						data-testid="modal-trigger"
					>
						Open modal
					</button>
					<dialog id="demo-modal" class="c-modal o-dialog" data-testid="modal">
						<div class="c-modal__header">
							<button class="c-button c-button--icon o-input-box c-modal__close" type="button" command="close" commandfor="demo-modal" aria-label="Close">
								✕
							</button>
							<h2>Modal title</h2>
						</div>
						<div class="c-modal__body o-prose">
							<p>Modal body content.</p>
						</div>
					</dialog>
				</DemoCard>
			</div>
		</Layout>
	);
}

export function render() {
	return renderPage(() => <Components />);
}
