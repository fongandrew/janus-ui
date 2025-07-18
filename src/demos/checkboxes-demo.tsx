import { createUniqueId } from 'solid-js';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { Checkbox } from '~/lib/components/checkbox';
import { Label } from '~/lib/components/label';
import { ToggleSwitch } from '~/lib/components/toggle-switch';

export function CheckboxesDemo() {
	const detachedLabelId = createUniqueId();

	return (
		<Card id="checkboxes-demo">
			<CardHeader>
				<CardTitle>Checkboxes</CardTitle>
				<CardDescription>Different checkbox states and variations</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<Label>
						<Checkbox name="default" data-testid="default-checkbox" />
						Default checkbox
					</Label>
					<Label>
						<Checkbox name="checked" checked data-testid="checked-checkbox" />
						Checked checkbox
					</Label>
					<Label>
						<Checkbox
							name="indeterminate"
							indeterminate
							data-testid="indeterminate-checkbox"
						/>
						Indeterminate checkbox
					</Label>
					<Label>
						<Checkbox name="invalid" aria-invalid data-testid="invalid-checkbox" />
						Error state checkbox
					</Label>
					<Label>
						<Checkbox name="disabled" disabled data-testid="disabled-checkbox" />
						Disabled checkbox
					</Label>
					<Label>
						<Checkbox name="long" data-testid="long-checkbox" /> Long text:
						AAAAB3NzaC1yc2EAAAABJQAAAQB/nAmOjTmezNUDKYvEeIRf2YnwM9/uUG1d0BYsc8/tRtx+RGi7N2lUbp728MXGwdnL9od4cItzky/zVdLZE2cycOa18xBK9cOWmcKS0A8FYBxEQWJ/q9YVUgZbFKfYGaGQxsER+A0w/fX8ALuk78ktP31K69LcQgxIsl7rNzxsoOQKJ/CIxOGMMxczYTiEoLvQhapFQMs3FL96didKr/QbrfB1WT6s3838SEaXfgZvLef1YB2xmfhbT9OXFE3FXvh2UPBfN+ffE7iiayQf/2XR+8j4N4bW30DiPtOQLGUrH1y5X/rpNZNlWW2+jGIxqZtgWg7lTy3mXy5x836Sj/6L
					</Label>
					<div class="o-group">
						<Checkbox
							id={detachedLabelId}
							name="detached"
							data-testid="detached-checkbox"
						/>
						<Label for={detachedLabelId}>Checkbox with detached label</Label>
					</div>
					<Label>
						Toggle switch <ToggleSwitch name="toggle" data-testid="toggle-switch" />
					</Label>
				</div>
			</CardContent>
		</Card>
	);
}
