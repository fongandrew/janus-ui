import { createSignal, createUniqueId } from 'solid-js';
import { isServer } from 'solid-js/web';

import { formChangeOutputWrite } from '~/demos/callbacks/form-output';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { Label } from '~/lib/components/label';
import { LabelledInput } from '~/lib/components/labelled-control';
import { Radio } from '~/lib/components/radio';
import { RadioGroup } from '~/lib/components/radio-group';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

function RadioGroupsDemo() {
	const [value, setValue] = createSignal('checked');
	const outputId = createUniqueId();

	return (
		<Card id="radio-groups-demo">
			<CardHeader>
				<CardTitle>Radio buttons</CardTitle>
				<CardDescription>Different radio states and variations</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<output id={outputId} class="v-text-weight-strong">
						Selected: {value()}
					</output>
					<RadioGroup
						name="demo1"
						value={value()}
						onValue={setValue}
						{...callbackAttrs(isServer && formChangeOutputWrite(outputId))}
					>
						<Label>
							<Radio value="first" /> First radio
						</Label>
						<Label>
							<Radio value="checked" /> Checked radio
						</Label>
						<Label>
							<Radio value="error" aria-invalid /> Error state radio
						</Label>
						<Label>
							<Radio value="disabled" disabled /> Disabled radio
						</Label>
						<Label>
							<Radio value="long" /> Long text:
							AAAAB3NzaC1yc2EAAAABJQAAAQB/nAmOjTmezNUDKYvEeIRf2YnwM9/uUG1d0BYsc8/tRtx+RGi7N2lUbp728MXGwdnL9od4cItzky/zVdLZE2cycOa18xBK9cOWmcKS0A8FYBxEQWJ/q9YVUgZbFKfYGaGQxsER+A0w/fX8ALuk78ktP31K69LcQgxIsl7rNzxsoOQKJ/CIxOGMMxczYTiEoLvQhapFQMs3FL96didKr/QbrfB1WT6s3838SEaXfgZvLef1YB2xmfhbT9OXFE3FXvh2UPBfN+ffE7iiayQf/2XR+8j4N4bW30DiPtOQLGUrH1y5X/rpNZNlWW2+jGIxqZtgWg7lTy3mXy5x836Sj/6L
						</Label>
					</RadioGroup>
					<LabelledInput label="Labelled radio group" description="Some description">
						<RadioGroup name="demo2">
							<Label>
								<Radio value="a" /> Radio Option A
							</Label>
							<Label>
								<Radio value="b" /> Radio Option B
							</Label>
						</RadioGroup>
					</LabelledInput>
				</div>
			</CardContent>
		</Card>
	);
}

export { RadioGroupsDemo };
