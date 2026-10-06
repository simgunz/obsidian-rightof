# Design

## Context

From `render-reladraw-blocks`:

- `DiagramChild` renders one block into the processor's `el`. It knows its `source`, and `renderDiagram(source, { dark })` turns a source into an SVG or an error.
- Live Preview puts the block inside `.cm-preview-code-block`, next to Obsidian's own `.embed-actions` box. That box holds the 30×26 px `.edit-block-button`, 4 px from the top-right corner (measured in Obsidian 1.13.7).
- Reading view has no `.embed-actions` box.

Obsidian's `Modal` already closes on Esc, on its close button and on a backdrop click.

## Goals / Non-Goals

**Goals:**
- Keep the zoom maths and the block finding pure, with no `obsidian` import, so vitest covers them.
- Make one modal class serve both entry points: the button and the command.

**Non-Goals:**
- Smooth animated zoom, inertia, touch gestures and keyboard zoom.
- Remembering a diagram's zoom between openings.

## Decisions

**1. The viewport is a small pure module (`src/viewport.ts`).**
- **State:** `{ scale, x, y }`, the transform of the diagram inside the viewing area, applied as CSS `translate(x, y) scale(scale)` with `transform-origin: 0 0`.
- **Functions:**
  - `zoomAt(state, factor, point)` clamps the scale to [0.1, 10]. It keeps `point` fixed: `x' = px - (px - x) * s'/s`, and the same for `y`.
  - `fit(content, area, padding)` scales to the smaller of the two ratios, clamps the result, and centres.
  - `panBy(state, dx, dy)` moves the diagram.
- **Alternative:** an SVG `viewBox` rewrite. It ties the maths to SVG attributes and makes the pointer-to-diagram mapping harder to test.

**2. Block finding is pure (`src/blocks.ts`).**
- `findBlocks(text)` scans lines with CommonMark fence rules:
  - An opening fence is 3 or more backticks or tildes, with info string `reladraw`, indented 0 to 3 spaces.
  - The closing fence uses the same character and is at least as long.
  - An unclosed fence runs to the end of the note.
  - Fences of other languages are tracked too, so a fake fence inside a `js` block is ignored.
- It returns `{ startLine, endLine, source }`, with 0-based fence lines. `blockAt(blocks, line)` picks the block whose fences enclose the line.
- **Alternative:** `metadataCache` `sections`. These give a code section's lines but not its language, so the text would still need parsing. Reading `view.getViewData()` works the same way in both modes.
- **Limit:** fences inside blockquotes and callouts (`> ```reladraw`) are not found by the command. The expand button still works there.

**3. `DiagramModal extends Modal` takes `(app, source)`.**
- **Rendering:** it renders with `renderDiagram`, using `body.theme-dark` at open time. The SVG goes through the same `DOMParser` path as the note, shared through one helper in `src/svg.ts`. An error shows the same error box.
- **Size:** the class `rightof-modal` sets the size to 90vw × 85vh.
- **Toolbar:** `-`, a percentage button, `+` and fit, laid out on a row above the viewing area. All buttons are `clickable-icon`, with `setIcon` icons `zoom-out`, `zoom-in` and `scan` and an `aria-label`.
- **Fitting:** on open, `fit` runs after layout, in a `requestAnimationFrame`, because the area has no size before that. The diagram's natural size comes from the SVG's `width` and `height` attributes.

**4. Pointer handling in the viewing area.**
- **Wheel:** `deltaY` maps to a factor of `exp(-deltaY * 0.0015)` around the pointer. The listener uses `{ passive: false }` and calls `preventDefault`, so the modal never scrolls.
- **Drag:** `pointerdown` with button 0 calls `setPointerCapture`, and `pointermove` pans. Once the drag has moved more than 3 px, a `click` listener in the capture phase swallows the next click, so a link under the release point does not open.
- **Double-click:** fits.
- **Alternative:** Ctrl+wheel to zoom and a plain wheel to scroll, as in-note plugins do. The modal has nothing to scroll, so a plain wheel zoom is the expected lightbox behaviour.

**5. The expand button lives inside `.rightof-diagram`.**
- **Markup:** `div.rightof-actions > button.clickable-icon.rightof-expand`, with icon `maximize-2` and `aria-label="Open diagram"`. It is absolutely positioned 4 px from the top-right corner.
- **Live Preview:** `.cm-preview-code-block .rightof-actions` moves 38 px further left, to clear `</>`.
- **Visibility:** the button shows on hover of the block, as `</>` does.
- **Click handling:** the handler calls `preventDefault` and `stopPropagation` on `mousedown` and `click`, so CodeMirror does not move the cursor into the block.
- **Alternative:** inject the button into Obsidian's `.embed-actions`. That box is created by Obsidian after our processor runs, and only in Live Preview, so we'd depend on its timing.

**6. The command uses `checkCallback`.**
- It gets the active `MarkdownView` and runs `findBlocks(view.getViewData())`. With no blocks it returns `false`.
- In `source` mode it uses `blockAt(blocks, view.editor.getCursor().line) ?? blocks[0]`. In `preview` mode it uses `blocks[0]`.

## Risks / Trade-offs

- **[Risk]** CodeMirror may still react to a click inside the widget and reveal the source. → **Mitigation:** stop the events at the button. The end-to-end check verifies that the block still shows the diagram after a click.
- **[Risk]** Obsidian's `.embed-actions` offset may differ in other themes. → **Mitigation:** the fixed 38 px offset matches the default theme. A theme that moves `</>` might overlap it, which is acceptable for v1.
- **[Trade-off]** The modal reads the mode once, at open time, and doesn't follow a mode switch while it is open. Switching mode with a modal open is rare.
