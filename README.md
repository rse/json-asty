
JSON-ASTy
=========

Lossless JSON-to-AST Parser and AST-to-JSON Generator

<p/>
<img src="https://nodei.co/npm/json-asty.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/json-asty.png" alt=""/>

About
-----

JSON-ASTy is a JavaScript library providing a lossless JavaScript Object
Notation (JSON) to Abstract Syntax Tree (AST) parser and a corresponding
AST to JSON generator. It is intended for cases where one has to read
JSON into an AST, manipulate the AST and generate JSON from the AST
again while fully preserving the formatting of the original JSON.
The AST is based on [ASTy-ASTq](http://npmjs.com/asty-astq), and
hence can powerfully queried with [ASTq](http://npmjs.com/astq), and
manipulated with [ASTy](http://npmjs.com/asty).

Installation
------------

```shell
$ npm install json-asty
```

Usage
-----

```js
const JsonAsty = require("json-asty")

/*  the JSON input  */
let json = `{
    "foo": {
        "bar": true,
        "baz": 42.0,
        "quux": [ "test1\\"test2", "test3", 7, true ]
    }
}`
console.log(`JSON (old):\n${json}`)

/*  parse JSON into AST  */
let ast = JsonAsty.parse(json)
console.log(`AST Dump (all):\n${JsonAsty.dump(ast, { colors: true })}`)

/*  the AST query  */
let query = `
    .// member [
        ..// member [
            / string [ pos() == 1 && @value == "foo" ]
        ]
        &&
        / string [ pos() == 1 && @value == "baz" ]
    ]
        / * [ pos() == 2 ]
`
console.log(`AST Query:\n${query}`)

/*  query AST node  */
let nodes = ast.query(query)
let node = nodes[0]
console.log(`AST Dump (sub, old):\n${node.dump()}`)

/*  manipulate AST node  */
let nodeNew = node.create("string").set({ value: "TEST" })
node.parent().del(node).add(nodeNew)
console.log(`AST Dump (sub, new):\n${node.dump()}`)

/*  unparse AST into JSON  */
let jsonNew = JsonAsty.unparse(ast)
console.log(`JSON (new):\n${jsonNew}`)
```

Output:

```
JSON (old):
{
    "foo": {
        "bar": true,
        "baz": 42.0,
        "quux": [ "test1\"test2", "test3", 7, true ]
    }
}
AST Dump (all):
object (prolog: "{\n    ", epilog: "}") [1,1]
└── member [2,5]
    ├── string (body: "\"foo\"", value: "foo", epilog: ": ") [2,5]
    └── object (prolog: "{\n        ", epilog: "}\n") [2,12]
        ├── member (epilog: ",\n        ") [3,9]
        │   ├── string (body: "\"bar\"", value: "bar", epilog: ": ") [3,9]
        │   └── boolean (body: "true", value: true) [3,16]
        ├── member (epilog: ",\n        ") [4,9]
        │   ├── string (body: "\"baz\"", value: "baz", epilog: ": ") [4,9]
        │   └── number (body: "42.0", value: 42) [4,16]
        └── member [5,9]
            ├── string (body: "\"quux\"", value: "quux", epilog: ": ") [5,9]
            └── array (prolog: "[ ", epilog: " ]\n    ") [5,17]
                ├── string (body: "\"test1\\\"test2\"", value: "test1\"test2", epilog: ", ") [5,19]
                ├── string (body: "\"test3\"", value: "test3", epilog: ", ") [5,35]
                ├── number (body: "7", value: 7, epilog: ", ") [5,44]
                └── boolean (body: "true", value: true) [5,47]

AST Query:

    .// member [
        ..// member [
            / string [ pos() == 1 && @value == "foo" ]
        ]
        &&
        / string [ pos() == 1 && @value == "baz" ]
    ]
        / * [ pos() == 2 ]

AST Dump (sub, old):
number (body: "42.0", value: 42) [4,16]

AST Dump (sub, new):
number (body: "42.0", value: 42) [4,16]

JSON (new):
{
    "foo": {
        "bar": true,
        "baz": "TEST",
        "quux": [ "test1\"test2", "test3", 7, true ]
    }
}
```

License
-------

Copyright (c) 2018-2019 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

