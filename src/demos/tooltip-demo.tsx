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
					<Tooltip tip="Hello, I'm a toolip" placement="top">
						<Button>Top</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm a toolip" placement="bottom">
						<Button>Bottom</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm a toolip" placement="left">
						<Button>Left</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm a toolip" placement="right">
						<Button>Right</Button>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
}

export { TooltipDemo };
