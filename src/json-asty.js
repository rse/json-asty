/*
**  JSON-ASTy -- Lossless JSON-to-AST Parser and AST-to-JSON Generator
**  Copyright (c) 2018-2023 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

/*  external requirements  */
const ASTY        = require("asty-astq")
const PEG         = require("pegjs-otf")
const PEGUtil     = require("pegjs-util")
const chalk       = require("chalk")

/*  pre-parse PEG grammar (replaced by browserify)  */
const PEGparser = PEG.generateFromFile(`${__dirname}/json-asty.pegjs`, {
    optimize: "size",
    trace: false
})

/*  the API class  */
class JsonAsty {
    /*  parse JSON into AST  */
    static parse (json) {
        /*  sanity check argument  */
        if (typeof json !== "string")
            throw new Error("invalid JSON argument (expected type string)")

        /*  parse specification into Abstract Syntax Tree (AST)  */
        const asty = new ASTY()
        const result = PEGUtil.parse(PEGparser, json, {
            startRule: "json",
            makeAST: (line, column, offset, args) => {
                return asty.create.apply(asty, args).pos(line, column, offset)
            }
        })
        if (result.error !== null)
            throw new Error("parse: JSON parsing failure:\n" +
                PEGUtil.errorMessage(result.error, true).replace(/^/mg, "ERROR: ") + "\n")
        return result.ast
    }

    /*  dump AST (with optional colorization)  */
    static dump (ast, options = {}) {
        /*  determine options  */
        options = Object.assign({}, {
            colors: false
        }, options)

        /* eslint no-console: off */
        let output
        if (options.colors) {
            output = ast.dump(Infinity, (type, text) => {
                switch (type) {
                    case "tree":     text = chalk.grey(text);   break
                    case "type":     text = chalk.blue(text);   break
                    case "value":    text = chalk.yellow(text); break
                    case "position": text = chalk.grey(text);   break
                    default:
                }
                return text
            })
        }
        else
            output = ast.dump(Infinity)
        return output
    }

    /*  unparse AST into JSON  */
    static unparse (ast) {
        /*  sanity check arguments  */
        if (typeof ast !== "object")
            throw new Error("generate: invalid AST argument (expected type object)")

        /*  walk the AST  */
        let json = ""
        ast.walk((node, depth, parent, when) => {
            if (when === "downward") {
                const prolog = node.get("prolog")
                if (prolog !== undefined)
                    json += prolog
                const body = node.get("body")
                if (body !== undefined)
                    json += body
                else {
                    const value = node.get("value")
                    if (value !== undefined)
                        json += JSON.stringify(value)
                }
            }
            else if (when === "upward") {
                const epilog = node.get("epilog")
                if (epilog !== undefined)
                    json += epilog
            }
        }, "both")
        return json
    }
}

/*  export the API class  */
module.exports = JsonAsty

