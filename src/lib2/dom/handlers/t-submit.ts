/**
 * t-submit (§12.1) — form-engine behavior marker. The logic lives in the form
 * engine (`~/lib2/dom/form`), which reads this `data-js` token directly from
 * its own dispatcher. Importing this module ensures the engine is bundled when
 * the token appears in SSR output (filename-as-manifest, §12.2.2 / §12.4).
 */
import '~/lib2/dom/form';
