# Entity Report

Counts the top-level entities in the model, grouped by type.

## What it shows

- **A read-only extension.** Counting needs no operation; only writes do.
- **`entities.get()`** returns the model root — it does not recurse into groups or component
  instances, which keeps the pass bounded.
- **Turning a type into a name.** `entity.type` is a number; indexing `SketchUpApi.EntityType`
  through itself gives you something printable.

## Worth knowing

This sample declares `"window": { "type": "tab" }`. Not every host implements every window type; one
that does not falls back to a floating window rather than refusing the extension, so declaring a
type costs you the layout you asked for, never the extension itself. Write the page so it works at
either width and you never have to care which you got.
