/*!
**  JSON-ASTy -- Lossless JSON-to-AST Parser and AST-to-JSON Generator
**  Copyright (c) 2018-2026 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

declare module "json-asty" {
    /*  the position of an AST node in the source  */
    export interface AstNodePos {
        line:   number;
        column: number;
        offset: number;
    }

    /*  the AST node API (as provided by the underlying "asty-astq" library)  */
    export interface AstNode {
        /*  node type management  */
        type(type: string): AstNode;
        type(): string;

        /*  node merging  */
        merge(node: AstNode, takePos?: boolean, attrMap?: { [ from: string ]: string }): AstNode;

        /*  attribute management  */
        set(name: string, value: any): AstNode;
        set(attrs: { [ name: string ]: any }): AstNode;
        unset(name: string): AstNode;
        unset(names: string[]): AstNode;
        get(name: string): any;
        get(names: string[]): any[];
        attrs(): string[];

        /*  position management  */
        pos(line: number, column: number, offset: number): AstNode;
        pos(): AstNodePos;

        /*  child node management  */
        create(type: string, attrs?: { [ name: string ]: any }, childs?: AstNode[]): AstNode;
        add(...childs: (AstNode | AstNode[])[]): AstNode;
        ins(pos: number, ...childs: (AstNode | AstNode[])[]): AstNode;
        del(...childs: AstNode[]): AstNode;
        childs(begin?: number, end?: number): AstNode[];
        child(pos: number): AstNode;
        nth(): number;

        /*  tree navigation and traversal  */
        parent(): AstNode;
        walk(
            callback: (node: AstNode, depth: number, parent: AstNode, when: "downward" | "upward") => void,
            when?: "downward" | "upward" | "both"
        ): AstNode;

        /*  serialization  */
        dump(
            maxDepth?: number,
            colorize?: (type: "tree" | "type" | "value" | "position", text: string) => string,
            unicode?: boolean
        ): string;
        serialize(): string;

        /*  querying (mixed in from the underlying "astq" library)  */
        query(
            selector: string,
            params?: { [ name: string ]: any },
            trace?: boolean
        ): AstNode[];
    }

    export default class JsonAsty {
        /*  parse JSON into AST  */
        static parse(json: string): AstNode;

        /*  dump AST  */
        static dump(ast: AstNode, options?: { colors?: boolean }): string;

        /*  unparse AST into JSON  */
        static unparse(ast: AstNode): string;
    }
}

