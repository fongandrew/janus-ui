/**
 * Pattern A entry (§12.4) — side-effect-import every handler module so the
 * dispatcher routes all behaviors. Right for static sites, demos, and prototypes
 * where a bundler isn't pruning to the SSR-referenced subset.
 *
 * ```html
 * <script type="module">
 *   import '~/lib2/dom/all';
 *   import { mount } from '~/lib2/dom';
 *   mount();
 * </script>
 * ```
 */
import '~/lib2/dom/handlers/t-roving-focus';
import '~/lib2/dom/handlers/t-request-close';
import '~/lib2/dom/handlers/t-restore-focus';
import '~/lib2/dom/handlers/t-focus-trap';
import '~/lib2/dom/handlers/t-typeahead-filter';
import '~/lib2/dom/handlers/t-active-descendant';
import '~/lib2/dom/handlers/t-open-tab';
import '~/lib2/dom/handlers/t-kb-nav';
import '~/lib2/dom/handlers/t-empty';
import '~/lib2/dom/handlers/t-scroll-shadow';
import '~/lib2/dom/handlers/t-validate';
import '~/lib2/dom/handlers/t-submit';
import '~/lib2/dom/handlers/t-validate-group';
import '~/lib2/dom/handlers/t-validate-error';
import '~/lib2/dom/handlers/t-reset-on-close';
import '~/lib2/dom/handlers/t-close-on-success';
import '~/lib2/dom/handlers/c-tabs__select';
import '~/lib2/dom/handlers/c-modal__close';
import '~/lib2/dom/handlers/c-modal__speed-bump';
