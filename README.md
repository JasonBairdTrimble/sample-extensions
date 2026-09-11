# Paste Check

A minimal JSA extension for testing SUMXR-5401: push this directory to the root of a **public**
GitHub repository, then paste that repository's address into Extension Manager → Add an Extension
on iPad.

The window reports, in order, whether the mirrored origin served the page as HTML, applied a
stylesheet, ran a script, is a secure context, and reached the JSA host. Four of those five are the
things that raw GitHub URLs could not do.
