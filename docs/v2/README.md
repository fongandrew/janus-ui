# Janus v2 — Build Plan

This document specifies a clean-room rebuild of the Janus UI library. It is written so an agent with no prior context can build it from scratch in a fresh repository. There is no migration path from v1; learn from v1 but do not preserve its structure.

The plan is split across the files below. Read top-to-bottom for the full design, or jump to a part. Internal cross-references use the original §-section numbers — e.g. "see §5.2" refers to section 5.2 inside [02-cascade-and-variables.md](./02-cascade-and-variables.md).

## Contents

- [01-overview.md](./01-overview.md) — §1 Goals, §2 Non-goals, §3 Pseudo-package layout
- [02-cascade-and-variables.md](./02-cascade-and-variables.md) — §4 Cascade architecture, §5 The variable system
- [03-spacing-color-radius.md](./03-spacing-color-radius.md) — §6 Spacing & padding primitives, §7 Color & surface system, §8 Border radius system
- [04-objects.md](./04-objects.md) — §9 Objects (zero JS, pure CSS)
- [05-components-and-tools.md](./05-components-and-tools.md) — §10 Components, §11 The tools layer
- [06-dom-layer.md](./06-dom-layer.md) — §12 The JS layer (`src/lib/dom`)
- [07-solid-layer.md](./07-solid-layer.md) — §13 Solid layer (`src/lib/solid`)
- [08-conventions-and-criteria.md](./08-conventions-and-criteria.md) — §14 Explicitly dropped from v1, §15 Browser feature gates, §16 Naming & file conventions, §17 Reference patterns to study from v1, §18 Success criteria
