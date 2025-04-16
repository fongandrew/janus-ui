import cx from 'classix';
import { AlertTriangle } from 'lucide-solid';
import {
	createUniqueId,
	ErrorBoundary,
	type JSX,
	onMount,
	sharedConfig,
	splitProps,
} from 'solid-js';
import { isServer } from 'solid-js/web';

import { Button } from '~/shared/components/button';
import { reloadPage } from '~/shared/components/callbacks/error-fallback';
import { CodeBlock } from '~/shared/components/code-block';
import { T } from '~/shared/components/t-components';
import { attrs } from '~/shared/utility/attribute-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { getErrorCode } from '~/shared/utility/error-code';
import { useLogger } from '~/shared/utility/solid/use-logger';
import { useWindow } from '~/shared/utility/solid/window-context';

export type ErrorFallbackProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'onError'> & {
	/** Stretch variant makes error boundary fill container with no padding */
	stretch?: boolean | undefined;
	/** Callback on error, includes both error and some unique IDs for logging */
	onError?: ((err: Error & { code: string }, eventId: string) => void) | undefined;
	/** Optional callback to run when user clicks the reload button */
	onReload?: (() => void) | undefined;
};

/** Can replace this with hard-coded string for actual prod purposes */
let supportLink: string | null = null;
export function setSupportLink(link: string) {
	supportLink = link;
}

/**
 * Error boundary component that displays a fallback UI when errors occur
 *
 * @example
 * ```tsx
 * 	<ErrorFallback>
 * 		<YourComponent />
 * 	</ErrorFallback>
 * ```
 */
export function ErrorFallback(props: ErrorFallbackProps) {
	const logger = useLogger();
	const window = useWindow();
	const [local, rest] = splitProps(props, ['onError', 'onReload', 'class', 'stretch']);

	/**
	 * This is to track whether to reload the page. The first time we see an error, we show
	 * the fallback. But if same error persists on a section reload, let's try reloading the
	 * entire page.
	 */
	let prevError = false;

	// Solid resets the context in error boundaries but we want to reuse it so
	// `createUniqueId` doesn't reset. We'll store the context here and restore it
	// in the fallback.
	const solidContext = isServer ? sharedConfig?.context : null;

	const handleError = (err: Error & { code: string }, eventId: string) => {
		if (prevError) {
			window?.location.reload();
		}
		prevError = true;
		if (props.onError) {
			props.onError(err, eventId);
			return;
		}
		logger.error(err);
	};

	const handleReload = (reset: () => void) => {
		props.onReload?.();
		reset();
	};

	return (
		<ErrorBoundary
			fallback={(err, reset) => {
				// Restore shared config so `createUniqueId` keeps working
				if (isServer && sharedConfig && solidContext) {
					sharedConfig.context = solidContext;
				}

				// Error code is just a hashed version of error message. It's intended
				// to aggregate multiple user reports of a given error. Event ID is unique
				// to this error and can be used to look up specific logs.
				const code = getErrorCode(err);
				const eventId = crypto.randomUUID();

				// Maybe log error + code (and if we're immediately rethrowing
				// the same error after a partial reload, reload the entire page)
				handleError(Object.assign(err, { code }), eventId);

				const headingId = createUniqueId();
				const descriptionId = createUniqueId();

				return (
					<div
						class={cx(
							'c-error-fallback',
							props.stretch && 'c-error-fallback--stretch',
							local.class,
						)}
					>
						<section
							{...rest}
							aria-labelledby={attrs(rest['aria-labelledby'], headingId)}
							aria-describedby={attrs(rest['aria-describedby'], descriptionId)}
						>
							<h3 id={headingId} role="alert" class="c-error-fallback__heading">
								<AlertTriangle aria-hidden="true" />
								<span>
									<T>Something went wrong</T>
								</span>
							</h3>
							<p id={descriptionId}>
								<T>
									Reloading the page might fix this issue. If the problem
									persists, please contact support and include the details below.
								</T>
							</p>
							<CodeBlock>
								Error code: {code}
								{'\n'}
								Event ID: {eventId}
								{'\n'}
								User agent: {isServer ? 'Server' : navigator.userAgent}
							</CodeBlock>
							<div class="c-error-fallback__actions">
								{supportLink && (
									<a href={supportLink}>
										<T>Contact support</T>
									</a>
								)}
								<Button
									onClick={[handleReload, reset]}
									{...callbackAttrs(isServer && reloadPage)}
								>
									<T>Reload</T>
								</Button>
							</div>
						</section>
					</div>
				);
			}}
		>
			{props.children}
			{(() => {
				// If mount successfully calls before error fallback runs again,
				// that means children rendered successfully
				onMount(() => {
					prevError = false;
				});
				return null;
			})()}
		</ErrorBoundary>
	);
}
