# Room Blocker — space planning

Blocks out a room volume from a width, a depth and a height, as a named group.

## What it shows

- **Unit conversion.** SketchUp stores geometry in inches no matter what the model's display
  units say, so the feet you type are multiplied by 12 before they reach the API.
- **One operation, one undo.** `createGroup`, `createFace`, `facePushPull` and `groupSetName` all
  run inside a single `performOperation()` call, so the whole room is one entry in the undo stack.
- **Face winding.** The floor rectangle is wound counter-clockwise so its front faces up and a
  positive `facePushPull` distance raises walls instead of sinking them.
- **`getModalInput()`** for asking the user a question in a host dialog.

## Worth knowing

Modal inputs are text-only — `widgetType` must be `'text'` and `valueType` must be `'string'`.
There are no numeric fields, dropdowns or checkboxes, so you parse and validate the strings
yourself. `response.action` can be `'cancel'` whichever action set you asked for, because the user
can always dismiss the dialog.
