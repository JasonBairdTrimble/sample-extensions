# Model Report — model cleanup

Tallies what sits at the model root, counts the model-wide assets, and purges the unused ones.

## What it shows

- **A read pass, then one write.** Counting needs no operation at all. The purge puts all three
  calls — materials, components, styles — inside a single `performOperation()`, so the user undoes
  the cleanup in one step rather than three.
- **Turning an entity type back into a name.** `entity.type` is the numeric
  `SketchUpApi.EntityType` value; indexing the enum through itself gives you something printable.
- **`ui.on()` registered before `connect()`.** SketchUp lazy-loads the page when a menu item is
  clicked, so a handler registered after connecting can miss the very click that opened it.

## Worth knowing

`entities.get()` returns the model **root** only — it does not recurse into groups or component
instances. That is deliberate here: it keeps the pass bounded. If you need a deep count, walk the
children yourself and stream the results rather than materialising a whole large model in
JavaScript at once.
