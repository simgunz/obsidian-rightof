# diagram-rendering Specification

## Purpose
Turns a reladraw code block in an Obsidian note into the diagram it describes, in the views where notes are read, with clear errors and colours that suit the current light or dark mode.

## Requirements

### Requirement: A reladraw block renders as a diagram
A fenced code block whose language is `reladraw` SHALL render as the diagram its text describes, in place of the code, in both Reading view and Live Preview.

#### Scenario: Reading view
- **WHEN** a note holds a valid ```` ```reladraw ```` block and the note is open in Reading view
- **THEN** the block shows the diagram as an image, not the source text

#### Scenario: Live Preview with the cursor outside the block
- **WHEN** a note holds a valid reladraw block and the note is open in Live Preview with the cursor outside the block
- **THEN** the block shows the diagram

#### Scenario: Other code blocks are untouched
- **WHEN** a note holds a code block in another language, such as `mermaid` or `js`
- **THEN** that block renders as it did without the plugin

### Requirement: A wide diagram fits the note
A rendered diagram SHALL never be wider than the note's text column. A diagram that is wider than the column SHALL scale down to fit it, keeping its proportions.

#### Scenario: Diagram wider than the column
- **WHEN** a reladraw block describes a diagram wider than the note's text column
- **THEN** the diagram scales down to the column width and the note gets no horizontal scroll

### Requirement: The block source is edited with Obsidian's own controls
In Live Preview, a rendered reladraw block SHALL offer Obsidian's standard edit-block button, and pressing it SHALL show the block's source in place for editing.

#### Scenario: Edit button shows the source
- **WHEN** the user hovers a rendered reladraw block in Live Preview and presses its edit button
- **THEN** the block's source text appears in the editor, ready to edit

#### Scenario: The diagram follows the edit
- **WHEN** the user changes the source of a reladraw block and moves the cursor out of it
- **THEN** the block renders the changed diagram

### Requirement: An invalid block shows where it is wrong
A reladraw block that cannot be rendered SHALL show an error in place of the diagram. When reladraw names a line, the error SHALL show that line number, counted from the first line inside the block, followed by reladraw's message.

#### Scenario: Error with a line number
- **WHEN** line 3 of a reladraw block contains a statement reladraw refuses
- **THEN** the block shows an error that reads `reladraw: line 3` followed by reladraw's explanation

#### Scenario: Error without a line number
- **WHEN** reladraw fails on a block without naming a line
- **THEN** the block shows an error that starts with `reladraw:` followed by reladraw's message

#### Scenario: Empty block
- **WHEN** a reladraw block contains no statements
- **THEN** the block shows an error, not an empty space

### Requirement: The diagram follows the light or dark mode
A reladraw block that does not name a theme SHALL render with reladraw's light theme while Obsidian is in light mode, and with its dark theme while Obsidian is in dark mode. Its background SHALL be the note's own background colour, so the diagram blends into the note while edge labels still hide the lines behind them, unless the block sets its own background with `diagram background:`.

#### Scenario: Dark mode
- **WHEN** Obsidian is in dark mode and a block names no theme
- **THEN** the diagram uses reladraw's dark theme colours

#### Scenario: Light mode
- **WHEN** Obsidian is in light mode and a block names no theme
- **THEN** the diagram uses reladraw's light theme colours

#### Scenario: Switching mode updates open diagrams
- **WHEN** the user switches Obsidian between light and dark mode while a note with a rendered diagram is open
- **THEN** the diagram re-renders in the matching theme without reopening the note

#### Scenario: Background matches the note
- **WHEN** a block that names no theme renders in a note
- **THEN** the diagram's background has the same colour as the note around it

#### Scenario: A label hides the line under it
- **WHEN** an edge has a label and the line passes behind it
- **THEN** the line is hidden under the label, which stays readable

#### Scenario: Another Obsidian theme
- **WHEN** the user switches to an Obsidian theme with a different background colour while a note with a rendered diagram is open
- **THEN** the diagram re-renders with the new background colour

#### Scenario: The block sets its own background
- **WHEN** a block that names no theme starts with `diagram background: #ffeedd`
- **THEN** the diagram's background is `#ffeedd`, not the note's colour

### Requirement: A diagram that names its theme keeps it
A reladraw block that names its own theme, for example with `diagram theme: nord`, SHALL render in that theme in both light and dark mode.

#### Scenario: Named theme in dark mode
- **WHEN** a block starts with `diagram theme: solarized-light` and Obsidian is in dark mode
- **THEN** the diagram renders in solarized-light, not in reladraw's dark theme

### Requirement: A diagram cannot run code or load outside content
Whatever a reladraw block contains, including a pasted icon, the rendered diagram SHALL contain only drawing elements. It SHALL carry no script, embedded HTML, style sheet, event handler, `style` attribute or reference to anything outside the diagram, in the note and in the modal.

#### Scenario: Pasted icon with embedded HTML and a style sheet
- **WHEN** a block declares an icon whose SVG holds a `foreignObject` with HTML and a `<style>` element
- **THEN** the diagram renders without the HTML and without the style sheet, and the rest of the app looks unchanged

#### Scenario: Remote image
- **WHEN** a pasted icon references an image on another server
- **THEN** the diagram makes no network request for it

#### Scenario: Event handler
- **WHEN** a pasted icon carries an event-handler attribute
- **THEN** the rendered diagram has no event-handler attribute

#### Scenario: Drawing is unchanged
- **WHEN** a block uses only reladraw's own nodes, edges, styles, icons and badges
- **THEN** the cleaned diagram looks exactly like reladraw's output

### Requirement: Links in a diagram open only web pages
A link in a diagram SHALL be kept only when it points to an `http` or `https` address, whether it comes from a node's `url:` or from a pasted icon. Any other link SHALL be removed, leaving its drawing in place. A kept link SHALL open in the user's browser when clicked, in the note and in the modal.

#### Scenario: Web link
- **WHEN** a node has `url: "https://example.com"` and the user clicks it
- **THEN** the page opens in the browser

#### Scenario: Script or file link
- **WHEN** a node has `url: "javascript:…"` or `url: "file:///…"`
- **THEN** the node renders without a link, and clicking it does nothing
