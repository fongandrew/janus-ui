import cx from 'classix';
import { CopyCheckIcon, CopyIcon } from 'lucide-solid';
import { type ComponentProps, createUniqueId } from 'solid-js';

import { codeBlockCopy } from '~/lib/components/callbacks/code-block';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';

/**
 * A code block with a copy button
 */
export function CodeBlock(props: ComponentProps<'div'>) {
	const detailId = createUniqueId();
	const beforeId = createUniqueId();
	const afterId = createUniqueId();
	return (
		<div {...props} class={cx('c-code-block', props.class)}>
			<pre id={detailId}>{props.children}</pre>
			<button
				class="c-code-block__copy"
				{...callbackAttrs(codeBlockCopy(detailId, beforeId, afterId))}
			>
				<span id={beforeId}>
					<CopyIcon /> <span class="c-code-block__copy-label">Copy</span>
				</span>
				<span id={afterId} class="t-hidden">
					<CopyCheckIcon /> <span class="c-code-block__copy-label">Copied</span>
				</span>
			</button>
		</div>
	);
}
