# Spec Delta

## ADDED Requirements

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
