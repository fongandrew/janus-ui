import { Ban } from 'lucide-solid';
import { createUniqueId, type JSX, splitProps } from 'solid-js';
import { isServer } from 'solid-js/web';

import { imgError, imgMountError } from '~/shared/components/callbacks/img';
import { ImgPlaceholder } from '~/shared/components/placeholder';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { useT } from '~/shared/utility/solid/locale-context';

/**
 * Image with placeholder
 */
export function Img(
	props: JSX.ImgHTMLAttributes<HTMLImageElement> & { aspectRatio?: number | undefined },
) {
	const [local, rest] = splitProps(props, ['aspectRatio']);
	const errorId = createUniqueId();
	const t = useT();
	return (
		<ImgPlaceholder
			class="c-img"
			width={props.width}
			height={props.height}
			aspectRatio={
				local.aspectRatio ??
				(typeof props.width === 'number' && typeof props.height === 'number'
					? props.width / props.height
					: undefined)
			}
		>
			<img
				{...rest}
				{...callbackAttrs(rest, imgError(errorId), isServer && imgMountError(errorId))}
			/>
			<span id={errorId} class="c-img__error t-hidden" aria-label={t`Image failed to load`}>
				<span>
					<Ban aria-hidden="true" />
				</span>
			</span>
		</ImgPlaceholder>
	);
}
