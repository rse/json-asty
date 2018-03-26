
const JsonAsty = require("..")

let json = `
{
    "foo": {
        "bar": true ,
        "baz": 42.0,
        "quux": [ "test1\\"test2", "test3" ]
    }
} `

let ast = JsonAsty.parse(json)
console.log(JsonAsty.dump(ast, { colors: true }))

let json2 = JsonAsty.unparse(ast)
console.log(json2)

if (json !== json2)
    console.log("ERROR: MISMATCH")

