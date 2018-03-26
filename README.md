
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
        "bar": true ,
        "baz": 42.0,
        "quux": [ "test1\\"test2", "test3" ]
    }
}`
console.log(`JSON (old):\n${json}`)

/*  parse JSON into AST  */
let ast = JsonAsty.parse(json)
console.log(`AST Dump (all):\n${JsonAsty.dump(ast, { colors: true })}`)

/*  the AST query  */
let query = `
    .// object-member [
        ..// object-member [
            / object-member-name
                / value-string [ @value == "foo" ]
        ]
        &&
        / object-member-name
            / value-string [ @value == "baz" ]
    ]
        / object-member-value
`
console.log(`AST Query:\n${query}`)

/*  query AST node  */
let nodes = ast.query(query)
let node = nodes[0]
console.log(`AST Dump (sub, old):\n${node.dump()}`)

/*  manipulate AST node  */
node.childs().forEach((child) => node.del(child))
node.add(node.create("value-string").set({ value: "TEST" }))
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
        "bar": true ,
        "baz": 42.0,
        "quux": [ "test1\"test2", "test3" ]
    }
}
AST Dump (all):
json [1,1]
└── json-value [1,1]
    └── value-object [1,1]
        ├── text-prolog (text: "{\n    ") [1,1]
        ├── object-member [2,5]
        │   ├── object-member-name [2,5]
        │   │   └── value-string (text: "\"foo\"", value: "foo") [2,5]
        │   ├── text-sep (text: ": ") [2,10]
        │   └── object-member-value [2,12]
        │       └── value-object [2,12]
        │           ├── text-prolog (text: "{\n        ") [2,12]
        │           ├── object-member [3,9]
        │           │   ├── object-member-name [3,9]
        │           │   │   └── value-string (text: "\"bar\"", value: "bar") [3,9]
        │           │   ├── text-sep (text: ": ") [3,14]
        │           │   └── object-member-value [3,16]
        │           │       └── value-boolean (text: "true", value: true) [3,16]
        │           ├── text-sep (text: " ,\n        ") [3,20]
        │           ├── object-member [4,9]
        │           │   ├── object-member-name [4,9]
        │           │   │   └── value-string (text: "\"baz\"", value: "baz") [4,9]
        │           │   ├── text-sep (text: ": ") [4,14]
        │           │   └── object-member-value [4,16]
        │           │       └── value-number (text: "42.0", value: 42) [4,16]
        │           ├── text-sep (text: ",\n        ") [4,20]
        │           ├── object-member [5,9]
        │           │   ├── object-member-name [5,9]
        │           │   │   └── value-string (text: "\"quux\"", value: "quux") [5,9]
        │           │   ├── text-sep (text: ": ") [5,15]
        │           │   └── object-member-value [5,17]
        │           │       └── value-array [5,17]
        │           │           ├── text-prolog (text: "[ ") [5,17]
        │           │           ├── array-value [5,19]
        │           │           │   └── value-string (text: "\"test1\\\"test2\"", value: "test1\"test2") [5,19]
        │           │           ├── array-value [5,19]
        │           │           │   └── text-sep (text: ", ") [5,33]
        │           │           ├── array-value [5,19]
        │           │           │   └── value-string (text: "\"test3\"", value: "test3") [5,35]
        │           │           └── text-epilog (text: " ]\n    ") [5,42]
        │           └── text-epilog (text: "}\n") [6,5]
        └── text-epilog (text: "}") [7,1]

AST Query:

    .// object-member [
        ..// object-member [
            / object-member-name
                / value-string [ @value == "foo" ]
        ]
        &&
        / object-member-name
            / value-string [ @value == "baz" ]
    ]
        / object-member-value

AST Dump (sub, old):
object-member-value [4,16]
└── value-number (text: "42.0", value: 42) [4,16]

AST Dump (sub, new):
object-member-value [4,16]
└── value-string (value: "TEST") [0,0]

JSON (new):
{
    "foo": {
        "bar": true ,
        "baz": "TEST",
        "quux": [ "test1\"test2", "test3" ]
    }
}
```

License
-------

Copyright (c) 2018 Ralf S. Engelschall (http://engelschall.com/)

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

