# Proposal

## Why

A diagram in a note is scaled down to the text column, so a large one becomes hard to read. The user needs a way to look at it big, zoom into a detail and move around, without turning the note itself into a zoomable canvas that fights with page scrolling.

## What Changes

- A rendered diagram gets an expand button, shown on hover next to Obsidian's `</>` button. It opens the diagram in a large modal.
- A command, "Open reladraw diagram", opens the diagram under the cursor, or else the first diagram in the note. It can be bound to a hotkey.
- In the modal: the diagram opens fitted to the window. The wheel zooms toward the pointer, `-` and `+` zoom around the centre, a drag pans, a double-click fits again, and the current zoom shows as a percentage that resets to 100% when clicked.
- Esc, the close button or a click on the backdrop closes the modal.
- The diagram in the note stays static: no zoom or pan there.

Out of scope: mobile and touch gestures, keyboard zoom shortcuts, export from the modal, an editor inside the modal, and a click on the diagram opening the modal.

## Capabilities

### New Capabilities
- `diagram-modal`: viewing one diagram in a large modal: how it opens, and how the user zooms, pans, fits and closes it.

### Modified Capabilities

None. `diagram-rendering` keeps its requirements: the expand button is part of `diagram-modal`.

## Impact

- New modules for the modal, the zoom and pan state, and finding reladraw blocks in a note's text.
- `DiagramChild` adds the expand button. `main.ts` registers the command.
- `styles.css` gains the modal, toolbar and button styles.
- No new dependencies.
