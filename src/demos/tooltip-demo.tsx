import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Tooltip } from '~/shared/components/tooltip';

function TooltipDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tooltips</CardTitle>
				<CardDescription>Tooltips on hover</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-grid v-spacing-sm">
					<Tooltip tip="Hello, I'm a tooltip" placement="top">
						{(props) => <Button {...props}>Top</Button>}
					</Tooltip>
					<Tooltip tip="Hello, I'm a tooltip" placement="bottom">
						{(props) => <Button {...props}>Bottom</Button>}
					</Tooltip>
					<Tooltip tip="Hello, I'm a tooltip" placement="left">
						{(props) => <Button {...props}>Left</Button>}
					</Tooltip>
					<Tooltip tip="Hello, I'm a tooltip" placement="right">
						{(props) => <Button {...props}>Right</Button>}
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
}

export { TooltipDemo };
