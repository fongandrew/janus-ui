import { AlertTriangle, Home, Info, Settings } from 'lucide-solid';
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
					<h2>Sidebar Header</h2>
					<SidebarCloseButton />
				</SidebarHeader>
				<SidebarContent>
					<SidebarList>
						<SidebarListLink href="#" aria-current="page">
							<Home />
							Pretend this is selected
						</SidebarListLink>
						<SidebarListLink href="#">
							<Info />
							Here is another link
						</SidebarListLink>
						<SidebarListGroup heading="Group Name">
							<SidebarListLink href="#">
								<AlertTriangle />
								Some other stuff and this label is quite long for whatever reason
							</SidebarListLink>
							<SidebarListLink href="#">
								<Info />
								Here is another link
							</SidebarListLink>
							<SidebarListButton>
								<Settings />
								Button goes here
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
						<ButtonsDemo />
						<BadgeAndCountDemo />
						<ButtonLinksDemo />
						<AlertsDemo />
						<DetailsDemo />
						<MenusDemo />
						<CheckboxesDemo />
						<RadioGroupsDemo />
						<TooltipsDemo />
						<InputsDemo />
						<LabelledActionDemo />
						<TextareasDemo />
						<ListBoxesDemo />
						<SelectsDemo />
						<SelectTypeaheadsDemo />
						<ModalDemo />
						<FormSubmitDemo />
						<FormValidationGroupDemo />
						<SelectionValidationDemo />
						<IntlDemo />
						<TabsDemo />
						<ImgDemo />
						<PlaceholdersDemo />
						<ErrorFallbackDemo />
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
