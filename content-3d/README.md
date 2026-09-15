# Bollard Stamper — content and 3D support

Builds one component definition and places many instances of it along a row.

## What it shows

- **Definitions versus instances.** The geometry is authored once, inside the definition. Each
  instance is just a transformation pointing at that definition, so editing the definition later
  updates every instance at once.
- **Reusing a definition.** `getDefinitions()` is checked for a previous run's component before a
  new one is created, so stamping twice adds instances rather than a second identical component.
- **The translation shorthand.** A plain `[x, y, z]` array is a valid transformation, so placing
  something does not require building a full 4×4 matrix.
- **`createCircle` and `createFaceFromEdges`.** The circle hands back both a curve and the edges
  that make it up; the edges are what you close a face across before push-pulling it.

## Worth knowing

Geometry created inside a definition is positioned relative to that definition's own origin, not
the model's — which is why the bollard is built at `[0, 0, 0]` and moved into place by the
instance transformation instead.
