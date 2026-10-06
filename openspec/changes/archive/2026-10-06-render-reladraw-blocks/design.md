# Design

## Context

The repo holds only the OpenSpec scaffold. reladraw 0.15.1 offers what this change needs as a library:

- `compile(source, { theme })` runs in sync and returns an SVG string.
- An error in the source throws `SourceError`, with the 1-based `line` inside the source.
- `parse(source)` returns `{ statements }`. A `diagram` statement carries the file's own `attrs.theme`.
- `THEMES.light` and `THEMES.dark` are plain objects. Each one's `background` becomes the SVG's first `<rect>` fill.

Observed in a probe, and it shapes the theme decision: a `theme` passed to `compile` **overrides** a file's own `diagram theme:`.

Obsidian facts, from the 1.13.7 app bundle and `obsidian.d.ts`:

- `registerMarkdownCodeBlockProcessor` handlers run in Reading view and in Live Preview.
- Live Preview wraps the output in a widget that already carries the `.edit-block-button`.
- Theme switches toggle `body.theme-dark` and then fire `workspace` `css-change`.

## Goals / Non-Goals

**Goals:**
- Keep every decision about a diagram in a pure module with no `obsidian` import, so vitest covers it.
- Keep the Obsidian glue small enough that the end-to-end check in a real Obsidian is its only test.

**Non-Goals:**
- Exact text measurement. reladraw's default monospace measurer and the font list it writes into the SVG are kept.
- Caching renders. A block re-renders whenever Obsidian asks or the mode changes.

## Decisions

**1. `src/render.ts` is pure and owns the decisions.** `renderDiagram(source, { dark })` returns `{ ok: true, svg }` or `{ ok: false, line?, message }`.
- *Alternative:* call `compile` inside the render child and catch errors there. That would put the theme rule and the error shape behind `obsidian`, where they can only be tested by hand.

**2. A file's own theme is detected with `parse`, then `compile` gets no theme.** If `parse` finds a `diagram` statement with `attrs.theme`, `compile` runs without a `theme` option, so the file's theme applies, background included. Otherwise it gets `THEMES.dark` or `THEMES.light`, with `background: 'transparent'`.
- If `parse` throws, `compile` then throws the same error with a better line (it calls `blame`), so only `compile`'s error is reported.
- *Alternative:* always pass a theme. The probe showed this silently overrides the author's choice.
- *Alternative:* make a named theme's background transparent too. A dark named theme on a light note would then put light text on a white page.

**3. The SVG string becomes DOM through `DOMParser('image/svg+xml')`.** The parsed root is adopted into the block's element. A `parsererror` document is reported as an error.
- *Alternative:* `innerHTML`. It is banned by the project conventions and flagged by eslint-plugin-obsidianmd.

**4. `DiagramChild extends MarkdownRenderChild` owns one block.** It renders on `onload`. It registers `workspace.on('css-change')` with `this.registerEvent`, so the listener goes away when Obsidian discards the block, and it re-renders only when `body.theme-dark` has changed.
- *Alternative:* one plugin-level listener that walks every rendered block. That would need a registry of live blocks, which Obsidian's own child lifecycle already gives us.

**5. Fit to the column with CSS.** `.rightof-diagram svg { max-width: 100%; height: auto; }`. The SVG has a `viewBox`, so it keeps its proportions. No JS measuring.

**6. The error box is plain DOM.** `div.rightof-error` holds a title line `reladraw: line N` (or `reladraw:`) and the message in a `<pre>`. It uses `--text-error` on a faint red background (`--color-red-rgb` at 10%, as callouts do), and `--font-monospace` for the message.

**7. The scaffold follows obsidian-sample-plugin.**
- Build: esbuild from `src/main.ts` to the root `main.js`. `tsc -noEmit` runs as the type check, and eslint uses `obsidianmd.configs.recommended`.
- Tests: vitest, with `obsidian` aliased to a small mock for the few names the glue imports. Only pure modules get unit tests.
- Dependencies: `reladraw` is pinned exactly, with `"reladraw": "0.15.1"` and no caret.

## Risks / Trade-offs

- **[Risk]** Live Preview might not show the edit button for a plugin's block, although the bundle suggests it does. → **Mitigation:** the end-to-end check verifies it in a real Obsidian before the change is archived. If the button is missing, the spec is revised, not quietly skipped.
- **[Risk]** reladraw's monospace width estimate can differ from the font Obsidian actually uses, so long texts may overflow their boxes slightly. → **Mitigation:** none for v1. A DOM-backed measurer is a later change.
- **[Trade-off]** Every block re-renders on each mode switch. reladraw compiles in milliseconds for note-sized diagrams, so a cache isn't worth its invalidation rules yet.
- **[Risk]** A future reladraw changes the syntax. → **Mitigation:** the exact pin. Upgrading is a deliberate change.
