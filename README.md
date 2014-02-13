# literate-jasmine

The idea is to write markdown that gets translated to Jasmine `describe` and
`it` blocks. Because we want to be able to annotate in between parts of what
would become a single `it`, we make use of markdown hierarchy to separate one
test from another and to give the `it` (and `describe` blocks names).

Below, I'll create a `describe` named mathematics with an `it` block named add
can add numbers.

## mathematics
### add can add numbers

    var a = 1,
        b = 2;

    console.log(a, b, a + b);

    expect(a + b).toBe(3);
