/*!
**  JSON-ASTy -- Lossless JSON-to-AST Parser and AST-to-JSON Generator
**  Copyright (c) 2018 Ralf S. Engelschall <rse@engelschall.com>
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

{
    var unroll = options.util.makeUnroll(location, options)
    var ast    = options.util.makeAST   (location, options)
}

json
    =   prolog:(ws {
            return ast("text-prolog").set({ text: text() })
        })?
        value:(value:value {
            return ast("json-value").add(value)
        })
        epilog:(ws {
            return ast("text-epilog").set({ text: text() })
        })?
        eof {
            return ast("json").add(prolog, value, epilog)
        }

value
    =   valueObject
    /   valueArray
    /   valueNumber
    /   valueString
    /   valueNull
    /   valueFalse
    /   valueTrue

valueObject
    =   prolog:(ws? "{" ws? {
            return ast("text-prolog").set({ text: text() })
        })
        members:(
            head:member
            tail:(
                sep:(ws? "," ws? {
                    return ast("text-sep").set({ text: text() })
                })
                member
            )* {
                return tail.reduce((memo, curr) => memo.concat(curr), [ head ])
            }
        )?
        epilog:(ws? "}" ws? {
            return ast("text-epilog").set({ text: text() })
        }) {
            return ast("value-object").add(prolog, members, epilog)
        }

member
    =   name:(name:valueString {
            return ast("object-member-name").add(name)
        })
        sep:(ws? ":" ws? {
            return ast("text-sep").set({ text: text() })
        })
        value:(value:value { /* RECURSION */
            return ast("object-member-value").add(value)
        }) {
            return ast("object-member").add(name, sep, value)
        }

valueArray
    =   prolog:($(ws? "[" ws?) {
            return ast("text-prolog").set({ text: text() })
        })
        values:(
            head:value /* RECURSION */
            tail:(
                sep:(ws? "," ws? {
                    return ast("text-sep").set({ text: text() })
                })
                value /* RECURSION */
            )* {
                return tail
                    .reduce((memo, curr) => memo.concat(curr), [ head ])
                    .map((node) => ast("array-value").add(node))
            }
        )?
        epilog:($(ws? "]" ws?) {
            return ast("text-epilog").set({ text: text() })
        }) {
            return ast("value-array").add(prolog, values, epilog)
        }

valueNumber "number literal value"
    =   "-"?
        int:("0" / ([1-9] [0-9]*))
        frac:("." [0-9]+)?
        exp:([eE] ("-" / "+")? [0-9]+)? {
            return ast("value-number").set({ text: text(), value: parseFloat(text()) })
        }

valueString "quoted string literal value"
    =   '"'
        chars:(
            [^\0-\x1F\x22\x5C]
            / "\\" char:(
                  '"'
                / "\\"
                / "/"
                / "b" { return "\b" }
                / "f" { return "\f" }
                / "n" { return "\n" }
                / "r" { return "\r" }
                / "t" { return "\t" }
                / "u" digits:$([0-9a-f]i [0-9a-f]i [0-9a-f]i [0-9a-f]i) {
                    return String.fromCharCode(parseInt(digits, 16))
                }
            ) {
                return char
            }
        )*
        '"' {
            return ast("value-string").set({ text: text(), value: chars.join("") })
        }

valueNull "object null literal value"
    =   "null" {
            return ast("value-null").set({ text: text(), value: null })
        }

valueFalse "boolean false literal value"
    =   "false" {
            return ast("value-boolean").set({ text: text(), value: false })
        }

valueTrue "boolean true literal value"
    =   "true" {
            return ast("value-boolean").set({ text: text(), value: true })
        }

ws "whitespace"
    =   [ \t\n\r]+

eof "end of file"
    =   !.

