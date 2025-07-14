import sky34 from '@/sky-3x4.jpg';
import sky43 from '@/sky-4x3.jpg';
import { imgReload } from '~/demos/callbacks/img';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { Img } from '~/lib/components/img';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

export function ImgDemo() {
	return (
		<Card id="img-demo">
			<CardHeader>
				<CardTitle>Images</CardTitle>
				<CardDescription>Images with placeholders</CardDescription>
			</CardHeader>
			<CardContent class="o-stack">
				<p class="v-text-weight-label">Click to reload</p>
				<div class="o-group">
					<Img aspectRatio={3 / 4} src={sky34} {...callbackAttrs(imgReload)} />
					<Img aspectRatio={4 / 3} src={sky43} {...callbackAttrs(imgReload)} />
				</div>
				<p class="v-text-weight-label">Intentionally broken image</p>
				<Img width={400} height={300} src="" />
			</CardContent>
		</Card>
	);
}
