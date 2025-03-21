import {
	prefsChangeAnimation,
	prefsChangeColorScheme,
	prefsMountAnimation,
	prefsMountColorScheme,
} from '~/demos/callbacks/prefs';
import { Label } from '~/shared/components/label';
import { LabelledInput } from '~/shared/components/labelled-control';
import {
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalTitle,
} from '~/shared/components/modal';
import { Radio } from '~/shared/components/radio';
import { RadioGroup } from '~/shared/components/radio-group';
import { T } from '~/shared/components/t-components';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export interface PrefsModalProps {
	id: string;
}

export function PrefsModal(props: PrefsModalProps) {
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
								<Radio value="system" /> System preference
							</Label>
							<Label>
								<Radio value="light" /> Light mode
							</Label>
							<Label>
								<Radio value="dark" /> Dark mode
							</Label>
						</RadioGroup>
					</LabelledInput>

					<LabelledInput label="Animations" description="Interface animations">
						<RadioGroup {...callbackAttrs(prefsMountAnimation, prefsChangeAnimation)}>
							<Label>
								<Radio value="system" /> System preference
							</Label>
							<Label>
								<Radio value="true" /> Enabled
							</Label>
							<Label>
								<Radio value="false" /> Disabled
							</Label>
						</RadioGroup>
					</LabelledInput>
				</div>
			</ModalContent>
			<ModalFooter>
				<ModalCloseButton />
			</ModalFooter>
		</Modal>
	);
}
