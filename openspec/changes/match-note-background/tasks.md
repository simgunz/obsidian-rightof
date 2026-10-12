# Tasks

## 1. Render logic

- [ ] 1.1 Give `renderDiagram` a `background` option that replaces `transparent` for diagrams that name no theme (falling back to the theme's own background when it is empty), and verify unit tests check that the page box and the edge-label box both carry that colour, and that a named theme still keeps its own

## 2. Obsidian glue

- [ ] 2.1 Read the note's background from the block (`--background-primary`) in `DiagramChild` and `DiagramModal`, re-render a block on `css-change` when the mode or that colour changed, and verify `npm test`, `npm run build` and `npm run lint` pass

## 3. Integration

- [ ] 3.1 In the sandbox Obsidian, verify that the label box and the page box match the note background in light and dark mode, that a line no longer shows through a label (checked against the broken build first), and that switching to a theme with another background re-renders the diagram; then reinstall the build in the zettelkasten

## Workflow follow-up

- Validate with `openspec validate match-note-background --strict`.
- Archive the change, so the modified requirement lands in `openspec/specs/diagram-rendering/spec.md`.
- Fast-forward `main` to the branch.
