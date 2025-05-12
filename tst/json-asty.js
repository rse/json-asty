/*
**  JSON-ASTy -- Lossless JSON-to-AST Parser and AST-to-JSON Generator
**  Copyright (c) 2018-2025 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const chai = require("chai")
const { expect } = chai
chai.config.includeStack = true

const JsonAsty = require("../lib/json-asty.node.js")

describe("JSON-ASTy Library", () => {
    it("API availability", function () {
        expect(JsonAsty.parse).to.be.a("function")
        expect(JsonAsty.dump).to.be.a("function")
        expect(JsonAsty.unparse).to.be.a("function")
    })
    it("base functionality", () => {
        /* eslint quotes: off */
        const samples = [
            "true", "false", "null",
            "42", "42.7", "42.7e-10",
            '"foo"', '"foo bar"', '"foo\\"bar"',
            '[ "foo", 42, 42.7, true ]',
            '{ "foo": "foo", "bar": 42, "baz": 42.7, "quux": true }',
            '{ "foo": { "bar": [ "baz", "quux" ] } }'
        ]
        samples.forEach((json) => {
            expect(JsonAsty.unparse(JsonAsty.parse(json))).to.be.equal(json)
        })
    })
})

