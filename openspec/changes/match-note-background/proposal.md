# Proposal

## Why

Lines run straight through edge labels in every diagram that names no theme. reladraw hides a line behind a label with a box filled in the theme's background colour. `diagram-rendering` makes that background transparent, so the label boxes became transparent too. Found on a real note in the user's vault.

## What Changes

- A diagram that names no theme takes the note's own background colour, not `transparent`. The diagram still blends into the note, and label boxes hide the line under them again.
- The diagram re-renders when the note's background colour changes, for example after switching to another Obsidian theme, not only when light/dark mode flips.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `diagram-rendering`: the light/dark requirement changes its background rule from "transparent" to "the note's background colour", and gains scenarios for labels and theme changes.

## Impact

- `src/render.ts` takes the background colour as an input. `DiagramChild` and `DiagramModal` read it from the page.
- No new dependencies.
