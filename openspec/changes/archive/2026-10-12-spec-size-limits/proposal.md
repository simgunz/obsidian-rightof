# Proposal

## Why

Commits after the security review added two limits that refuse to draw a diagram, and no spec describes them:
- **Source length:** a block longer than 64 KB is refused. Parts of reladraw slow down faster than linearly, and a block re-renders on every keystroke.
- **Diagram size:** a diagram wider or taller than 100,000 px, or with a zero or invalid size, is refused. A note can make reladraw write `Infinity` or `1e23` as a size, which breaks the layout and the zoom view.

This change records that behaviour in the spec.

## What Changes

- `diagram-rendering` gains a requirement: an oversized block or diagram shows an error in place of the diagram.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `diagram-rendering`: adds the size-limit requirement.

## Impact

Spec only. The code already behaves this way (`src/render.ts`, `src/display.ts`), and its unit tests cover both limits.
