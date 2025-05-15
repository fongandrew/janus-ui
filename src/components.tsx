import { Box, Globe, Settings } from 'lucide-solid';
import { isServer } from 'solid-js/web';

import { App, PREFS_MODAL_ID } from '~/app';
import { AlertsDemo } from '~/demos/alerts-demo';
import { BadgeAndCountDemo } from '~/demos/badge-and-count-demo';
import { ButtonLinksDemo } from '~/demos/button-links-demo';
import { ButtonsDemo } from '~/demos/buttons-demo';
import { sidebarHighlight } from '~/demos/callbacks/sidebar';
import { CheckboxesDemo } from '~/demos/checkboxes-demo';
import { DetailsDemo } from '~/demos/details-demo';
import { EmptyStateDemo } from '~/demos/empty-state-demo';
import { ErrorFallbackDemo } from '~/demos/error-fallback-demo';
import { FormSubmitDemo } from '~/demos/form-submit-demo';
import { FormValidationGroupDemo } from '~/demos/form-validation-group-demo';
import { ImgDemo } from '~/demos/img-demo';
import { InputsDemo } from '~/demos/inputs-demo';
import { IntlDemo } from '~/demos/intl-demo';
import { LabelledActionsDemo } from '~/demos/labelled-actions-demo';
import { ListBoxesDemo } from '~/demos/list-boxes-demo';
import { MenusDemo } from '~/demos/menus-demo';
import { ModalDemo } from '~/demos/modal-demo';
import { PlaceholdersDemo } from '~/demos/placeholders-demo';
import { RadioGroupsDemo } from '~/demos/radio-groups-demo';
import { SelectTypeaheadsDemo } from '~/demos/select-typeaheads-demo';
import { SelectionValidationDemo } from '~/demos/selection-validation-demo';
import { SelectsDemo } from '~/demos/selects-demo';
import { SuspenseDemo } from '~/demos/suspense-demo';
import { TabsDemo } from '~/demos/tabs-demo';
import { TextareasDemo } from '~/demos/textareas-demo';
import { TooltipsDemo } from '~/demos/tooltips-demo';
import { ModalOpenTrigger } from '~/shared/components/modal';
import {
	Sidebar,
	SidebarCloseButton,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarLayout,
	SidebarLayoutContent,
	SidebarList,
	SidebarListButton,
	SidebarListGroup,
	SidebarListLink,
	SidebarOpenButton,
} from '~/shared/components/sidebar-layout';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

interface ComponentsProps {
	title: string;
	current?: string;
}

export function Components(props: ComponentsProps) {
	return (
		<SidebarLayout>
			<Sidebar>
				<SidebarHeader>
					<h2>Components</h2>
					<SidebarCloseButton />
				</SidebarHeader>
				<SidebarContent>
					<SidebarList {...callbackAttrs(sidebarHighlight)}>
						<SidebarListLink href="#buttons-demo">
							<Box />
							Buttons
						</SidebarListLink>
						<SidebarListLink href="#button-links-demo">
							<Box />
							Button links
						</SidebarListLink>
						<SidebarListLink href="#alerts-demo">
							<Box />
							Alerts
						</SidebarListLink>
						<SidebarListLink href="#badge-and-count-demo">
							<Box />
							Badge and count
						</SidebarListLink>
						<SidebarListLink href="#checkboxes-demo">
							<Box />
							Checkboxes
						</SidebarListLink>
						<SidebarListLink href="#details-demo">
							<Box />
							Details
						</SidebarListLink>
						<SidebarListLink href="#empty-state-demo">
							<Box />
							Empty state
						</SidebarListLink>
						<SidebarListLink href="#error-fallback-demo">
							<Box />
							Error fallback
						</SidebarListLink>
						<SidebarListLink href="#form-submit-demo">
							<Box />
							Form submit
						</SidebarListLink>
						<SidebarListLink href="#form-validation-group-demo">
							<Box />
							Form validation group
						</SidebarListLink>
						<SidebarListLink href="#img-demo">
							<Box />
							Images
						</SidebarListLink>
						<SidebarListLink href="#inputs-demo">
							<Box />
							Inputs
						</SidebarListLink>
						<SidebarListLink href="#intl-demo">
							<Box />
							Internationalization & text formatting
						</SidebarListLink>
						<SidebarListLink href="#labelled-actions-demo">
							<Box />
							Labelled actions
						</SidebarListLink>
						<SidebarListLink href="#list-boxes-demo">
							<Box />
							List boxes
						</SidebarListLink>
						<SidebarListLink href="#menus-demo">
							<Box />
							Menus
						</SidebarListLink>
						<SidebarListLink href="#modal-demo">
							<Box />
							Modal
						</SidebarListLink>
						<SidebarListLink href="#placeholders-demo">
							<Box />
							Placeholders
						</SidebarListLink>
						<SidebarListLink href="#radio-groups-demo">
							<Box />
							Radio groups
						</SidebarListLink>
						<SidebarListLink href="#select-typeaheads-demo">
							<Box />
							Select typeaheads
						</SidebarListLink>
						<SidebarListLink href="#selection-validation-demo">
							<Box />
							Selection validation
						</SidebarListLink>
						<SidebarListLink href="#selects-demo">
							<Box />
							Selects
						</SidebarListLink>
						{!isServer && (
							<SidebarListLink href="#suspense-demo">
								<Box />
								Suspense
							</SidebarListLink>
						)}
						<SidebarListLink href="#tabs-demo">
							<Box />
							Tabs
						</SidebarListLink>
						<SidebarListLink href="#textareas-demo">
							<Box />
							Textareas
						</SidebarListLink>
						<SidebarListLink href="#tooltips-demo">
							<Box />
							Tooltips
						</SidebarListLink>
						<SidebarListGroup heading="Other stuff">
							<SidebarListLink href="https://github.com/fongandrew/solid-base">
								<Globe />
								GitHub
							</SidebarListLink>
							<ModalOpenTrigger targetId={PREFS_MODAL_ID}>
								<SidebarListButton>
									<Settings />
									Preferences
								</SidebarListButton>
							</ModalOpenTrigger>
						</SidebarListGroup>
					</SidebarList>
				</SidebarContent>
				<SidebarFooter>
					<p>Sidebar Footer</p>
				</SidebarFooter>
			</Sidebar>
			<SidebarLayoutContent>
				<App
					heading={
						<>
							<SidebarOpenButton />
							<h1>{props.title}</h1>
						</>
					}
					current={props.current}
				>
					<main class="o-box o-grid">
						{/* Alphabetically-ish but buttons first becase it's wide */}
						<ButtonsDemo />
						<ButtonLinksDemo />
						<AlertsDemo />
						<BadgeAndCountDemo />
						<CheckboxesDemo />
						<DetailsDemo />
						<EmptyStateDemo />
						<ErrorFallbackDemo />
						<FormSubmitDemo />
						<FormValidationGroupDemo />
						<ImgDemo />
						<InputsDemo />
						<IntlDemo />
						<LabelledActionsDemo />
						<ListBoxesDemo />
						<MenusDemo />
						<ModalDemo />
						<PlaceholdersDemo />
						<RadioGroupsDemo />
						<SelectionValidationDemo />
						<SelectsDemo />
						<SelectTypeaheadsDemo />
						{!isServer && <SuspenseDemo />}
						<TabsDemo />
						<TextareasDemo />
						<TooltipsDemo />
					</main>
				</App>
			</SidebarLayoutContent>
		</SidebarLayout>
	);
}
