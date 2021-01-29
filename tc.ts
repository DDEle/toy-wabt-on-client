import { Stmt, Expr, Op, Type } from "./ast";

type Env = {
  globals: Map<string, Type>,
  classes: Map<string, Map<string, Type>>
}

function checkLiteralType(type: Type, val : Expr) : Type {
  if(val.tag === "num" && type.tag !== "number") {
    throw new Error("Expected number literal, got " + val.tag);
  }
  else if(val.tag === "none" && type.tag !== "class") {
    throw new Error("Expected none as literal for class type, got " + val.tag);
  }
  else { throw new Error("Unexpected type/val pair in checkLiteralType " + val.tag + ", " + type.tag); }
}

function isDecl(s : Stmt) {
  return s.tag === "define" || s.tag === "class";
}

export function tc(stmts : Array<Stmt>) {
  let vars : Map<string, Type> = new Map();
  let classes : Map<string, Map<string, Type>> = new Map();

  let index = 0;
  while(isDecl(stmts[index])) {
    let s = stmts[index];
    if(s.tag === "define") {
      checkLiteralType(s.type, s.value);
      vars.set(s.name, s.type);
    }
    else if(s.tag === "class") {
      let fields : Map<string, Type> = new Map();
      fields.set(s.field1[0], s.field1[1]);
      fields.set(s.field2[0], s.field2[1]);
      classes.set(s.name, fields);
    }
  }
  
  while(index < stmts.length) {
    tcStmt(stmts[index], { globals: vars, classes: classes });
  }
}

function equalTypes(u : Type, t : Type) {
  if(u.tag === "number" && t.tag === "number") { return true; }
  else if(u.tag === "class" && t.tag === "class") { return u.name === t.name; }
  else { return false; }
}

function tcStmt(s : Stmt, e : Env) {
  switch(s.tag) {
    case "assign":
      let valtyp = tcExpr(s.value, e);
      if(!equalTypes(e.globals.get(s.name), valtyp)) {
        throw new Error("Type " + valtyp.tag + " not assignable");
      }
      return;
    case "print":
      tcExpr(s.value, e);
      return;
    case "expr":
      tcExpr(s.expr, e);
  }
}

function tcExpr(e : Expr, env : Env) : Type {
  switch(e.tag) {
    case "num": return {tag: "number"};
    case "id": return env.globals.get(e.name);
    case "none": return {tag: "none"};
    case "construct": return { tag: "class", name: e.name };
    case "lookup":
      // YOU FILL THIS IN





      return ({ tag: "???" } as any);
    case "op":
      let lefttyp = tcExpr(e.left, env);
      let righttyp = tcExpr(e.right, env);
      if(!(lefttyp.tag === "number" && righttyp.tag === "number")) {
        throw new Error("Needed two numbers for op, got " + lefttyp.tag + ", " + righttyp.tag);
      }
      return {tag: "number"};
  }

}