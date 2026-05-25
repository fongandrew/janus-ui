import { type JSX } from 'solid-js';

import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '~/lib/solid';

export function HomePage(): JSX.Element {
	return (
		<div class="o-stack">
			<header class="o-stack">
				<h1>Janus UI v2</h1>
				<p>
					A framework-agnostic design system built on CSS layers, DOM behaviors, and
					Solid component wrappers.
				</p>
			</header>

			<div class="o-grid" style={{ '--o-grid__min': '280px' }}>
				<Card surface="card">
					<CardHeader>
						<CardTitle>CSS Foundation</CardTitle>
						<CardDescription>
							Tokens, objects, components, variants, and tools in layered CSS.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="o-group">
							<Button variant="primary">Primary</Button>
							<Button variant="danger">Danger</Button>
							<Button>Default</Button>
						</div>
					</CardContent>
				</Card>

				<Card surface="card">
					<CardHeader>
						<CardTitle>DOM Behaviors</CardTitle>
						<CardDescription>
							Framework-agnostic JS via data-js dispatch. Forms, tabs, modals, menus.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="o-stack">
							<Input type="email" placeholder="you@example.com" />
							<Alert variant="info">Behaviors attach via data-js attributes</Alert>
						</div>
					</CardContent>
				</Card>

				<Card surface="card">
					<CardHeader>
						<CardTitle>Solid Wrappers</CardTitle>
						<CardDescription>
							Thin Solid components mapping props to CSS classes and ARIA attributes.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p>
							Every component from the CSS layer gets a typed Solid wrapper with
							correct ARIA semantics built in.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
