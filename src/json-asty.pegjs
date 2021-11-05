/*!
**  JSON-ASTy -- Lossless JSON-to-AST Parser and AST-to-JSON Generator
**  Copyright (c) 2018-2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
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
    var ast = options.util.makeAST(location, options)
}

json
    =   prolog:ws?
        value:value
        epilog:ws?
        eof {
            if (prolog) value.set("prolog", prolog + (value.get("prolog") || ""))
            if (epilog) value.set("epilog", (value.get("epilog") || "") + epilog)
            return value
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
    =   prolog:$(ws? "{" ws?)
        members:(
            head:member
            tail:(
                $(ws? "," ws?)
                member
            )* {
                return tail.reduce((memo, curr) => {
                    var prevNode = memo[memo.length - 1];
                    prevNode.set({ epilog: (prevNode.get("epilog") || "") + curr[0] })
                    return memo.concat([ curr[1] ])
                }, [ head ])
            }
        )?
        epilog:$(ws? "}" ws?) {
            return ast("object")
                .set({ prolog: prolog })
                .set({ epilog: epilog })
                .add(members)
        }

member
    =   name:valueString
        sep:$(ws? ":" ws?)
        value:value { /* RECURSION */
            return ast("member")
                .add(name.set({ epilog: sep }), value)
        }

valueArray
    =   prolog:$(ws? "[" ws?)
        values:(
            head:value /* RECURSION */
            tail:(
                $(ws? "," ws?)
                value /* RECURSION */
            )* {
                return tail.reduce((memo, curr) => {
                    var prevNode = memo[memo.length - 1];
                    prevNode.set({ epilog: (prevNode.get("epilog") || "") + curr[0] })
                    return memo.concat([ curr[1] ])
                }, [ head ])
            }
        )?
        epilog:$(ws? "]" ws?) {
            return ast("array")
                .set({ prolog: prolog })
                .set({ epilog: epilog })
                .add(values)
        }

valueNumber "number literal value"
    =   "-"?
        int:("0" / ([1-9] [0-9]*))
        frac:("." [0-9]+)?
        exp:([eE] ("-" / "+")? [0-9]+)? {
            return ast("number").set({ body: text(), value: parseFloat(text()) })
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
            return ast("string").set({ body: text(), value: chars.join("") })
        }

valueNull "object null literal value"
    =   "null" {
            return ast("null").set({ body: text(), value: null })
        }

valueFalse "boolean false literal value"
    =   "false" {
            return ast("boolean").set({ body: text(), value: false })
        }

valueTrue "boolean true literal value"
    =   "true" {
            return ast("boolean").set({ body: text(), value: true })
        }

ws "whitespace"
    =   [ \t\n\r]+

eof "end of file"
    =   !.

