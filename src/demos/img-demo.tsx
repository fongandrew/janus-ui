import sky34 from '@/sky-3x4.jpg';
import sky43 from '@/sky-4x3.jpg';
import { imgReload } from '~/demos/callbacks/img';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Img } from '~/shared/components/img';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export function ImgDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Images</CardTitle>
				<CardDescription>Images with placeholders</CardDescription>
			</CardHeader>
			<CardContent class="o-text-stack">
				<p class="t-text-weight-label">Click to reload</p>
				<div class="o-group">
					<Img aspectRatio={3 / 4} src={sky34} {...callbackAttrs(imgReload)} />
					<Img aspectRatio={4 / 3} src={sky43} {...callbackAttrs(imgReload)} />
				</div>
				<p class="t-text-weight-label">Intentionally broken image</p>
				<Img width={400} height={300} src="" />
			</CardContent>
		</Card>
	);
}
