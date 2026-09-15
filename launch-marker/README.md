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

## Worth knowing

A headless extension is **not** reloaded when the user opens a different model — it keeps running
and the model changes underneath it. Drawing only at startup would mark the first model and nothing
after it, so the extension also watches `observeActiveModel()` and marks each new model it sees.

`isDifferentModel()` compares against the model you pass it, so it has to be the *previously seen*
one — passing the model you just read from the same callback always answers "same". Every edit
fires the observer too, including the marker's own, which is why only a genuine model change
redraws.
