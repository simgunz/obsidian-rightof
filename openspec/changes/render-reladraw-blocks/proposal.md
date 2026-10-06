# Proposal

## Why

reladraw diagrams can't live in an Obsidian note today: no plugin renders them, and Obsidian can't run reladraw's web element inside a note. This first change makes a ```` ```reladraw ```` block show its diagram, so reladraw can replace Mermaid in a vault.

## What Changes

- New Obsidian plugin "Right Of", desktop only, scaffolded from the official sample plugin.
- A ```` ```reladraw ```` code block renders as a diagram in Reading view and in Live Preview.
- Editing stays Obsidian's own: the block's edit button shows the source in place.
- An invalid block shows an error with the line that is wrong, not a blank space.
- The diagram follows Obsidian's light or dark mode and updates when the mode changes. A diagram that names its own theme keeps it.
- A README covers installing the plugin by hand, the dev loop, and usage.

Out of scope, for later changes: the zoom modal and its command (next change, `open-diagram-modal`), syntax colours, export, `.reladraw` files and `![[...]]` embeds, matching the Obsidian theme's exact colours, mobile, and links on nodes.

## Capabilities

### New Capabilities
- `diagram-rendering`: how a reladraw block in a note turns into a diagram: where it renders, how errors show, and how the theme is chosen.

### Modified Capabilities

None.

## Impact

- New code in a new repo: `src/`, `styles.css`, `manifest.json`, build and test setup.
- New runtime dependency: `reladraw`, pinned to exactly `0.15.1` and bundled into `main.js`.
- No existing behaviour changes: the repo has no code yet.
