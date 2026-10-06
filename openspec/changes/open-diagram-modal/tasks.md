# Tasks

## 1. Pure logic

- [x] 1.1 Implement `src/viewport.ts` (`zoomAt` with clamping to 10%-1000% that keeps the point fixed, `fit` that scales and centres with padding, `panBy`) and verify unit tests cover the fixed point, both clamps, fitting a small and a large diagram, and panning
- [x] 1.2 Implement `src/blocks.ts` (`findBlocks` with CommonMark fence rules, `blockAt`) and verify unit tests cover backtick and tilde fences, a longer closing fence, an unclosed fence, a fake fence inside a `js` block, two blocks, and a cursor inside, on and outside the fences

## 2. Modal

- [x] 2.1 Move the SVG parsing and the error box from `DiagramChild` into `src/svg.ts`, unchanged in behaviour, and verify `npm test`, `npm run build` and `npm run lint` pass
- [ ] 2.2 Implement `DiagramModal` (fit on open, wheel zoom at the pointer, `-` / `+` / percentage / fit toolbar, drag to pan with the click swallowed after a drag, double-click to fit, error box for an invalid source) with its styles, and verify `npm run build` and `npm run lint` pass

## 3. Entry points

- [ ] 3.1 Add the expand button to `DiagramChild` (hover only, clear of `</>` in Live Preview, does not move the cursor, absent on errors) and verify `npm run build` and `npm run lint` pass
- [ ] 3.2 Register the "Open reladraw diagram" command with `checkCallback` (cursor block, else first; first in Reading view; hidden without blocks) and verify `npm run build` and `npm run lint` pass
- [ ] 3.3 Update README.md usage with the expand button, the command and the modal controls, and verify the described controls match the built plugin

## 4. Integration

- [ ] 4.1 Run the end-to-end check in the sandbox Obsidian: the button opens the modal in Reading view and Live Preview with the block still rendered, both buttons visible without overlap, no button on an error, the command picks the right block in source and Reading view and is hidden without blocks, the diagram opens fitted, wheel and buttons zoom with clamping and the percentage updates, clicking the percentage gives 100%, a drag pans, a drag ending on a link does not navigate, a double-click fits, Esc and the backdrop close, the wheel over a note diagram scrolls the note

## Workflow follow-up

- Validate with `openspec validate open-diagram-modal --strict`.
- Archive the change, so `diagram-modal` lands in `openspec/specs/`.
- Fast-forward `main` to the branch.
