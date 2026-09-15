# Tab Dashboard — the `tab` window type

A wide, multi-column dashboard that also reports which window the host actually gave it.

## What it shows

- **Declaring `"type": "tab"`.** A host that does not implement the type you asked for falls back
  to a floating window rather than refusing the extension, so an unsupported type costs you the
  layout, never the extension.
- **Detecting the fallback.** Nothing tells your page which window type it got, so the sample
  measures its own viewport against the width the manifest requested and says which it looks like.
  That is a heuristic for testing, not a protocol call — there is no API that reports the type back.
- **A layout that degrades.** The CSS grid uses `auto-fit`/`minmax`, so the three columns collapse
  to one if the extension ends up in a narrow window.

## Worth knowing

Window size is a request, not a guarantee. Write the page so it works at both widths and you never
have to care which one you got.
