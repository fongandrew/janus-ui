import { Button } from '~/lib/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/card';
import { Tooltip } from '~/lib/components/tooltip';

function TooltipsDemo() {
	return (
		<Card id="tooltips-demo">
			<CardHeader>
				<CardTitle>Tooltips</CardTitle>
				<CardDescription>Tooltips on hover</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-grid v-spacing-sm">
					<Tooltip tip="Hello, I'm the top tooltip" placement="top">
						<Button>Top</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm the bottom tooltip" placement="bottom">
						<Button>Bottom</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm the left tooltip" placement="left">
						<Button>Left</Button>
					</Tooltip>
					<Tooltip tip="Hello, I'm the right tooltip" placement="right">
						<Button>Right</Button>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
}

export { TooltipsDemo };
