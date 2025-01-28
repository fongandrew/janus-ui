import '~/shared/style/tailwind.css';

import { type Component } from 'solid-js';
import { render } from 'solid-js/web';

import { AlertsDemo } from '~/demos/alerts-demo';
import { AsyncFormDemo } from '~/demos/async-form-demo';
import { ButtonsDemo } from '~/demos/buttons-demo';
import { CheckboxesDemo } from '~/demos/checkboxes-demo';
import { DetailsDemo } from '~/demos/details-demo';
import { FooterDemo } from '~/demos/footer-demo';
import { FormValidationGroupDemo } from '~/demos/form-validation-group-demo';
import { InputsDemo } from '~/demos/inputs-demo';
import { LabelledActionDemo } from '~/demos/labelled-action-demo';
import { ListBoxDemo } from '~/demos/list-box-demo';
import { MenuDemo } from '~/demos/menu-demo';
import { ModalDemo } from '~/demos/modal-demo';
import { RadioGroupDemo } from '~/demos/radio-group-demo';
import { SelectDemo } from '~/demos/select-demo';
import { SelectTypeaheadDemo } from '~/demos/select-typeahead-demo';
import { SelectionValidationDemo } from '~/demos/selection-validation-demo';
import { TabsDemo } from '~/demos/tabs-demo';
import { TabsPersistDemo } from '~/demos/tabs-persist-demo';
import { TextareasDemo } from '~/demos/textareas-demo';
import { TooltipDemo } from '~/demos/tooltip-demo';
import { Box } from '~/shared/components/box';
import { Grid } from '~/shared/components/grid';

const App: Component = () => {
	return (
		<Box>
			<Grid>
				<ButtonsDemo />
				<AlertsDemo />
				<DetailsDemo />
				<MenuDemo />
				<CheckboxesDemo />
				<RadioGroupDemo />
				<TooltipDemo />
				<InputsDemo />
				<LabelledActionDemo />
				<TextareasDemo />
				<ListBoxDemo />
				<SelectDemo />
				<SelectTypeaheadDemo />
				<ModalDemo />
				<AsyncFormDemo />
				<FormValidationGroupDemo />
				<SelectionValidationDemo />
				<FooterDemo />
				<TabsDemo />
				<TabsPersistDemo />
			</Grid>
		</Box>
	);
};

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
	);
}

render(() => <App />, root!);
