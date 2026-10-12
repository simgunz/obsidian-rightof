# Proposal

## Why

A review before 1.0 found places where the specs say something the plugin doesn't do:
- The specs talk about `+` and `-` buttons, but the toolbar buttons are icons, and there are no keys.
- They leave out the fit button.
- They promise the note's background even when a block sets its own `diagram background:`, which reladraw always honours.

The README repeats some of these mistakes. This change makes the specs and docs describe v1 as it is. The plugin's behaviour does not change.

## What Changes

- `diagram-modal`: name the zoom-in and zoom-out buttons by what they are, and add the fit button to the fit requirement.
- `diagram-rendering`: a block's own `diagram background:` wins over the note's background.
- The README and `openspec/config.yaml` are corrected to match: build before the sandbox, the minimum Obsidian version, known limits, and the class naming rule.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `diagram-modal`: the zoom and fit requirements, worded to match the toolbar.
- `diagram-rendering`: the light/dark requirement, which now allows a block's own background.

## Impact

Docs and specs only: README.md, openspec/config.yaml and the two main specs. No code changes.
