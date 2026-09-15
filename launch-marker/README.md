# Launch Marker — `loadAtLaunch` and `headless`

Draws a marker cube at the origin when SketchUp starts.

## What it shows

- **`"loadAtLaunch": true`** creates the extension's page when SketchUp starts, instead of waiting
  for a menu click.
- **`"window": { "type": "headless" }`** means it never gets a window. With no window to draw in,
  the only proof it ran is what it does to the model — hence the marker.
- **A write from a background extension.** The cube is one `performOperation()`, so it is a single
  undo step like any other edit.

The menu command draws the same marker again. Both paths call the same function and neither depends
on the other having run, so there is no ordering to get wrong.
