# Right Of

An Obsidian plugin that renders [reladraw](https://github.com/reladraw/reladraw) diagrams in your notes. reladraw is a text diagram language where you say where things go: `right of api`, `below worker`, `level with queue`.

Desktop only. The plugin bundles reladraw 0.15.1.

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
- **Theme:** the diagram uses reladraw's light or dark theme to match Obsidian. A diagram that names its own theme, with `diagram theme: nord`, keeps it.
- **Syntax:** see reladraw's [SYNTAX.md](https://github.com/reladraw/reladraw/blob/main/SYNTAX.md).

## Install by hand

The plugin is not in the community plugin list yet.

1. Build it (see [Development](#development)), or take `main.js`, `manifest.json` and `styles.css` from a release.
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

To try the plugin in a real Obsidian without touching your vaults, run:

```bash
scripts/sandbox.sh
```

It creates a throwaway vault from the notes in `tests/vault/`, links the plugin's `main.js`, `manifest.json` and `styles.css` into it, and opens Obsidian with a separate settings directory. On first open, choose **Trust author and enable plugins**. After a rebuild, reload the plugin with the command **Reload app without saving**.

Pass a directory to keep the sandbox between runs: `scripts/sandbox.sh ~/tmp/rightof-sandbox`. Set `RIGHTOF_CDP_PORT=9222` to open a Chrome DevTools Protocol port for automated checks.

Plans and specs live in `openspec/` ([OpenSpec](https://github.com/Fission-AI/OpenSpec)).

## Name

reladraw's NOTICE reserves the name "reladraw" for the upstream project, so this plugin is called Right Of.
