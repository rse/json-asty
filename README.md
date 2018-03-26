
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

let json = `{
    "foo": {
        "bar": true ,
        "baz": 42.0,
        "quux": [ "test1\\"test2", "test3" ]
    }
}`

let ast = JsonAsty.parse(json)

console.log(JsonAsty.dump(ast, { colors: true }))

let json2 = JsonAsty.unparse(ast)

if (json !== json2)
    throw new Error("failed to unparse AST into equal JSON")

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

