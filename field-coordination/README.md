# Field Notes — field coordination

Pins a leader-line note to the current selection and files that geometry under a coloured
**Field Notes** tag.

## What it shows

- **Reacting to the selection.** `observeSelectionMetadata()` streams counts and flags only, never
  the entities themselves, which is what makes it cheap enough to leave running while the panel is
  open. Call `getSelection()` when you actually need the entities.
- **Reads do not need an operation.** Bounding boxes are fetched outside `performOperation()`;
  only the writes go inside it.
- **Reusing a tag instead of duplicating it.** The tag manager is checked for an existing
  `Field Notes` tag before one is created, so running the tool repeatedly does not pile up
  duplicates.
- **2D versus 3D text.** Passing a leader vector to `createText()` produces a 3D annotation with a
  leader line. Omit the vector and you get a 2D screen-space label that always faces the camera.

## Worth knowing

`BoundingBox.add()` unions boxes, so folding the per-entity boxes together gives you the extent of
the whole selection. The note is anchored at the centre in X and Y but the **top** in Z, so the
leader rises out of the geometry rather than through it.
