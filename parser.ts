import {parser} from "lezer-python";
import {Tree, TreeCursor} from "lezer-tree";
import {Expr, Stmt, Op, Type} from "./ast";

export function traverseExpr(c : TreeCursor, s : string) : Expr {
  switch(c.type.name) {
    case "None":
      return {
        tag: "none",
      }
    case "MemberExpression":
      c.firstChild();
      let obj = traverseExpr(c, s);
      c.nextSibling(); // Focuses .
      c.nextSibling(); // Focuses field name
      const fieldName = s.substring(c.from, c.to);
      c.parent();
      return {
        tag: "lookup",
        obj,
        name: fieldName
      };
    case "Number":
      return {
        tag: "num",
        value: Number(s.substring(c.from, c.to))
      }
    case "CallExpression":
      c.firstChild();
      const callName = s.substring(c.from, c.to);
      c.parent();
      // NOTE(joe): super-cheating for lecture, ignoring args, etc to parse C()
      return {
        tag: "construct",
        name: callName
      };
    case "VariableName":
      return {
        tag: "id",
        name: s.substring(c.from, c.to)
      }
    case "BinaryExpression":
      c.firstChild();
      const left = traverseExpr(c, s);
      c.nextSibling(); // Here we would look at this value to get the operator
      c.nextSibling();
      const right = traverseExpr(c, s);
      c.parent();
      return {
        tag: "op",
        op: Op.Plus,
        left: left,
        right: right
      }
    default:
      throw new Error("Could not parse expr at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
  }
}

function parseType(typeName : string) : Type {
  if(typeName === "int") {
    return {tag: "number"};
  }
  else {
    return {tag: "class", name: typeName};
  }
}

function traverseField(c : TreeCursor, s : string) : [string, Type] {
  c.firstChild();
  let fieldName = s.substring(c.from, c.to);
  c.nextSibling();
  c.firstChild();
  c.nextSibling(); // Focuses int
  let typeName = s.substring(c.from, c.to);
  let result : [string, Type] = [fieldName, parseType(typeName)];
  c.parent();
  c.parent();
  return result;
}

export function traverseStmt(c : TreeCursor, s : string) : Stmt {
  switch(c.node.type.name) {
    case "ClassDefinition":
      c.firstChild();
      c.nextSibling(); // Focus on class name
      const className = s.substring(c.from, c.to);
      c.nextSibling(); // Focus on arglist/superclass
      c.nextSibling(); // Focus on body
      c.firstChild();  // Focus colon
      c.nextSibling(); // Focuses first field
      let field1 = traverseField(c, s);
      c.nextSibling(); // Focuses next field
      let field2 = traverseField(c, s);
      c.parent();
      c.parent();
      return {
        tag: "class",
        name: className,
        field1, field2
      };
    case "AssignStatement":
      c.firstChild(); // go to name
      const name = s.substring(c.from, c.to);
      c.nextSibling(); // go to equals or TypeDef
      if(c.type.name === "TypeDef") {
        c.firstChild();
        c.nextSibling(); // skip colon
        let typeName = s.substring(c.from, c.to);
        c.parent();
        c.nextSibling(); // equals sign/AssignOp
        c.nextSibling(); // go to value
        const value = traverseExpr(c, s);
        c.parent();
        return {
          tag: "define",
          name: name,
          type: parseType(typeName),
          value: value
        }
      }
      else {
        c.nextSibling(); // go to value
        const value = traverseExpr(c, s);
        c.parent();
        return {
          tag: "assign",
          name: name,
          value: value
        }
      }
    case "ExpressionStatement":
      c.firstChild();
      let childName = c.node.type.name;
      if((childName as any) === "CallExpression") { // Note(Joe): hacking around typescript here; it doesn't know about state
        c.firstChild();
        const callName = s.substring(c.from, c.to);
        if (callName === "print") {
          c.nextSibling(); // go to arglist
          c.firstChild(); // go into arglist
          c.nextSibling(); // find single argument in arglist
          const arg = traverseExpr(c, s);
          c.parent(); // pop arglist
          c.parent(); // pop expressionstmt
          return {
            tag: "print",
            // LOL TODO: not this
            value: arg
          };
        }
      }
      else {
        const expr = traverseExpr(c, s);
        c.parent(); // pop going into stmt
        return {
          tag: "expr",
          expr: expr
        }
      }
    default:
      throw new Error("Could not parse stmt at " + c.node.from + " " + c.node.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverse(c : TreeCursor, s : string) : Array<Stmt> {
  switch(c.node.type.name) {
    case "Script":
      const stmts = [];
      const firstChild = c.firstChild();
      do {
        stmts.push(traverseStmt(c, s));
      } while(c.nextSibling())
      return stmts;
    default:
      throw new Error("Could not parse program at " + c.node.from + " " + c.node.to);
  }
}
export function parse(source : string) : Array<Stmt> {
  const t = parser.parse(source);
  return traverse(t.cursor(), source);
}
