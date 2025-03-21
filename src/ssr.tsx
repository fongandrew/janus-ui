import { Info, Settings, SquareCode } from 'lucide-solid';
import { NoHydration, renderToString } from 'solid-js/web';

import { App } from '~/app';
import { AlertsDemo } from '~/demos/alerts-demo';
import { BadgeAndCountDemo } from '~/demos/badge-and-count-demo';
import { ButtonLinksDemo } from '~/demos/button-links-demo';
import { ButtonsDemo } from '~/demos/buttons-demo';
import { CheckboxesDemo } from '~/demos/checkboxes-demo';
import { DetailsDemo } from '~/demos/details-demo';
import { ErrorFallbackDemo } from '~/demos/error-fallback-demo';
import { FormSubmitDemo } from '~/demos/form-submit-demo';
import { FormValidationGroupDemo } from '~/demos/form-validation-group-demo';
import { ImgDemo } from '~/demos/img-demo';
import { InputsDemo } from '~/demos/inputs-demo';
import { IntlDemo } from '~/demos/intl-demo';
import { LabelledActionDemo } from '~/demos/labelled-action-demo';
import { ListBoxesDemo } from '~/demos/list-boxes-demo';
import { MenusDemo } from '~/demos/menus-demo';
import { ModalDemo } from '~/demos/modal-demo';
import { PlaceholdersDemo } from '~/demos/placeholders-demo';
import { RadioGroupsDemo } from '~/demos/radio-groups-demo';
import { SelectTypeaheadsDemo } from '~/demos/select-typeaheads-demo';
import { SelectionValidationDemo } from '~/demos/selection-validation-demo';
import { SelectsDemo } from '~/demos/selects-demo';
import { TabsDemo } from '~/demos/tabs-demo';
import { TextareasDemo } from '~/demos/textareas-demo';
import { TooltipsDemo } from '~/demos/tooltips-demo';
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

function Main() {
	return (
		<SidebarLayout>
			<Sidebar>
				<SidebarHeader>
					<h2>Components</h2>
					<SidebarCloseButton />
				</SidebarHeader>
				<SidebarContent>
					<SidebarList>
						<SidebarListLink href="#buttons-demo">
							<SquareCode />
							Buttons
						</SidebarListLink>
						<SidebarListLink href="#button-links-demo">
							<SquareCode />
							Button Links
						</SidebarListLink>
						<SidebarListLink href="#alerts-demo">
							<SquareCode />
							Alerts
						</SidebarListLink>
						<SidebarListLink href="#badge-and-count-demo">
							<SquareCode />
							Badge and Count
						</SidebarListLink>
						<SidebarListLink href="#checkboxes-demo">
							<SquareCode />
							Checkboxes
						</SidebarListLink>
						<SidebarListLink href="#details-demo">
							<SquareCode />
							Details
						</SidebarListLink>
						<SidebarListLink href="#error-fallback-demo">
							<SquareCode />
							Error fallback
						</SidebarListLink>
						<SidebarListLink href="#form-submit-demo">
							<SquareCode />
							Form submit
						</SidebarListLink>
						<SidebarListLink href="#form-validation-group-demo">
							<SquareCode />
							Form validation group
						</SidebarListLink>
						<SidebarListLink href="#img-demo">
							<SquareCode />
							Image
						</SidebarListLink>
						<SidebarListLink href="#inputs-demo">
							<SquareCode />
							Inputs
						</SidebarListLink>
						<SidebarListLink href="#intl-demo">
							<SquareCode />
							Internationalization & text formatting
						</SidebarListLink>
						<SidebarListLink href="#labelled-action-demo">
							<SquareCode />
							Labelled actions
						</SidebarListLink>
						<SidebarListLink href="#list-boxes-demo">
							<SquareCode />
							List boxes
						</SidebarListLink>
						<SidebarListLink href="#menus-demo">
							<SquareCode />
							Menus
						</SidebarListLink>
						<SidebarListLink href="#modal-demo">
							<SquareCode />
							Modal
						</SidebarListLink>
						<SidebarListLink href="#placeholders-demo">
							<SquareCode />
							Placeholders
						</SidebarListLink>
						<SidebarListLink href="#radio-groups-demo">
							<SquareCode />
							Radio groups
						</SidebarListLink>
						<SidebarListLink href="#select-typeaheads-demo">
							<SquareCode />
							Select typeaheads
						</SidebarListLink>
						<SidebarListLink href="#selection-validation-demo">
							<SquareCode />
							Selection validation
						</SidebarListLink>
						<SidebarListLink href="#selects-demo">
							<SquareCode />
							Selects
						</SidebarListLink>
						<SidebarListLink href="#tabs-demo">
							<SquareCode />
							Tabs
						</SidebarListLink>
						<SidebarListLink href="#textareas-demo">
							<SquareCode />
							Textareas
						</SidebarListLink>
						<SidebarListLink href="#tooltips-demo">
							<SquareCode />
							Tooltips
						</SidebarListLink>
						<SidebarListGroup heading="Sidebar Group Test">
							<SidebarListLink href="#">
								<Info />
								This is a link
							</SidebarListLink>
							<SidebarListButton>
								<Settings />
								This is a button
							</SidebarListButton>
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
							<h1>Server Side Rendering</h1>
						</>
					}
					current="/ssr"
				>
					<main class="o-box o-grid">
						{/* Alphabetically-ish but buttons first becase it's wide */}
						<ButtonsDemo />
						<ButtonLinksDemo />
						<AlertsDemo />
						<BadgeAndCountDemo />
						<CheckboxesDemo />
						<DetailsDemo />
						<ErrorFallbackDemo />
						<FormSubmitDemo />
						<FormValidationGroupDemo />
						<ImgDemo />
						<InputsDemo />
						<IntlDemo />
						<LabelledActionDemo />
						<ListBoxesDemo />
						<MenusDemo />
						<ModalDemo />
						<PlaceholdersDemo />
						<RadioGroupsDemo />
						<SelectionValidationDemo />
						<SelectTypeaheadsDemo />
						<SelectsDemo />
						<TabsDemo />
						<TextareasDemo />
						<TooltipsDemo />
					</main>
				</App>
			</SidebarLayoutContent>
		</SidebarLayout>
	);
}

export function render() {
	return renderToString(() => (
		<NoHydration>
			<Main />
		</NoHydration>
	));
}
