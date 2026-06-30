/*
	DOM behaviors page (PLAN Phase 5.T) — the progressive-enhancement demo and
	E2E target for `src/lib2/dom`. Raw markup carrying `data-js` tokens; the
	page's own <script type="module"> (`dom-behaviors-entry.ts`) imports
	`~/lib2/dom/all` and calls `mount()`. No Solid, no `data-js`-authoring
	helpers beyond what a vanilla-JS consumer would write by hand. Not a
	top-nav item (three is the ceiling, §19) -- reachable directly, like the
	Phase 9 SPA page.
*/
import { renderPage } from '~/v2-site/layout';

export function render(): string {
	return renderPage({
		main: `
		<div class="o-container o-stack">
			<header class="o-prose">
				<h1>DOM behaviors</h1>
				<p>
					Every control below is plain markup carrying <code>data-js</code> tokens --
					no framework, no JSX. <code>dom-behaviors-entry.ts</code> imports
					<code>~/lib2/dom/all</code> (every handler) and calls <code>mount()</code>.
					This page is also the E2E target for <code>src/lib2/dom</code>.
				</p>
			</header>

			<section class="c-card o-box o-stack" id="tabs-demo">
				<h2>Tabs</h2>
				<p>Arrow keys move focus and selection; Home/End jump to the edges.</p>
				<div
					class="c-tabs__list"
					role="tablist"
					data-js="t-roving-focus c-tabs__select"
					data-roving-axis="horizontal"
					data-roving-home-end="true"
				>
					<button type="button" class="c-tab" role="tab" id="tab-1" aria-controls="panel-1" aria-selected="true">First</button>
					<button type="button" class="c-tab" role="tab" id="tab-2" aria-controls="panel-2" aria-selected="false">Second</button>
					<button type="button" class="c-tab" role="tab" id="tab-3" aria-controls="panel-3" aria-selected="false">Third</button>
				</div>
				<div class="c-tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">First panel content.</div>
				<div class="c-tab__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>Second panel content.</div>
				<div class="c-tab__panel" role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>Third panel content.</div>
			</section>

			<section class="c-card o-box o-stack" id="menu-demo">
				<h2>Menu</h2>
				<p>Opens via the Popover API; arrow keys navigate, typing jumps to a match, ESC closes.</p>
				<button type="button" class="c-button" popovertarget="dom-demo-menu">Open menu</button>
				<div
					id="dom-demo-menu"
					class="c-menu o-menu"
					popover="auto"
					role="menu"
					style="max-inline-size: 16rem"
					data-js="t-roving-focus t-typeahead-filter t-request-close"
					data-roving-axis="vertical"
					data-roving-home-end="true"
				>
					<button type="button" class="o-menu-item" role="menuitem">Profile</button>
					<button type="button" class="o-menu-item" role="menuitem">Settings</button>
					<button type="button" class="o-menu-item" role="menuitem">Sign out</button>
				</div>
			</section>

			<section class="c-card o-box o-stack" id="modal-demo">
				<h2>Modal + form</h2>
				<p>
					Opens with <code>commandfor</code>/<code>command</code> (zero JS); ESC and
					backdrop click are intercepted by <code>t-request-close</code>; validation and
					submit choreography come from the form engine.
				</p>
				<button type="button" class="c-button" commandfor="dom-demo-modal" command="show-modal">
					Open modal
				</button>
				<dialog id="dom-demo-modal" class="c-modal o-dialog" data-js="t-request-close t-restore-focus">
					<div class="c-modal__header">
						<strong>Sign up</strong>
						<button
							type="button"
							class="c-button c-button--icon c-modal__close"
							commandfor="dom-demo-modal"
							command="close"
							aria-label="Close"
						>
							&times;
						</button>
					</div>
					<div class="c-modal__body">
						<form
							id="dom-demo-form"
							class="o-stack"
							data-js="t-validate t-submit t-reset-on-close t-close-on-success"
							data-submit-handler="dom-demo-signup"
							novalidate
						>
							<div class="o-stack o-stack--tight">
								<label for="dom-demo-email">Email</label>
								<input
									id="dom-demo-email"
									name="email"
									type="email"
									class="c-input o-input-box"
									required
									aria-describedby="dom-demo-email-err"
								/>
								<span id="dom-demo-email-err" class="c-error-message" data-js="t-validate-error"></span>
							</div>
							<div data-js="t-validate-error" data-form-error class="c-alert v-colors-danger" role="alert" aria-atomic="true"></div>
							<div class="c-modal__footer">
								<button type="button" class="c-button" commandfor="dom-demo-modal" command="close">Cancel</button>
								<button type="submit" class="c-button v-colors-primary">Sign up</button>
							</div>
						</form>
					</div>
				</dialog>
			</section>
		</div>`,
	});
}
