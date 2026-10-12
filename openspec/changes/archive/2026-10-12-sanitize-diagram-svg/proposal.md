# Proposal

## Why

A note can make the plugin put arbitrary markup into Obsidian's window. reladraw copies a pasted icon (`icon x """<svg>…</svg>"""`) into its output almost unchanged. Its guard only rejects `<script` and `on…=` attributes, so `<foreignObject>` with HTML, `<style>` sheets, remote images and links with any scheme get through. A node's `url:` also takes any scheme, including `javascript:` and `file:`. Obsidian runs with Node access, so a shared or downloaded note must not be able to run code, restyle the app, or reach the network when it is opened or clicked.

## What Changes

- The SVG reladraw returns is cleaned before it reaches the page:
  - Only drawing elements are kept.
  - Event handlers and `style` attributes are removed, and so is any reference that is not inside the diagram.
- A link survives only if it points to an `http` or `https` address. Any other link becomes plain drawing, with no link.
- Links that survive open as Obsidian opens any external link.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `diagram-rendering`: adds requirements that a diagram cannot run code or load outside content, and that its links open only web pages.

## Impact

- `src/svg.ts` gains a sanitiser that runs on the parsed SVG before it is imported into the page. The note and the modal both go through it.
- No new dependency: reladraw's own output uses only 11 element types, so a short allowlist covers it.
