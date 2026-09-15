# Launch Watcher — `loadAtLaunch` and `headless`

Starts when SketchUp does, with no window, and counts model changes until asked to report.

## What it shows

- **Two settings working together.** `"window": { "type": "headless" }` means the extension never
  gets a window; `"loadAtLaunch": true` means its page is created at startup instead of waiting for
  a menu click. Together they give you an extension that is already running before the user asks
  for anything.
- **Reporting without a window.** A headless extension has nowhere to draw, so this one talks back
  through `console.log` and through a host dialog raised from a menu command — `getModalInput()`
  with no `inputs` is a plain message box and needs no window of its own.
- **`ui.on()` registered before `connect()`.** A headless extension is typically already running
  when the user picks its menu item, so a handler registered after connecting can miss the command.
- **`observeActiveModel()`**, including the difference between the model *changing*
  (`isModelChanged`) and the user switching to a *different* model (`isDifferentModel`).

## Worth knowing

A headless extension still loads an HTML page — it is simply never shown. There is no point styling
it, and `index.html` here is deliberately empty apart from the two script tags.
