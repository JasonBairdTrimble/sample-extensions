# Sample Extensions

Working extensions to start from instead of a blank page. Each folder is complete and independent:
a `manifest.json`, an `index.html`, an `app.js` and a `style.css`, with no build step, no
dependencies and nothing shared between them.

| Folder | Extension | Illustrates |
|---|---|---|
| [`space-planning/`](space-planning) | Room Blocker | Units, one operation per undo, face winding, modal input |
| [`field-coordination/`](field-coordination) | Field Notes | Selection streaming, tags, leader-line text |
| [`model-cleanup/`](model-cleanup) | Model Report | Querying entities, entity types, purging unused assets |
| [`content-3d/`](content-3d) | Bollard Stamper | Component definitions versus instances, transformations |
| [`visualization/`](visualization) | Scene Switcher | Scenes, styles, and which calls need an operation |

## Branching from one

Copy a folder, then change two things in its `manifest.json` before loading it:

- **`id`** — must be unique.
- **`name`** — what you will look for in the Extensions menu.

## Notes

Each sample loads the SDK and calls `SketchUpApi.connect()` once before anything else. Register any
`SketchUpApi.ui.on()` handlers *before* connecting, so a command that fires while the page is still
loading is not missed.

Two things that catch people out early:

- **Geometry is in inches**, always, whatever the model's display units are set to. Convert before
  you hand numbers to the API.
- **Reads do not need an operation; writes do.** Anything that changes the model goes inside
  `model.performOperation(fn, 'Name')`, and everything in one call becomes one undo step.
