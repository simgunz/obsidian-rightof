# Tasks

## 1. Scaffold

- [x] 1.1 Add the sample-plugin layout (package.json, esbuild.config.mjs, tsconfig.json, manifest.json with id `rightof` and isDesktopOnly true, versions.json, version-bump.mjs, eslint.config.mts, .gitignore, a src/main.ts that loads) and verify `npm install`, `npm run build` and `npm run lint` succeed and `main.js` appears
- [x] 1.2 Add vitest with jsdom and an `obsidian` mock alias, plus `reladraw` pinned to exactly 0.15.1, and verify `npm test` runs a placeholder test and `npm ls reladraw` shows 0.15.1

## 2. Render logic

- [x] 2.1 Implement `renderDiagram(source, { dark })` in src/render.ts and verify unit tests cover a valid block, a SourceError with its line, an empty block, and a non-source error
- [x] 2.2 Add the theme rule (dark/light by mode with a transparent background; a file's own `diagram theme:` wins with its own background) and verify unit tests cover both modes and a named theme in each mode

## 3. Obsidian glue

- [ ] 3.1 Implement `DiagramChild` (SVG through DOMParser, the error box, a re-render on `css-change` when the mode changed) and register the `reladraw` code-block processor in main.ts; verify `npm run build` and `npm run lint` pass
- [ ] 3.2 Add styles.css (the diagram fits the column; the error box uses the Obsidian error colours and monospace) and verify it is loaded in the end-to-end check

## 4. Docs and integration

- [ ] 4.1 Write README.md (what it does, manual install, dev loop, usage with an example block) and verify every command it lists runs as written
- [ ] 4.2 Run the end-to-end check in an isolated desktop Obsidian: positive control with the plugin off, then with it on: SVG in Reading view and Live Preview, the edit button shows the source, an edit re-renders, the error box shows `line N`, a mode switch changes the colours, a named theme is kept, other code blocks are untouched, a wide diagram has no horizontal scroll

## Workflow follow-up

- Validate with `openspec validate render-reladraw-blocks --strict`.
- Archive the change, so `diagram-rendering` lands in `openspec/specs/`.
- Fast-forward `main` to the branch.
