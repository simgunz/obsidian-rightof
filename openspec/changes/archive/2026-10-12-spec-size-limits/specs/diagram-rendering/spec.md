# Spec Delta

## ADDED Requirements

### Requirement: An oversized diagram shows an error
A reladraw block longer than 64 KB SHALL show an error instead of being drawn. A diagram whose width or height is above 100,000 px, zero, or not a number SHALL also show an error instead of the diagram. These limits keep a note from freezing Obsidian or breaking the layout.

#### Scenario: Block too long
- **WHEN** a reladraw block holds more than 64 KB of text
- **THEN** the block shows an error saying the diagram is longer than 64 KB, and reladraw is not run on it

#### Scenario: Diagram too large
- **WHEN** a block describes a diagram that reladraw sizes above 100,000 px, or as infinite
- **THEN** the block shows an error saying the diagram is too large to display
