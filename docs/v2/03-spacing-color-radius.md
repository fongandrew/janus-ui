# Janus v2 — Spacing, Color, and Radius

Part 3 of the [Janus v2 design spec](./README.md). Covers the three knob systems that drive most of Janus's visual rhythm.

## 6. Spacing & padding primitives

Five root knobs cover the whole rhythm: `--v-spacing` (the scale lever) plus the four it derives — `--v-pad-block`, `--v-pad-inline`, `--v-gap-block`, `--v-gap-inline` (see §5.1).

Three padding modes, each implemented as `--o-*__pad-*` defaults set in the owning object's own rule (per §5.2). They re-resolve at each matched element using inherited `--v-pad-*` inputs.

| Padding mode | Block (top/bottom) | Inline (left/right) | Used by |
|---|---|---|---|
| **Block-mode** (default) | `var(--v-pad-block)` | `var(--v-pad-inline)` | `o-box` — boxes whose children are other components / rows |
| **Text-mode** (opt-in) | `var(--v-pad-block)` | alignment-dependent — see §6.1 | `o-text-box`, `o-input-box`, and text-bearing components (`c-tag`, `c-badge`, `c-alert` — see §10.1) |
| **Square** (opt-in) | `0` (aspect-driven) | `0` | `o-square` for icon / avatar / 1:1 content |

**Block padding is uniform, because of `text-box-trim`.** v1 subtracted the line-height overhang `(1lh − 1em)/2` from text-mode block padding so the optical space above and below the text matched the inline padding. v2 drops that fudge. Every text element renders with `text-box-trim: trim-both` (the `text-box` property — see §15), so its box edges sit at the cap height and alphabetic baseline. A plain `var(--v-pad-block)` then yields correct optical padding *regardless of font-size or line-height* — an `h1` and a `p` in the same box both look right, and no wrapper needs to know its content's type metrics. This is a deliberate bet on a not-yet-Firefox feature (§15); the degradation is slightly loose leading on the first/last line in Firefox, which we judge acceptable versus carrying per-element compensation math everywhere.

**Where to trim — the perimeter rule.** Trimming is not "apply to every text element"; it's a property of where text meets a *non-text edge*:

- **`trim-both`** — a single text element (or a *padded* text box: `<pre>`, a `blockquote` callout, a table cell) meeting a box edge / its own padding. This is what makes the perimeter padding read optically uniform. The generous padding of these boxes also absorbs the cap/descender overshoot that trimming pushes outside the content box, so `overflow: clip/auto` on a `<pre>` doesn't clip the first/last line.
- **`trim-start` / `trim-end`** — only the *outer* edges of a group that should read as continuous text (an `<hgroup>`, a continuous list). The boundaries *between* members are left **untrimmed** so their natural half-leading carries the rhythm — see §6.2.
- A text element with **no padding of its own** that lives *inside* a continuous group is trimmed only by the group's perimeter rules, never element-by-element.

So trim follows *edges and group boundaries*, not element types. (Inline text — links, `<code>`, `<span>` — is never trimmed; trimming an inline box plus `overflow` clipping cuts descenders. §15.)

Layout gaps:

- **Stack gap** — `o-stack` exposes `--o-stack__gap`, defaulting to `var(--v-gap-block)`.
- **Inline gap** — `o-group` / `o-row` expose `--o-group__gap` / `--o-row__gap`, defaulting to `var(--v-gap-inline)`.

### 6.1 Inline alignment: text insets to meet the box

Boxes and controls **anchor the container's inline edge** — their border-box sits on the gutter, full-width. What needs reconciling is the **accompanying text** that introduces them: a field's label and description above a control, or running prose flowing beside cards. Plain text carries ~no self-padding, so left alone it either collides with a rounded corner or fails to line up with the text *inside* the boxes. The rule:

> **Accompanying text insets to line up with the box it introduces — the box doesn't move, the text does.**

Three reference points, in increasing inset (all positive padding, on **both** inline edges):

| Inset | Lands on the box's… | Value |
|---|---|---|
| **0** (`v-align-edge`) | outer edge / border | `0` |
| **straight edge** | where the corner curve ends — text sits over the flat side | the box's own corner radius |
| **inner text** (`v-align-text`) | the text *inside* the box | the box's text-pad |

**Where this applies — and why it's only two places.** Janus doesn't nest boxes: the structure is frame → box → control (§9.1), never box-in-box. So a run of text only ever sits *beside a box or control it should line up with* in two situations — there's no general depth cascade to chase:

| Situation | The text | Aligns to | Knob (default) |
|---|---|---|---|
| **Field** — anywhere | a `<label>` + description above a control | the control's straight edge | `--o-field__inset` → `var(--o-input-box__radius)` |
| **Prose in a container with boxes** | a container's direct prose children, beside its cards | the cards' inner text | `--o-prose__inset` → `var(--v-pad-inline)` (a dialog → `var(--o-box__radius)`) |

A **field** is a composition (an `o-stack` of `<label>` + `o-input-box` + description); its label/description align to the control, and this holds wherever the field lives — directly on a frame or inside a card. It defaults to the **straight edge** — the Janus v1 form look (subtle, since a control's radius floors near `--v-radius-min`).

**Prose insets when it's a direct child of a container that holds boxes** — there its running text wants to line up with the cards beside it. The *container* supplies the inset (`o-container:has(boxes) > o-prose`), defaulting to the **inner-text** level (`--v-pad-inline`) so the prose column shares the cards' text edge. A **dialog** does the same with a lighter default — just the **straight edge** (`--o-box__radius`), since a tight dialog doesn't want its prose pushed all the way in. The moment prose is *inside* a box there are no box-siblings to meet, so it takes the box's perimeter padding and sits flush — the inset never compounds with box padding, and only **direct** prose children inset.

**The inset wraps the corner.** When the inset prose is the container's **first or last** child, its block padding grows to match: `padding-block-start` on the first, `padding-block-end` on the last, each equal to `--o-prose__inset`. So a prose block at the top/bottom of a container is inset the same amount on the side it meets the container edge as on the inline edges — the corner reads uniform, like a box's. (A code block or blockquote that *was* inset breaks back out — below.)

Each situation has its own default above; either can be moved across the three reference points with a subtree class — `v-align-edge` (flush, `0`) or `v-align-text` (the inner-text line: `--v-control-inset` for a control, `--v-pad-inline` for a box; drop the borders and every left-edge agrees). **Only the text moves** — the control/box stays edge-anchored, so a strong border never pokes past the alignment line.

**Block boxes inside prose break out.** A code block or blockquote is itself a box, so it must *not* follow the text inset — it re-anchors to the box edge with a matching negative `margin-inline: calc(-1 * var(--o-prose__inset))`, lining up with the cards/boxes around the prose instead of with the inset paragraphs. This is the prose-side member of the **breakout family** (see negative-margin policy).

**At full-bleed, the inset drops to flush.** When a frame is narrow enough that its boxes go full-bleed (the breakout below — they escape the frame's gutter, square off, lose their radius/border/shadow), there's no margin or corner left to align to, so `--o-prose__inset` goes to `0`. Because the first/last-child block padding *tracks* the inset, it drops to `0` too — the text sits flush on the inline **and** block edges, no lone top/bottom gap. The prose text still lines up with the now-edge-to-edge boxes' inner text (the frame's own gutter does the offsetting), and the prose's own block boxes bleed out the same way the cards do. One container query on the **frame's** width drives all of it, so the same rule serves the page (narrow viewport) and a dialog (narrow dialog) — see §9.3 / §10.

Because each text element carries its own inset as positive padding keyed to a shared knob, **mixed content composes without the container knowing its contents**, and `--v-control-inset` / the radius knobs stay pure functions of shared knobs — no upward data flow.

*(Edge case, not a rule: at pill radii a control's `--v-control-inset` can exceed `--v-pad-inline`, so the inner-text inset can't fully hold. Normal radii never reach this.)*

**Negative-margin policy.** Positive, box-carried padding is the default alignment mechanism. Negative margins are reserved for the **breakout family** — an element escaping a known inline inset to re-anchor on an outer edge: the **full-bleed** container breakout (`margin-inline: calc(-1 * var(--o-container__gutter))`, §9.3) and the **prose block-box** breakout above. Both negate a known inset and have no positive-padding equivalent. Everywhere else the rule is "wrap it in a box and let the box pad," which keeps every element inside its own bounds — safe under `overflow: clip` rounded corners, and easy to reason about.

### 6.2 Block spacing comes from flow, not box padding

A box's block padding handles only its **perimeter** — first/last child to the box's top/bottom edge (uniform, per the `text-box-trim` note above). It does **not** carry the rhythm *between* siblings. Interior vertical rhythm comes from **flow**, and the rule for what that rhythm *is* follows.

**Every vertical gap is owned by the element underneath.** It's always a `margin-block-start` on the *lower* element, and its value depends on what sits **above** it — "the thing below owns the gap above it." For prose inside an `o-text-box` (or the `o-prose` flow object, §9.5), the boundaries resolve as:

- **body ↔ body, and heading → whatever follows → the *prose* gap.** A bare heading does **not** hug its body; the element below simply keeps its ordinary prose gap. (The one place a heading sits tight to text is the `<hgroup>` exception below.)
- **whatever → a heading → the heading's *space-above*** — the section break, the one bit of rhythm a heading owns (above itself, not below).

`:where()` selectors keep these flat-specificity so source order resolves overlaps; the lower element always carries the margin, so mixed content composes without the container knowing its contents.

**The prose gap is a multiple of the *line*, not of `--v-spacing`.** Paragraph rhythm rides `line-height` (e.g. a fraction of `1lh`, or `prose-multiplier · line-height · 1em`) so it stays proportional as the type scale moves — distinct from the spacing-derived box/gap knobs. The separation is the point: **box rhythm scales with `--v-spacing`; text rhythm scales with the line.** (Lists are running text: inter-item spacing is a fraction of the prose gap when "grouped", or `line-height − 1cap` when "continuous" so wrapped items share one baseline — a cascading `--v-list-rhythm` switches between them per context, e.g. marketing vs. a WYSIWYG editor.)

**Title + subtitle live in an `<hgroup>` with their own rhythm.** This is the one place text reads as a tight unit, and the trickiest, because the two lines are different sizes. Two things make it hold up under wrapping:

- **Additive leading.** Inside the group, `line-height = 1em + a constant`, so the line-height scales with the font but the whitespace *between* lines stays constant — the big title's lines and the small subtitle's lines get the same visual leading. (Same shape as the heading leading in §5.1, `1em + 0.5·spacing`. *Additive* leading, not multiplicative, is what holds inter-line space constant across sizes.)
- **Trim only the group's outer edges.** With `text-box-trim` left *off* between the title and subtitle, their natural half-leadings sum to exactly the same whitespace as the gaps *within* each element, so the boundary reads like an internal line break — no margin needed, and the gap blends both sizes (§6, perimeter rule).

This matches how developers write markup — wrap a *group* and drop several elements in. So the contract is **"wrap a group, flow the children":** the box owns the perimeter; the lower element owns each interior gap; an `<hgroup>` owns a title/subtitle unit.

### 6.3 The spacing bundle includes border-width (but not radius)

Janus's internal `v-spacing` mixin (§5.3 — an authoring tool, not a consumer API) bundles `--v-border-width` alongside the four pad/gap derivatives, because denser layouts want thinner borders, not just smaller padding. A consumer setting the bundle by hand sets `--v-border-width` in the same block:

```css
@define-mixin v-spacing $size, $border-width: 1px {
  --v-spacing:      $size;
  --v-pad-block:    $size;
  --v-pad-inline:   $size;
  --v-gap-block:    $size;
  --v-gap-inline:   calc($size * 0.5);
  --v-border-width: $border-width;
}
```

**The mixin does not touch the radius anchors.** Changing `--v-spacing` leaves the radius *anchors* — `--v-radius` (the frame max) and `--v-radius-min` (the floor) — alone, so a density change doesn't alter how round the window is or how square the floor gets. The intermediate radii *do* step by `--v-pad-inline` (the radius cascade, §8.2), so a spacing change shifts them to keep nested corners concentric — that's the intended relationship, not a side effect. To change the radius look itself, set the two anchors (§8.4) or an `--o-*__radius` knob directly.

### 6.4 Hi-DPI density bump

A 2.5rem control on a desktop reads fine; on a phone, fingers want at least 2.75rem. The foundation layer ships a resolution-based density branch. Because type is fluid (§5.4), the bump nudges the **anchors** (`--v-font-size-min` / `-max`), not a frozen size — the resolved `--v-font-size` clamp and every step recompute from them automatically:

```css
:root {
  --v-input-height:  2.5rem;
  --v-font-size-min: 1rem;
  --v-font-size-max: 1.125rem;
}
@media (resolution >= 200dpi) {
  :root {
    --v-input-height:  2.75rem;
    --v-font-size-min: 1.0625rem;
    --v-font-size-max: 1.1875rem;
    --v-spacing:       1rem;
  }
}
```

This is not a breakpoint — it's a pixel-density gate. A phone with a 200dpi screen gets larger targets and text regardless of viewport width. It composes with the fluid scale: the viewport-driven `clamp()` still interpolates; the gate just raises the floor and ceiling it interpolates between.

**No t-shirt size variants ship with Janus.** Consumers who want a tighter spacing for a specific context — a toolbar, a dense table, a nav bar — define their own semantic class via the supported customization paths (§5.3): variable overrides, a `v-` variant, or plain CSS — *not* a Janus mixin. Because `--v-pad-*` and `--v-gap-*` are frozen at root, set the bundle together:

```css
/* Consumer CSS — set the knob bundle directly. */
.v-dense { --v-spacing: 0.5rem; --v-pad-block: 0.5rem; --v-pad-inline: 0.5rem;
           --v-gap-block: 0.5rem; --v-gap-inline: 0.25rem; }
.v-nav   { --v-spacing: 0.5rem; --v-pad-block: 0.5rem; --v-pad-inline: 0.5rem;
           --v-gap-block: 0.5rem; --v-gap-inline: 0.25rem; --v-input-height: 2rem; }
.v-cta   { --v-input-height: 3rem; --v-radius: 9999px; }
```

Inside the scoped subtree, every `--o-*__pad-*` / `--o-*__gap` default re-resolves against the new bundle. (A consumer who forks the CSS package *may* reuse Janus's internal `v-spacing` mixin to shorten these, but it isn't required and isn't part of the documented surface.)

**Rule of thumb for consumers:** raw text never goes directly inside an `o-box`. Wrap it in `o-text-box`, or place it inside a text-bearing component. This keeps inline alignment (§6.1) and curvature clearance well-defined, and is what makes the positive-padding-only model work without negative margins.

### 6.5 Fluid spacing (opt-in, same mechanism as type)

Spacing is **static by default** — `--v-spacing` is a fixed length and the pad/gap bundle derives from it (§5.1). Type, by contrast, is fluid out of the box (§5.4). The asymmetry is deliberate: fluid type pays off everywhere (readable on phones, expressive on desktops with no breakpoints), while fluid spacing interacts with the frozen-at-root bundle and the hi-DPI gate, so we keep it opt-in rather than impose it.

When a consumer *does* want roomier gutters on wide screens, the same Utopia-style `clamp()` mechanism applies — make `--v-spacing` itself a fluid value, then set the bundle from it:

```css
/* Consumer CSS — fluid spacing between the §5.1 viewport anchors.
   slope/intercept computed exactly as in §5.4. */
:root {
  --v-spacing:    clamp(0.75rem, calc(0.6818rem + 0.34vw), 1rem);
  --v-pad-block:  var(--v-spacing);
  --v-pad-inline: var(--v-spacing);
  --v-gap-block:  var(--v-spacing);
  --v-gap-inline: calc(var(--v-spacing) * 0.5);
}
```

Because the four derivatives read `var(--v-spacing)` here, they track the fluid value. (This is one of the rare cases where the freezing rule helps you: deriving the bundle *from* a fluid `--v-spacing` in the same `:root` block makes the whole bundle fluid in lockstep.) The hi-DPI gate (§6.4) still composes — it can override the anchors of the clamp at high resolution. Janus's internal `v-fluid $min, $max` mixin (§5.3) is what generates these clamps in-house; consumers paste the computed `clamp()` or write their own.

### 6.6 Density scopes (the compactness convention)

Density — the **compactness** axis from §5.5 — is the one sizing concern Janus does *not* hand you as a single global knob, and deliberately so. There is no `--v-density` multiplier. Compactness is a property of a **role/context** (a toolbar is dense because it's a toolbar, not because of any global setting), so the convention is a **density scope**: a consumer-defined class that re-bundles the compactness knobs for a subtree. This is the same shape as the spacing examples in §6.4, promoted to a named pattern.

A density scope sets some or all of three knob groups:

1. **Rhythm** — the `--v-spacing` bundle (`--v-pad-*`, `--v-gap-*`, `--v-border-width`). Always set these together (the freezing rule, §5.2).
2. **Control height** — `--v-input-height`. **Left independent of `--v-spacing` by default** (§5.1) — "tighten the padding around a control but keep the control itself comfortably clickable" is a real and common want. A density scope *opts into* moving it.
3. **Legibility** — the type anchors, if this scope should also read smaller (a dense toolbar usually wants ~13px labels).

```css
/* Consumer CSS. Three escalating levels of "dense". */

/* Padding/gaps tighten; controls stay full-size and clickable. */
.v-dense {
  --v-spacing: 0.5rem; --v-pad-block: 0.5rem; --v-pad-inline: 0.5rem;
  --v-gap-block: 0.5rem; --v-gap-inline: 0.25rem;
}

/* Toolbar role: everything compact together — rhythm + control height + type. */
.v-toolbar {
  --v-spacing: 0.375rem; --v-pad-block: 0.375rem; --v-pad-inline: 0.375rem;
  --v-gap-block: 0.375rem; --v-gap-inline: 0.1875rem;
  --v-input-height: 2rem;
  --v-font-size-min: 0.8125rem; --v-font-size-max: 0.8125rem;  /* fixed, small */
}

/* Touch role: the inverse — roomier rhythm AND bigger targets together. */
.v-touch {
  --v-spacing: 1rem; --v-pad-block: 1rem; --v-pad-inline: 1rem;
  --v-gap-block: 1rem; --v-gap-inline: 0.5rem;
  --v-input-height: 2.75rem;
}
```

**The scope's driver is your choice (§5.5).** The class above is *role*-driven (you put `v-toolbar` on the toolbar). The exact same knob block can be driven by a different signal without changing the model:

```css
/* Container-driven: a panel that densifies when it itself gets narrow.
   Note @container, not @media — keyed to the panel, not the viewport. */
@container (max-width: 28rem) {
  .app-panel { --v-spacing: 0.5rem; --v-pad-block: 0.5rem; /* …bundle… */ }
}

/* Device-class-driven: coarse pointers get the touch bundle everywhere. */
@media (pointer: coarse) {
  :root { --v-input-height: 2.75rem; /* …roomier bundle… */ }
}
```

If a project finds itself wanting one lever instead of a bundle, the honest move is *not* a global `--v-density` scalar (it fights the "semantic, not abstract scalar" ethos and `--v-spacing` is already the rhythm scalar) — it's to define `--v-input-height: calc(var(--v-spacing) * N)` in that project's `:root` so control height tracks spacing automatically. That's a one-line opt-in to coupling, kept out of the framework default.

### 6.7 Sizing recipes by deployment type

Putting §5.5 (axes × signals) and §6.6 (density scopes) together, three deployment archetypes fall out. Each is a *choice of signal per axis*, not a different mechanism.

**Marketing / content site — fluid everything, viewport-driven.** Legibility and expressiveness both ride the viewport; type is the star.

```css
:root {
  --v-font-size-min: 1rem;     --v-font-size-max: 1.25rem;   /* wide gap   */
  --v-font-ratio-min: 1.2;     --v-font-ratio-max: 1.333;    /* expressive */
}
/* Optionally fluid spacing too (§6.5). Hero h1 goes ~2rem → ~4.5rem as one clamp. */
```

Per-section variety (airy hero, dense footer) is a **scope** that re-declares the anchors for that subtree — the ramp recomputes because the tokens are cascading vars.

**Desktop app (resizable window) — fixed type, role/container density.** Viewport ≈ window here, so viewport-fluid type is *wrong*: dragging the window must not resize the toolbar. Turn fluidity off and drive compactness by context.

```css
:root {
  /* Collapse the anchors → fixed scale, no vw dependence. */
  --v-font-size-min: 0.9375rem; --v-font-size-max: 0.9375rem;
  --v-font-ratio-min: 1.2;      --v-font-ratio-max: 1.2;
}
/* Density comes from roles (.v-toolbar, §6.6) and from @container queries on
   panels that should densify when cramped — never from raw vw. */
```

**Web app — device-class bundles, mixed signals.** Viewport/resolution is meaningful, but as a *discrete* "phone vs. desktop" signal, not continuous scaling. On a phone, legibility ↑, touch targets ↑, and spacing ↑ move **together**. The hi-DPI gate (§6.4) is the built-in version of this; `pointer: coarse` generalizes it.

```css
@media (pointer: coarse), (resolution >= 200dpi) {
  :root {
    --v-font-size-min: 1.0625rem; --v-font-size-max: 1.1875rem;  /* legible   */
    --v-input-height: 2.75rem;                                    /* touch     */
    --v-spacing: 1rem; --v-pad-block: 1rem; --v-pad-inline: 1rem; /* roomy     */
    --v-gap-block: 1rem; --v-gap-inline: 0.5rem;
  }
}
/* Mild viewport fluidity for body copy is fine on top of this; chrome density
   stays on the device-class signal so it doesn't drift with window width. */
```

The through-line: **pick the signal per axis.** Fluid is the right default for legibility on content surfaces; fixed-plus-context is the right default for app chrome; device-class bundles handle "this is a phone." All three are the same knobs wired to different signals.

## 7. Color & surface system

Five root color knobs (`--v-bg`, `--v-fg`, `--v-link`, `--v-accent`, `--v-muted`) carry the whole base palette. Tonal variations (primary / danger / etc.) live as **variants** that re-set these knobs together for a tonal subtree. No flat list of palette knobs at root.

### 7.0 Default palette values

The defaults matter — they set the visual tone for every consumer who doesn't override. v1's defaults produce a warm, intentional look (not generic black-on-white). v2 should match or improve on this warmth. Reference values from v1 (`git show main:src/lib/styles/variables/color-schemes.css`):

**Light mode defaults:**

| Knob | v1 reference value | Notes |
|---|---|---|
| `--v-bg` | `hsl(30deg 12% 98.5%)` | Warm off-white with a hint of cream. NOT pure `#fff`. |
| `--v-fg` | (derived from `--v-bg` via OKLCH lightness) | Resolves to near-black `hsl(216deg 16% 8%)` |
| `--v-link` | `hsl(195deg 100% 20%)` | Saturated dark teal — distinctive, not generic blue |
| `--v-accent` | Same as link or a close variant | Focus rings, selected states, primary actions |
| `--v-muted` | Reduced-saturation gray | De-emphasized text, secondary labels |

**Dark mode defaults:**

| Knob | v1 reference value | Notes |
|---|---|---|
| `--v-bg` | `hsl(216deg 16% 8%)` | Deep blue-gray. NOT pure `#000`. |
| `--v-fg` | (derived) | Resolves to warm off-white |
| `--v-link` | `hsl(195deg 100% 50%)` or lighter variant | Same hue as light, adjusted for dark bg contrast |

**Body background treatment.** Beyond the flat `--v-bg`, the `base.css` body rule should include subtle radial gradient overlays for visual depth (v1 pattern):

```css
/* v1 reference — two overlapping gradients at low opacity */
body {
  background:
    radial-gradient(ellipse at 70% 20%, hsl(20deg 80% 70% / 15%), transparent 50%),
    radial-gradient(ellipse at 30% 80%, hsl(195deg 80% 50% / 7%), transparent 50%),
    var(--v-bg);
}
```

This creates a barely-perceptible warm/cool depth that prevents the page from looking flat. The exact gradient values can change, but the pattern of two low-opacity radial gradients should be preserved.

**Tonal variant palette.** Each `v-colors-*` variant re-sets the five root knobs. v1 reference values:

| Variant | v1 bg (light mode) | Notes |
|---|---|---|
| `v-colors-primary` | `hsl(195deg 100% 20%)` (the link color as bg) | White or near-white fg |
| `v-colors-danger` | `hsl(0deg 89% 31%)` | Red family |
| `v-colors-success` | `hsl(158deg 77% 15%)` | Teal-green family |
| `v-colors-warn` | `hsl(50deg 77% 86%)` | Warm yellow, dark fg |
| `v-colors-info` | `hsl(195deg 80% 90%)` | Light cyan, dark fg |
| `v-colors-secondary` | `hsl(30deg 8% 93%)` | Near-gray, slightly warm — neutral tinted surface for secondary UI regions |

**Shadows.** Two semantic root knobs — no t-shirt scale. v1 shipped `--v-shadow-sm/md/lg`; v2 collapses these into role-based tokens:

```css
/* The two public knobs. Default values use multi-layer shadows for realistic depth. */
--v-shadow-outer: 0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px -1px rgb(0 0 0 / 10%);
--v-shadow-inner: inset 0 1px 2px 0 rgb(0 0 0 / 10%);
```

Components that need a stronger or weaker shadow write a literal value or scope a redefinition — `o-dialog` can redefine `--v-shadow-outer` for its subtree so cards inside a modal get a stronger lift. No `--v-shadow-sm/md/lg` public tokens. Reference `git show main:src/lib/styles/variables/composition.css` for v1's multi-layer values.

**Dynamic border derivation:**

```css
/* v1 pattern — borders that look correct on any background */
--v-border-color: color-mix(in hsl, black 17.5%, var(--v-bg));  /* light mode */
--v-border-color: color-mix(in hsl, white 50%, var(--v-bg));     /* dark mode */
```

**Transition defaults.** One base duration knob, not a scale. Components derive faster/slower paces via `calc()`:

```css
--v-duration: 240ms;                                  /* the standard pace */
--v-ease: cubic-bezier(0.4, 0, 0.2, 1);              /* Material-style ease */
/* Components use: calc(var(--v-duration) * 0.5) for fast hover/active feedback,
   calc(var(--v-duration) * 2) for extended transitions.
   prefers-reduced-motion zeros --v-duration and everything follows. */
```

**Tone** (`v-colors-*`) — re-sets the color knobs for a subtree. Composable; applies to whichever element carries the class.

- `v-colors-primary`, `v-colors-danger`, `v-colors-success`, `v-colors-warn`, `v-colors-info`, `v-colors-secondary`

**Surface-role** (`v-colors-*`) — UI-context variants that control *which* surface a component renders on. These are orthogonal to tonal variants: a tooltip is always inverted regardless of whether it sits inside `v-colors-danger` or the default palette.

| Variant | Purpose | Key behavior |
|---|---|---|
| `v-colors-tooltip` | Floating annotation | Always inverted vs. color scheme. `--v-bg: light-dark(#141821, #fafafa)` |
| `v-colors-popover` | UI replacement (menus, dropdowns) | Matches card/surrounding chrome. `--v-bg: var(--v-card-bg, var(--v-bg))` |
| `v-colors-code` | Inline code | Tinted paper. `--v-bg: color-mix(in hsl, var(--v-muted) 8%, var(--v-bg))` |
| `v-colors-pre` | Code blocks | Always dark, even in light mode. `--v-bg: #141821; --v-fg: #fdf3e1` |
| `v-colors-callout` | Callout/highlighted region | Tinted bg + **auto weight-bump**: `--v-font-weight-normal: 500`, `--v-font-weight-label: 600`, `--v-font-weight-strong: 800`. Entire weight stack shifts up ~100. |
| `v-colors-highlight` | Active descendant / selected item | `--v-bg: var(--v-accent)` or `--v-link`. Used by menus and keyboard nav. |

`v-colors-warn` and `v-colors-info` should also apply the callout weight bump, since they are tinted-surface variants where body-weight text loses contrast against the background.

**Surface** (`v-surface-*`) — background treatment, shadow, border, optional `backdrop-filter`. Composes with `v-colors-*` for tint.

- `v-surface-card` — solid bg, subtle shadow + border
- `v-surface-elevated` — stronger shadow, no border
- `v-surface-sunken` — slight tint inward, no shadow
- `v-surface-glass` — translucent bg + `backdrop-filter: blur()`
- `v-surface-gradient` — soft gradient bg. Exposes `--v-surface-gradient__angle` (default `to bottom right`) — variant-scoped knob, not a global root knob.

This is the gap most worth closing from v1. v1 consumers reach for inline `background: linear-gradient(...)` because there is no recipe. Provide recipes.

### 7.1 Contrast-floor weight fallback

`--v-link` / `--v-accent` / `--v-muted` each pair with a `*-weight-min` knob (§5.1). Base styles for text rendered in those colors apply the floor as `font-weight`:

```css
a       { color: var(--v-link);   font-weight: var(--v-link-weight-min,   inherit); }
.v-muted{ color: var(--v-muted);  font-weight: var(--v-muted-weight-min,  inherit); }
.v-accent-text { color: var(--v-accent); font-weight: var(--v-accent-weight-min, inherit); }
```

This lets a designer ship a slightly desaturated link or a softer muted color without breaking WCAG contrast — the weight bump carries the visual emphasis the hue alone can't. Default is `inherit` (no bump); palettes that need it raise the floor.

### 7.2 Color scheme (light/dark)

`--v-bg` defaults via `light-dark(white, black)` (or whatever palette anchors are chosen); `--v-fg` defaults to a binary black-or-white derived from the bg's OKLCH lightness — see §5.1 for the formula. The active half of `light-dark()` is driven by the cascaded `color-scheme` property.

Janus uses `data-v-color-scheme` on the root (or any subtree root) to control the scheme:

| Value | Behavior |
|---|---|
| *(no attribute)* | Follow `prefers-color-scheme`. Equivalent to `color-scheme: light dark`. |
| `data-v-color-scheme="system"` | Same as no attribute — explicit "follow OS" opt-in. Useful for a tri-state theme picker (light / dark / system) where "system" is a distinct selection. |
| `data-v-color-scheme="light"` | Force light. `color-scheme: light` (also disables dark-mode UA chrome). |
| `data-v-color-scheme="dark"` | Force dark. `color-scheme: dark`. |

Naming note: the attribute is `data-v-color-scheme`, not `data-v-theme`, because "theme" may later carry an orthogonal meaning (brand theme, density theme, etc.) and we want the dark-mode hook to be unambiguous.

## 8. Border radius system

Radius is bounded by two anchors: a **max** (`--v-radius`, carried by the outermost frame — the window) and a **min** (`--v-radius-min`, the floor). Everything between **steps down from the max toward the min** by the spacing/inset between an element and its parent, floored at the min so a corner is never sharp. A consumer reasons about two endpoints — how round the window is, and how square things can get — and depth fills in the middle.

### 8.1 The radius is a value, separate from whether it's *painted*

`--v-radius` is the radius the outermost frame is *assumed* to have, and it drives the whole inward cascade — **independently of whether anything actually draws a `border-radius` on the frame.** A browser web app never paints its own window corner (the OS does), but it still wants its top-level cards sized concentric to that corner; a desktop/webview shell paints the corner itself. So "what is the frame radius" and "do we draw it" are two separate decisions:

- **Cascade input:** `--v-radius` (the assumed window radius) — always feeds the step-down.
- **Painted or not:** whether the frame element gets `border-radius: var(--v-radius)`. The page frame usually *doesn't* (the browser rounds the window); a dialog frame *does*.

There is one `--v-radius` (the assumed outer corner); painting it is a per-frame choice.

### 8.2 Radius tracks nesting depth, not element type

The radius of an element is a function of **how many steps deep it sits**, not what kind of thing it is. The *same* control rounds differently by context: directly in a dialog it's one step in (`dialog − pad`); inside a card inside that dialog it's two steps in (`dialog − 2·pad`, usually floored). The cascade does the counting — each box re-derives the **control** knob from its own already-stepped radius, with no self-reference (it *reads* `--o-box__radius` and *writes* `--o-input-box__radius`, different names):

The cascade is **always on** — it's the radius system, not an opt-in class. It anchors at the frame, works inward, and floors every step at `--v-radius-min`:

```css
:root {
  --o-dialog__radius:    max(var(--v-radius-min), calc(var(--v-radius) - var(--o-dialog__offset)));
  --o-box__radius:       max(var(--v-radius-min), calc(var(--v-radius) - var(--v-pad-inline)));
  --o-input-box__radius: max(var(--v-radius-min), calc(var(--v-radius) - var(--v-pad-inline)));
}
/* a box steps the control knob one pad deeper for *its* children */
:where(.o-box, .o-text-box) {
  --o-input-box__radius: max(var(--v-radius-min), calc(var(--o-box__radius) - var(--v-pad-inline)));
}
/* the dialog re-roots the cascade — everything inside derives from the dialog radius */
.o-dialog {
  --o-box__radius:       max(var(--v-radius-min), calc(var(--o-dialog__radius) - var(--v-pad-inline)));
  --o-input-box__radius: max(var(--v-radius-min), calc(var(--o-dialog__radius) - var(--v-pad-inline)));
}
```

Each object reads its own knob with a floor fallback (`.o-box { border-radius: var(--o-box__radius, var(--v-radius-min)) }`); the cascade assigns the knobs.

| Knob | Owned by | Value |
|---|---|---|
| `--v-radius` | (root) | The **max** — the assumed window/frame corner. The anchor. |
| `--v-radius-min` | (root) | The **min** — the floor. Nothing rounds below it; deep elements bottom out here. |
| `--o-dialog__radius` | `o-dialog` | `max(min, frame − dialog-inset)` |
| `--o-box__radius` | `o-box` | `max(min, parent-radius − pad)` |
| `--o-input-box__radius` | `o-input-box` | `max(min, box-radius − pad)` — one step deeper than its box |

### 8.3 The dialog inset relationship

A modal floats `--o-dialog__offset` inside the viewport, so its corners only look concentric with the window's when **`dialog_radius = window_radius − offset`** (the same "outer − inner = the gap" rule, where the gap is the inset). A larger inset rounds the dialog *less*. An inset, floating dialog is not the same radius as the page frame — it's the frame radius minus how far it sits inside.

### 8.4 Tuning the look — two values, no preset classes

There are **no `v-radius-*` preset classes**. The cascade above *is* the system; the look is set entirely by the two root values, so "concentric / uniform / flat" are regions of one parameter space rather than separate modes:

- **Concentric** — a large `--v-radius` (window) over a small `--v-radius-min` (floor): each level rounds visibly less than its parent, corners staying parallel down to the floor.
- **Flat** — `--v-radius-min == --v-radius`: the `max(min, …)` pins the whole cascade to that one value, so every corner is identical. (No separate `flat` class — just set the two equal.)
- **Near-uniform / two-tier** — a small range, or a `--v-pad-inline` large relative to it: the deep levels (controls, boxes) bottom out at the floor while the shallow ones (dialog, window) stay near the max. The "two flat tiers" look falls out without a non-stepping mode.

For a one-off corner, a consumer sets that object's `--o-*__radius` directly, or uses `t-radius-none` / `t-radius-full` (§8.6). Nothing about the system needs a class — only its two inputs change.

### 8.5 Frame corners are *occupied*, not padded around

Content on a **painted frame corner** — a window header, a dialog's title row and footer — would crowd into the curve when the frame radius is large. Padding it out doesn't work: no inset keeps text clear of a large corner *and* keeps it aligned with the content below (the brand floats away from the gutter and the bar bloats). The corner is instead **occupied by a deliberate round element**, and the real content sits clear *after* it:

- **A circular control nestles into a rounded corner without clipping.** Its rounded shape echoes the corner; its nearest point stays inside the arc at normal padding (a `--v-input-height` circle inset by `--v-spacing` clears even a near-pill frame radius). So the corner gets a **leading icon button** (a sidebar/menu trigger on a window header; a leading icon + a **close** button on a dialog), and the trailing primary action — which the radius cascade turns into a **pill** at large frame radius — takes the opposite corner.
- **Padding stays normal and symmetric.** The brand/title sits at the standard position *after* the corner element, which puts it clear of the curve; "title after a leading control" is the conventional app-bar layout, so it reads as intentional.
- **Empty corners need nothing.** A right-aligned footer leaves its bottom-left corner empty; nothing to clip.

This is a **design constraint the radius surfaces**: a frame with a large corner radius wants a control in each occupied corner. Small radii need none of it — content never reaches the curve.

### 8.6 Curvature, square content, escape hatches

- **Curvature clearance (text & pills).** Text-bearing objects floor their *own* inline padding at the corner radius so glyphs clear the curve (the straight-edge principle of §6.1, applied to a box's own contents). For a **pill** the effective radius is half the height, so the floor is `0.5lh + block-pad`, not `--v-radius-min`. The general rule: *inline padding ≥ the effective corner radius*, where a pill's effective radius is `height/2`.
- **Square / icon content.** `o-square`, `c-avatar`, `c-spinner`, `c-badge` (dot mode) read `--v-radius` directly and can go fully circular (`--v-radius: 50%`).
- **No deeper nesting in one object.** The cascade already handles depth, but a *nested same object* shares its parent's box knob unless a box re-roots it (as `.o-box` does for the control knob). Two genuinely distinct rounded-box levels → introduce a new object with its own knob.
- **Escape hatches** in the tools layer: `t-radius-none`, `t-radius-full`.
