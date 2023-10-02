#!/usr/bin/env node
/*!
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

const fs       = require("fs")
const JsonAsty = require("..")

/*  convert object path to XPath  */
const opath2xpath = (opath) => {
    let xpath = ""
    const segments = opath.split(".")
    for (const segment of segments)
        xpath += `object / member [ / * [ pos() == 1 && @value == "${segment}" ] ] /`
    xpath += " * [ pos() == 2 ]"
    return xpath
}

const get = async (file, path) => {
    /*  read JSON file  */
    const json = await fs.promises.readFile(file, { encoding: "utf8" })

    /*  parse JSON file  */
    const ast = JsonAsty.parse(json)

    /*  query JSON AST  */
    const query = opath2xpath(path)
    const nodes = ast.query(query)
    if (nodes.length === 0)
        throw new Error(`path not found (no AST nodes matched): "${path}"`)
    if (nodes.length > 1)
        throw new Error(`path is ambigous (more than one AST node matched): "${path}"`)
    const node = nodes[0]

    /*  deliver value  */
    const value = node.get("value")
    process.stdout.write(value + "\n")
}

const set = async (file, path, type, value) => {
    /*  read JSON file  */
    const json = await fs.promises.readFile(file, { encoding: "utf8" })

    /*  parse JSON file  */
    const ast = JsonAsty.parse(json)

    /*  query JSON AST  */
    const query = opath2xpath(path)
    const nodes = ast.query(query)
    if (nodes.length === 0)
        throw new Error(`path not found (no AST nodes matched): "${path}"`)
    if (nodes.length > 1)
        throw new Error(`path is ambigous (more than one AST node matched): "${path}"`)
    const node = nodes[0]

    /*  replace value  */
    if (type === "number")
        value = parseInt(value)
    else if (type === "boolean")
        value = Boolean(value)
    const nodeNew = node.create(type).set({ value })
    node.parent().del(node).add(nodeNew)

    /*  save JSON file  */
    const jsonNew = JsonAsty.unparse(ast)
    await fs.promises.writeFile(file, jsonNew, { encoding: "utf8" })
}

;(async () => {
    try {
        /*  provide usage  */
        if (process.argv.length <= 2) {
            process.stderr.write("json-asty: USAGE: json-asty get <json-file> <object-path>\n")
            process.stderr.write("json-asty: USAGE: json-asty set <json-file> <object-path> <type> <value>\n")
            process.exit(0)
        }

        /*  dispatch commands  */
        if (process.argv[2] === "get") {
            if (process.argv.length !== (3 + 2))
                throw new Error("invalid number of arguments (expected 2)")
            await get(process.argv[3], process.argv[4])
        }
        else if (process.argv[2] === "set") {
            if (process.argv.length !== (3 + 4))
                throw new Error("invalid number of arguments (expected 4)")
            await set(process.argv[3], process.argv[4], process.argv[5], process.argv[6])
        }
        else
            throw new Error("invalid command (expected 'get' or 'set')")
        process.exit(0)
    }
    catch (ex) {
        process.stderr.write(`json-asty: ERROR: ${ex.toString()}\n`)
        process.exit(1)
    }
})()

