# Tasks

## 1. Sanitiser

- [ ] 1.1 Add `sanitizeSvg` to `src/svg.ts` and run it inside `parseSvg`, before the import into the page. It keeps allowlisted SVG elements, removes event handlers, `style` and external references, and keeps only http(s) links. Verify that unit tests cover script, foreignObject, style elements, namespaced elements, handlers, remote images, external `url()`, `<use>` to outside files, script and file links, kept web links, and reladraw's own output passing through unchanged
- [ ] 1.2 Add an end-to-end unit test: a block with a hostile pasted icon and a `javascript:` url, through `showDiagram`, leaves no unsafe element, attribute or link in the DOM

## 2. Integration

- [ ] 2.1 In the sandbox Obsidian, verify that a hostile note renders its diagram without injected style or HTML, makes no request for the remote image, and that a web link still opens while a script link is gone

## Workflow follow-up

- Validate with `openspec validate sanitize-diagram-svg --strict`.
- Archive the change.
