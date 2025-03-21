import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Checkbox } from '~/shared/components/checkbox';
import { Label } from '~/shared/components/label';
import { ToggleSwitch } from '~/shared/components/toggle-switch';

export function CheckboxesDemo() {
	return (
		<Card id="checkboxes-demo">
			<CardHeader>
				<CardTitle>Checkboxes</CardTitle>
				<CardDescription>Different checkbox states and variations</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<Label>
						<Checkbox name="default" /> Default checkbox
					</Label>
					<Label>
						<Checkbox name="checked" checked /> Checked checkbox
					</Label>
					<Label>
						<Checkbox name="indetermine" indeterminate /> Indeterminate checkbox
					</Label>
					<Label>
						<Checkbox name="invalid" aria-invalid /> Error state checkbox
					</Label>
					<Label>
						<Checkbox name="disabled" disabled /> Disabled checkbox
					</Label>
					<Label>
						<Checkbox name="long" /> Long text:
						AAAAB3NzaC1yc2EAAAABJQAAAQB/nAmOjTmezNUDKYvEeIRf2YnwM9/uUG1d0BYsc8/tRtx+RGi7N2lUbp728MXGwdnL9od4cItzky/zVdLZE2cycOa18xBK9cOWmcKS0A8FYBxEQWJ/q9YVUgZbFKfYGaGQxsER+A0w/fX8ALuk78ktP31K69LcQgxIsl7rNzxsoOQKJ/CIxOGMMxczYTiEoLvQhapFQMs3FL96didKr/QbrfB1WT6s3838SEaXfgZvLef1YB2xmfhbT9OXFE3FXvh2UPBfN+ffE7iiayQf/2XR+8j4N4bW30DiPtOQLGUrH1y5X/rpNZNlWW2+jGIxqZtgWg7lTy3mXy5x836Sj/6L
					</Label>
					<Label>
						Toggle switch <ToggleSwitch name="toggle" />
					</Label>
				</div>
			</CardContent>
		</Card>
	);
}
