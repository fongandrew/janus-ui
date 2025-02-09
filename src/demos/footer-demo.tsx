import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';

export function FooterDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Card with a footer</CardTitle>
				<CardDescription>A card to show footer + grid in action</CardDescription>
			</CardHeader>
			<CardContent>
				<p>The grid will adjust columns based on screen size.</p>
			</CardContent>
			<CardFooter>
				<Button>Skip</Button>
				<Button class="v-primary-colors">Continue</Button>
			</CardFooter>
		</Card>
	);
}
