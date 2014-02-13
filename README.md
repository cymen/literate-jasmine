# literate-jasmine [![Build Status](https://travis-ci.org/cymen/literate-jasmine.png?branch=master)](https://travis-ci.org/cymen/literate-jasmine)

[![NPM](https://nodei.co/npm/literate-jasmine.png?downloads=true&stars=true)](https://npmjs.org/package/literate-jasmine)

The idea is to write markdown that gets translated to Jasmine `describe` and
`it` blocks. Because we want to be able to annotate in between parts of what
would become a single `it`, we make use of markdown hierarchy to separate one
test from another and to give the `it` (and `describe` blocks names).

Below I've added this markdown structure (which includes the main header above):

    literate-jasmine
        Mathematices (level 2 header)
           add can add numbers (level 3 header)
              code blocks which can be interspersed with comments
           add can add numbers
        Strings
          appending works with +

This will be parsed to:

    describe('literate-jasmine', function() {
      describe('Mathematics', function() {
        it('add can add numbers', function() {
          // test code
        });
        it('can divide numbers', function() {
          // test code
        });
      });
      describe('Strings', function() {
        it('appending works with +', function() {
          // test code
        });
      });
    });

To actually do the parsing (assuming you ran `npm install -g literate-jasmine`):

    literate-jasmine README.md

Which will create `README_spec.js` with the parsed contents. If you're working on
this project, run `./bin/literate-jasmine` instead.

## Mathematics
### add can add numbers

    var a = 1,
        b = 2;

    console.log(a, b, a + b);

    expect(a + b).toBe(3);

### can divide numbers

    var a = 6,
        b = 2;

And a comment here doesn't break things:

    expect(a/b).toBe(3);

## Strings
### appending works with +

    var text = "abc";

    expect(text + "d").toBe("abcd");
