import cx from 'classix';
import { Loader2, type LucideProps } from 'lucide-solid';
import { type ComponentProps, createRenderEffect, onCleanup, splitProps, Suspense } from 'solid-js';
import { isServer } from 'solid-js/web';

import { T } from '~/shared/components/t-components';

export interface SpinnerProps extends LucideProps {}

export interface SpinnerBlockProps extends ComponentProps<'div'> {
	/** Callback for when the spinner block initially loads */
	onStart?: () => void;
	/** Callback for when the spinner block is removed */
	onEnd?: () => void;
}

/** Simple spinner icon */
export function Spinner(props: SpinnerProps) {
	const [local, rest] = splitProps(props, ['class']);
	return <Loader2 aria-hidden="true" {...rest} class={cx('t-spin', 'c-spinner', local.class)} />;
}

/** Spinner icon centered within a larger, expanding block */
export function SpinnerBlock(props: SpinnerBlockProps) {
	const [local, rest] = splitProps(props, ['onStart', 'onEnd']);
	createRenderEffect(() => {
		local.onStart?.();
	});
	onCleanup(() => {
		local.onEnd?.();
	});
	return (
		<div {...rest} class={cx('c-spinner__block', props.class)} role="status">
			<Spinner /> <T>Loading…</T>
		</div>
	);
}

/** SolidJS suspense wrapper */
export function SpinnerSuspense(props: SpinnerBlockProps) {
	const [local, rest] = splitProps(props, ['children']);
	return (
		<>
			{isServer ? (
				<>{local.children}</>
			) : (
				<Suspense fallback={<SpinnerBlock {...rest} />}>{local.children}</Suspense>
			)}
		</>
	);
}
