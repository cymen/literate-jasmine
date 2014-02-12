literate-jasmine
----------------

The idea is to write markdown that gets translated to Jasmine `describe` and
`it` blocks. Because we want to be able to annotate in between parts of what
would become a single `it`, we make use of markdown hierarchy to separate one
test from another and to give the `it` (and `describe` blocks names).
