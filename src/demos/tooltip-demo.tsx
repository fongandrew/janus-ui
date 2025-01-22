import { type Component } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Grid } from '~/shared/components/grid';
import { Tooltip } from '~/shared/components/tooltip';

const TooltipDemo: Component = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tooltips</CardTitle>
				<CardDescription>Tooltips on hover</CardDescription>
			</CardHeader>
			<CardContent>
				<Grid class="gap-sm">
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
				</Grid>
			</CardContent>
		</Card>
	);
};

export { TooltipDemo };
