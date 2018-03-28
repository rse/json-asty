
const JsonAsty = require("..")

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

