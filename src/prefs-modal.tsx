import { For } from 'solid-js';

import {
	prefsChangeAnimation,
	prefsChangeColorScheme,
	prefsChangeFontFamily,
	prefsChangeFontSize,
	prefsMountAnimation,
	prefsMountColorScheme,
	prefsMountFontFamily,
	prefsMountFontSize,
} from '~/demos/callbacks/prefs';
import { Label } from '~/lib/components/label';
import { LabelledInput } from '~/lib/components/labelled-control';
import { ListBoxItem } from '~/lib/components/list-box';
import {
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalTitle,
} from '~/lib/components/modal';
import { Radio } from '~/lib/components/radio';
import { RadioGroup } from '~/lib/components/radio-group';
import { Select } from '~/lib/components/select';
import { Slider } from '~/lib/components/slider';
import { T } from '~/lib/components/t-components';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { useT } from '~/lib/utility/solid/locale-context';
import { getFontFamilies } from '~/lib/utility/ui-prefs/font-family';

export interface PrefsModalProps {
	id: string;
}

export function PrefsModal(props: PrefsModalProps) {
	const t = useT();

	return (
		<Modal id={props.id}>
			<ModalTitle>
				<T>Preferences</T>
			</ModalTitle>
			<ModalContent>
				<div class="o-stack">
					<p>
						These toggles set locally stored preferences that override
						system&nbsp;settings.
					</p>
					<LabelledInput label="Color scheme" description="Light / dark mode">
						<RadioGroup
							{...callbackAttrs(prefsMountColorScheme, prefsChangeColorScheme)}
						>
							<Label>
								<Radio value="system" /> <T>System preference</T>
							</Label>
							<Label>
								<Radio value="light" /> <T>Light mode</T>
							</Label>
							<Label>
								<Radio value="dark" /> <T>Dark mode</T>
							</Label>
						</RadioGroup>
					</LabelledInput>

					<LabelledInput label="Animations" description="Interface animations">
						<RadioGroup {...callbackAttrs(prefsMountAnimation, prefsChangeAnimation)}>
							<Label>
								<Radio value="system" /> <T>System preference</T>
							</Label>
							<Label>
								<Radio value="true" /> <T>Enabled</T>
							</Label>
							<Label>
								<Radio value="false" /> <T>Disabled</T>
							</Label>
						</RadioGroup>
					</LabelledInput>

					<LabelledInput
						label={t`Font Family`}
						description={t`Change the application font`}
					>
						<Select
							required
							{...callbackAttrs(prefsMountFontFamily, prefsChangeFontFamily)}
						>
							<For each={getFontFamilies()}>
								{({ name, value }) => (
									<ListBoxItem value={value} style={{ 'font-family': value }}>
										{name}
									</ListBoxItem>
								)}
							</For>
						</Select>
					</LabelledInput>

					<LabelledInput
						label={t`Font Size`}
						description={t`Adjust the application font size`}
					>
						<Slider
							unit="px"
							min={12}
							max={24}
							step={1}
							{...callbackAttrs(prefsMountFontSize, prefsChangeFontSize)}
						/>
					</LabelledInput>
				</div>
			</ModalContent>
			<ModalFooter>
				<ModalCloseButton />
			</ModalFooter>
		</Modal>
	);
}
