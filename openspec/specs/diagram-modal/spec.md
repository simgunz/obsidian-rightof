# diagram-modal Specification

## Purpose
Lets the user look at one reladraw diagram in a large modal, where they can zoom, pan and fit it, while the diagram in the note stays a static image.

## Requirements

### Requirement: An expand button opens the diagram in a modal
A rendered diagram SHALL show an expand button while the pointer is over it, in Reading view and in Live Preview. In Live Preview the button SHALL sit next to Obsidian's edit button without covering it. Pressing it SHALL open that diagram in a large modal and SHALL NOT move the editor cursor into the block.

#### Scenario: Open from Reading view
- **WHEN** the user hovers a rendered diagram in Reading view and presses the expand button
- **THEN** a modal opens that shows the same diagram

#### Scenario: Open from Live Preview
- **WHEN** the user hovers a rendered diagram in Live Preview and presses the expand button
- **THEN** a modal opens with the diagram, and the block in the note still shows the diagram, not its source

#### Scenario: Both buttons are usable
- **WHEN** the user hovers a rendered diagram in Live Preview
- **THEN** the expand button and Obsidian's edit button are both visible and do not overlap

#### Scenario: No button on an error
- **WHEN** a reladraw block shows an error instead of a diagram
- **THEN** the block shows no expand button

### Requirement: A command opens a diagram from the current note
The plugin SHALL provide a command named "Open reladraw diagram". In an editing view it SHALL open the reladraw block that holds the cursor, or else the first reladraw block in the note. In Reading view it SHALL open the first reladraw block. The command SHALL NOT be offered when the active note has no reladraw block.

#### Scenario: Cursor inside a block
- **WHEN** the cursor is inside the second reladraw block of a note and the user runs the command
- **THEN** the modal shows the second diagram

#### Scenario: Cursor outside every block
- **WHEN** the cursor is outside every reladraw block and the user runs the command
- **THEN** the modal shows the first diagram of the note

#### Scenario: Reading view
- **WHEN** the note is in Reading view and the user runs the command
- **THEN** the modal shows the first diagram of the note

#### Scenario: Note without diagrams
- **WHEN** the active note has no reladraw block
- **THEN** the command is not available in the command palette

#### Scenario: Block with an error
- **WHEN** the command opens a reladraw block that cannot be rendered
- **THEN** the modal shows the same error the block shows in the note

### Requirement: The modal opens with the diagram fitted
The modal SHALL take most of the window. When it opens, the diagram SHALL be scaled to fit the modal's viewing area and centred in it, whether that makes it larger or smaller than in the note. The diagram SHALL use the theme it has in the note.

#### Scenario: Small diagram
- **WHEN** a diagram smaller than the modal is opened
- **THEN** it is enlarged until it fills the viewing area in one direction, and centred

#### Scenario: Large diagram
- **WHEN** a diagram larger than the modal is opened
- **THEN** it is shrunk until it fits entirely, and centred

### Requirement: The user can zoom in the modal
In the modal, the mouse wheel SHALL zoom in and out, keeping the point under the pointer in place. The toolbar's zoom-in and zoom-out buttons SHALL zoom in and out around the centre of the viewing area. Zoom SHALL stay between 10% and 1000% of the diagram's natural size. The current zoom SHALL show as a percentage, and clicking it SHALL set the zoom to 100%.

#### Scenario: Wheel zoom toward the pointer
- **WHEN** the user scrolls the wheel up with the pointer over a node
- **THEN** the diagram grows and that node stays under the pointer

#### Scenario: Buttons
- **WHEN** the user presses the zoom-in button
- **THEN** the diagram grows around the centre of the viewing area and the percentage increases

#### Scenario: Limits
- **WHEN** the user keeps zooming out
- **THEN** the zoom stops at 10% and the percentage reads `10%`

#### Scenario: Reset to natural size
- **WHEN** the user clicks the percentage
- **THEN** the zoom becomes 100% and the percentage reads `100%`

### Requirement: The user can pan in the modal
In the modal, dragging with the primary mouse button SHALL move the diagram with the pointer. A drag SHALL NOT activate a link in the diagram when the button is released. A click without a drag SHALL still activate the link under the pointer.

#### Scenario: Drag
- **WHEN** the user drags the diagram 100 pixels to the left
- **THEN** the diagram moves 100 pixels to the left

#### Scenario: Drag ends on a link
- **WHEN** the user starts a drag and releases the button over a node that links somewhere
- **THEN** the link does not open

#### Scenario: Click on a link
- **WHEN** the user clicks a node that links somewhere, without dragging
- **THEN** the link opens

### Requirement: Double-click fits the diagram again
In the modal, a double-click on the viewing area or a press of the toolbar's fit button SHALL fit and centre the diagram, as when the modal opened.

#### Scenario: Back to fitted
- **WHEN** the user has zoomed and panned and then double-clicks the viewing area
- **THEN** the diagram is fitted and centred again

#### Scenario: Fit button
- **WHEN** the user has zoomed and panned and then presses the fit button
- **THEN** the diagram is fitted and centred again

### Requirement: The modal closes the Obsidian way
The modal SHALL close when the user presses Esc, presses its close button, or clicks the backdrop outside it. Closing SHALL leave the note as it was.

#### Scenario: Esc
- **WHEN** the modal is open and the user presses Esc
- **THEN** the modal closes

#### Scenario: Backdrop
- **WHEN** the user clicks outside the modal
- **THEN** the modal closes

### Requirement: The diagram in the note stays static
A diagram in a note SHALL NOT zoom or pan. The mouse wheel over it SHALL scroll the note.

#### Scenario: Wheel over the diagram in the note
- **WHEN** the user turns the wheel with the pointer over a diagram in a note
- **THEN** the note scrolls and the diagram keeps its size
