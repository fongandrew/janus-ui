import {
	type Accessor,
	type Component,
	createEffect,
	createSignal,
	For,
	type JSX,
	Suspense,
} from 'solid-js';

const incr = (n: number) => n + 1;

function SuspenseEffect(props: { onEffect: () => void }) {
	createEffect(() => props.onEffect());
	return null;
}

/**
 * A variation of Solid's <For> component that wraps each component in a <Suspense> block
 * and delays rendering subsequent items until the previous one has resolved.
 */
export function SuspenseFor<T>(props: {
	/** List of items to render */
	each: T[];
	/** Renderer for each item */
	children: (item: T, index: Accessor<number>) => JSX.Element;
	/** Artificial delay between each item */
	delay?: number;
	/** Custom suspense component with fallback */
	suspenseComponent?: Component<{ fallback?: JSX.Element; children: JSX.Element }>;
	/** Fallback for suspense -- can be function that takes item */
	fallback?: JSX.Element | ((item: T) => JSX.Element);
}) {
	const [count, setCount] = createSignal(1);
	const incrEffect = () => setCount(incr);
	const delayedIncrEffect = () => setTimeout(incrEffect, props.delay ?? 0);
	return (
		<For each={props.each.slice(0, count())}>
			{(item, index) => {
				const SuspenseComponent = props.suspenseComponent || Suspense;
				const fallback =
					typeof props.fallback === 'function'
						? props.fallback(item)
						: (props.fallback ?? null);
				return (
					<SuspenseComponent fallback={fallback}>
						{props.children(item, index)}
						<SuspenseEffect onEffect={delayedIncrEffect} />
					</SuspenseComponent>
				);
			}}
		</For>
	);
}
