#!/usr/bin/env node
/*!
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

/*  external requirements  */
const yargs    = require("yargs")
const CLIio    = require("cli-io")
const JsonAsty = require("..")

/*  establish CLI environment  */
const cli = new CLIio({
    encoding:  "utf8",
    logLevel:  "warning",
    logPrefix: "json-asty",
    logTime:   false
})

/*  execute in asynchronous context  */
;(async () => {
    /*  load my own information  */
    const my = require("../package.json")

    /*  command-line option parsing  */
    const argv = yargs
        .usage("Usage: $0 [-h] [-V] [-i input-file|-] [-o output-file|-] [-p object-path] [-t field-type] [-v field-value]")
        .help("h").alias("h", "help").default("h", false)
        .describe("h", "show usage help")
        .boolean("V").alias("V", "version").default("V", false)
        .describe("V", "show program version information")
        .string("i").nargs("i", 1).alias("i", "input").default("i", "-")
        .describe("i", "JSON input file (or stdin)")
        .string("o").nargs("o", 1).alias("o", "output").default("o", "-")
        .describe("o", "JSON output file (or stdout)")
        .string("p").nargs("p", 1).alias("p", "path").default("p", "")
        .describe("p", "dot-separated path to object field")
        .string("t").nargs("t", 1).alias("t", "type").default("t", "string")
        .describe("t", "type of object field (boolean, number, string)")
        .string("v").nargs("v", 1).alias("v", "value").default("v", "")
        .describe("v", "value of object field to set")
        .strict()
        .showHelpOnFail(true)
        .demand(0)
        .parse(process.argv.slice(2))

    /*  short-circuit processing of "-V" command-line option  */
    if (argv.version) {
        process.stderr.write(my.name + " " + my.version + " <" + my.homepage + ">\n")
        process.stderr.write(my.description + "\n")
        process.stderr.write("Copyright (c) 2018-2025 " + my.author.name + " <" + my.author.url + ">\n")
        process.stderr.write("Licensed under " + my.license + " <http://spdx.org/licenses/" + my.license + ".html>\n")
        process.exit(0)
    }

    /*  sanity check usage  */
    if (!argv.path)
        throw new Error("path to object field is required (see option -p|--path)")

    /*  helper function: convert object path to XPath  */
    const opath2xpath = (opath) => {
        let xpath = ""
        const segments = opath.split(".")
        for (const segment of segments) {
            const escapedSegment = segment.replace(/"/g, "\\\"")
            xpath += `object / member [ / * [ pos() == 1 && @value == "${escapedSegment}" ] ] /`
        }
        xpath += " * [ pos() == 2 ]"
        return xpath
    }

    /*  helper function: query AST and return single node  */
    const queryAST = (ast, path) => {
        const query = opath2xpath(path)
        const nodes = ast.query(query)
        if (nodes.length === 0)
            throw new Error(`path not found (no AST nodes matched): "${path}"`)
        if (nodes.length > 1)
            throw new Error(`path is ambiguous (more than one AST node matched): "${path}"`)
        return nodes[0]
    }

    /*  dispatch commands  */
    if (!argv.value) {
        /*  ==== GET OPERATION ====  */

        /*  read input  */
        const json = await cli.input(argv.input)

        /*  parse JSON  */
        const ast = JsonAsty.parse(json)

        /*  query JSON AST  */
        const node = queryAST(ast, argv.path)

        /*  fetch value  */
        const value = node.get("value")

        /*  write output  */
        await cli.output(argv.output, `${value}\n`)
    }
    else {
        /*  ==== SET OPERATION ====  */

        /*  read input  */
        const json = await cli.input(argv.input)

        /*  parse JSON  */
        const ast = JsonAsty.parse(json)

        /*  query JSON AST  */
        const node = queryAST(ast, argv.path)

        /*  replace value  */
        let value = argv.value
        if (argv.type === "number")
            value = parseInt(value)
        else if (argv.type === "boolean")
            value = Boolean(value)
        const nodeNew = node.create(argv.type).set({ value })
        node.parent().del(node).add(nodeNew)

        /*  unparse JSON  */
        const jsonNew = JsonAsty.unparse(ast)

        /*  write output  */
        await cli.output(argv.output, jsonNew)
    }
})().catch((err) => {
    const error = err.toString().replace(/^Error:\s+/, "")
    cli.log("error", error)
    process.exit(1)
})

