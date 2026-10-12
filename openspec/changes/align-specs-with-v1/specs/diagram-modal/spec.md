# Spec Delta

## MODIFIED Requirements

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

### Requirement: Double-click fits the diagram again
In the modal, a double-click on the viewing area or a press of the toolbar's fit button SHALL fit and centre the diagram, as when the modal opened.

#### Scenario: Back to fitted
- **WHEN** the user has zoomed and panned and then double-clicks the viewing area
- **THEN** the diagram is fitted and centred again

#### Scenario: Fit button
- **WHEN** the user has zoomed and panned and then presses the fit button
- **THEN** the diagram is fitted and centred again
