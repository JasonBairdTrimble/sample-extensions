# Scene Switcher — visualization

Lists the model's scenes and styles, and switches between them.

## What it shows

- **Which calls need an operation and which do not.** Activating a scene is a plain
  `await model.setCurrentScene(scene)` — it changes the view, not the model. Selecting a style *is*
  a model edit, so it goes inside `performOperation()` and lands in the undo stack. Getting this
  wrong is a common early mistake.
- **Reading the current state back.** `getCurrentScene()` and `getSelectedStyle()` are what let the
  list mark the active entry, and both are re-read after a switch rather than assumed.
- **Defensive naming.** A scene's `name` can be `undefined`, so the list falls back to its `label`
  and then its `id`.

## Worth knowing

`getSelectedStyle()` returns a wrapper, not a style — the style itself is on `.style`, alongside an
`.info` object carrying `hasBeenModified` and `fileName`.
