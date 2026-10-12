# Tasks

## 1. Docs

- [x] 1.1 Update README.md to match: zoom buttons by name, the build step and PATH requirement before the sandbox, what a reused sandbox directory overwrites, `diagram background:`, the minimum Obsidian version, known limits (the modal keeps the theme it opened with; diagrams in callouts show the note background; very large diagrams can slow typing), and move "How it works" under Development. Verify that each statement matches the code
- [x] 1.2 Update `openspec/config.yaml` context: state classes use Obsidian's `is-*` names, and `display.ts` relies on Obsidian's DOM helpers while the other pure modules stay testable in jsdom. Verify with `openspec validate --all --strict`

## Workflow follow-up

- Archive the change.
