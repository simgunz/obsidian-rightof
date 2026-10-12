# Design

## Context

`parseSvg` parses reladraw's string with `DOMParser('image/svg+xml')` and imports the root into the page. A `DOMParser` document is inert, so nothing in it runs until it is imported. Across all 27 of reladraw's examples, its output uses only `a circle defs g marker mask path rect svg text tspan`. The attributes are presentation attributes, ids, `url(#…)` references, and `href`, `target` and `rel` on `<a>`.

## Goals / Non-Goals

**Goals:**
- Clean the tree while it is still inert, so unsafe markup never touches the live document.
- Keep every diagram reladraw can draw on its own pixel-identical.

**Non-Goals:**
- Preserving arbitrary features of pasted icon SVG. Gradients, clip paths and plain shapes survive. Filters, images, text on paths and CSS do not.
- Defending against slow or huge diagrams. That is a separate concern (see Risks).

## Decisions

**1. Allowlist, not denylist.**
- **Rule:** only SVG-namespace elements in a fixed set survive: reladraw's 11, plus the safe shape and paint elements a pasted icon commonly uses: `ellipse line polyline polygon clipPath linearGradient radialGradient stop title desc`.
- **Unknown elements:** everything else is removed with its subtree.
- **Why:** reladraw's own guard is a denylist, and that is exactly how `foreignObject` and namespaced scripts got through.

**2. Attribute rules.**
- **Removed:** every `on*` attribute, every `style` attribute, and every attribute in a namespace other than none, `xml` and `xlink`.
- **`href`:** on non-`<a>` elements it is kept only as a same-document `#id`.
- **`url()` references:** any value with a `url(…)` that does not point to `#id` is dropped. That stops remote paint servers and masks.

**3. Links.**
- An `<a>` keeps its `href` only if it parses as an absolute `http:` or `https:` URL. Otherwise the `<a>` is replaced by its children, so the drawing stays and the link goes.
- A kept link gets `target="_blank" rel="noopener noreferrer"`, which Obsidian opens in the browser.

**4. Place.** The sanitiser runs inside `parseSvg`, between parsing and `importNode`. That is the only path into the page, so the note, the modal and any later caller are all covered.

- **Alternative:** DOMPurify with its SVG profile. It's a well-tested library, but it would be a new runtime dependency, about 20 KB. Its default profile also keeps more than reladraw needs. A short allowlist matched to reladraw's real output is easier to audit.

## Risks / Trade-offs

- **[Risk]** A future reladraw emits a new element or attribute, which the sanitiser strips. → **Mitigation:** a unit test compiles diagrams covering markers, masks, badges, decks and links, and fails if sanitising changes them. reladraw is pinned, so an upgrade is a deliberate step that runs this test.
- **[Risk]** A huge or pathological block can freeze the UI while reladraw lays it out. → Not addressed here. It is documented as a known limit, because a size cap would refuse legitimate diagrams.
