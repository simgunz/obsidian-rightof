# Spec Delta

## MODIFIED Requirements

### Requirement: The diagram follows the light or dark mode
A reladraw block that does not name a theme SHALL render with reladraw's light theme while Obsidian is in light mode, and with its dark theme while Obsidian is in dark mode. Its background SHALL be the note's own background colour, so the diagram blends into the note while edge labels still hide the lines behind them.

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
