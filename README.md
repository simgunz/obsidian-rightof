# Right Of

An Obsidian plugin that renders [reladraw](https://github.com/reladraw/reladraw) diagrams in your notes. reladraw is a text diagram language where you say where things go: `right of api`, `below worker`, `level with queue`.

Desktop only, Obsidian 1.5.0 or later. The plugin bundles reladraw 0.15.1.

## Usage

Write the diagram in a `reladraw` code block:

````markdown
```reladraw
node browser  "Browser"
node api      "API server"  right of browser
node db       "Postgres"    right of api
edge browser -> api  "HTTP"
edge api -> db       "SQL"
```
````

The block shows the diagram in Reading view and in Live Preview. To edit it in Live Preview, hover the diagram and press the `</>` button, or move the cursor into the block.

- **Errors:** an invalid block shows `reladraw: line N` and reladraw's explanation in place of the diagram.
- **Theme:** the diagram uses reladraw's light or dark theme to match Obsidian, on the note's own background. A block that names its own theme (`diagram theme: nord`) or background (`diagram background: #ffeedd`) keeps it.
- **Links:** a node's `url:` becomes a link only for `http` and `https` addresses, which open in your browser.
- **Pasted icons:** an icon declared with `icon name """<svg>…</svg>"""` keeps only plain drawing. Scripts, embedded HTML, CSS, images and links to anything but web pages are removed, so a note from someone else cannot run code in Obsidian.
- **Syntax:** see reladraw's [SYNTAX.md](https://github.com/reladraw/reladraw/blob/main/SYNTAX.md).

### Look at a diagram up close

The diagram in the note is a static image. To zoom and pan, open it in a large view:

- Hover the diagram and press the expand button (next to `</>` in Live Preview).
- Or run the command **Right Of: Open reladraw diagram**. It opens the diagram under the cursor, or the note's first diagram. You can bind it to a hotkey in **Settings → Hotkeys**.

In the large view:

| To | Do |
| --- | --- |
| Zoom toward a point | Turn the mouse wheel over it |
| Zoom around the centre | Press the zoom-in or zoom-out button |
| Go back to 100% | Click the percentage |
| Pan | Drag |
| Fit the diagram to the window | Double-click, or press the fit button |
| Close | Esc, the close button, or a click outside |

### Known limits

- The large view keeps the light or dark theme it opened with. Reopen it after switching.
- A diagram inside a callout sits on the note's background colour, not the callout's.
- reladraw lays out the whole diagram on every render, so a very large block can make typing in Live Preview feel slow.

## Install

1. Download `main.js`, `manifest.json` and `styles.css` from the latest release on this repository's Releases page, or build them (see [Development](#development)).
2. Copy the three files into `<your vault>/.obsidian/plugins/rightof/`.
3. In Obsidian, open **Settings → Community plugins**, turn off Restricted mode if it is on, and enable **Right Of**.

## Development

Requires Node 22 or later.

```bash
npm install
npm test          # unit tests
npm run lint
npm run build     # type-checks, then writes main.js
npm run dev       # rebuilds main.js on every change
```

To try the plugin in a real Obsidian without touching your vaults, build it first, then run:

```bash
scripts/sandbox.sh
```

The script needs the `obsidian` command on your `PATH`. It creates a throwaway vault from the notes in `tests/vault/`, links the plugin's `main.js`, `manifest.json` and `styles.css` into it, and opens Obsidian with a separate settings directory. On first open, choose **Trust author and enable plugins**. After a rebuild, reload the plugin with the command **Reload app without saving**.

Pass a directory to reuse a sandbox: `scripts/sandbox.sh ~/tmp/rightof-sandbox`. Each run copies the test notes and the plugin list again, so edits to those are lost; other notes and settings stay. Set `RIGHTOF_CDP_PORT=9222` to open a Chrome DevTools Protocol port for automated checks.

How the code is laid out: the drawing is reladraw's own `compile()`. The plugin picks the theme and background to pass in (`src/render.ts`), cleans the SVG and gives it unique ids (`src/svg.ts`), puts it in the note (`src/display.ts`, `src/DiagramChild.ts`), and zooms and pans it in the large view (`src/DiagramModal.ts`, `src/viewport.ts`). Plans and specs live in `openspec/` ([OpenSpec](https://github.com/Fission-AI/OpenSpec)).

## Name

reladraw's NOTICE reserves the name "reladraw" for the upstream project, so this plugin is called Right Of.

## License

MIT, see [LICENSE](LICENSE). The bundled reladraw is Apache-2.0; its license and notices are included at the top of `main.js`.
