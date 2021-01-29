import { Stmt, Expr, Op, Type } from "./ast";

type Env = {
  globals: Map<string, Type>,
  classes: Map<string, Map<string, Type>>
}

function checkLiteralType(type: Type, val : Expr<any>) {
  if(val.tag === "num" && type.tag !== "number") {
    throw new Error("Expected number literal, got " + val.tag);
  }
  else if(val.tag === "none" && type.tag !== "class") {
    throw new Error("Expected none as literal for class type, got " + val.tag);
  }
}

function isDecl(s : Stmt<any>) {
  return s.tag === "define" || s.tag === "class";
}

export function tc(stmts : Array<Stmt<any>>) : Array<Stmt<Type>> {
  let vars : Map<string, Type> = new Map();
  let classes : Map<string, Map<string, Type>> = new Map();

  const newstmts : Array<Stmt<Type>> = [];

  let index = 0;
  while(isDecl(stmts[index])) {
    let s = stmts[index];
    if(s.tag === "define") {
      checkLiteralType(s.type, s.value);
      vars.set(s.name, s.type);
      newstmts.push({
        tag: "define",
        name: s.name,
        type: s.type,
        value: tcExpr(s.value, {globals: vars, classes: classes}),
        a: {tag: "none"}
      });
    }
    else if(s.tag === "class") {
      let fields : Map<string, Type> = new Map();
      fields.set(s.field1[0], s.field1[1]);
      fields.set(s.field2[0], s.field2[1]);
      classes.set(s.name, fields);
      newstmts.push({
        tag: "class",
        name: s.name,
        field1: s.field1,
        field2: s.field2,
        a: {tag: "none"}
      })
    }
    index += 1;
  }
  
  while(index < stmts.length) {
    let stmt = tcStmt(stmts[index], { globals: vars, classes: classes });
    newstmts.push(stmt);
    index += 1;
  }
  return newstmts;
}

function equalTypes(u : Type, t : Type) {
  if(u.tag === "number" && t.tag === "number") { return true; }
  else if(u.tag === "class" && t.tag === "class") { return u.name === t.name; }
  else { return false; }
}

function tcStmt(s : Stmt<any>, e : Env) : Stmt<Type> {
  switch(s.tag) {
    case "assign":
      let typedValExpr = tcExpr(s.value, e);
      let valtyp = typedValExpr.a;
      if(!equalTypes(e.globals.get(s.name), valtyp)) {
        throw new Error("Type " + valtyp.tag + " not assignable");
      }
      return {
        tag: "assign",
        name: s.name,
        value: typedValExpr,
        a: {tag: "none"}
      };
    case "print":
      let expr = tcExpr(s.value, e);
      return {
        tag: "print",
        value: expr,
        a: {tag: "none"},
      }
    case "expr":
      return {
        tag: "expr",
        expr: tcExpr(s.expr, e),
        a: {tag: "none"}        // we could use the type of the expr here if we needed that information elsewhere
      }
  }
}

function tcExpr(e : Expr<any>, env : Env) : Expr<Type> {
  switch(e.tag) {
    case "num":
      var t : Type = {tag: "number"};
      return { tag: "num", value: e.value, a: t };
    case "id":
      var t = env.globals.get(e.name);
      return { tag: "id", name: e.name, a: t };
    case "none": return { tag: "none", a: {tag: "none"} }
    case "construct": return { tag: "construct", name: e.name, a: { tag: "class", name: e.name }};
    case "lookup":
      // YOU FILL THIS IN
      let typedObjExpr = tcExpr(e.obj, env);
      let objType = typedObjExpr.a;
      if(objType.tag === "class") {
        let classData = env.classes.get(objType.name);
        // Report a better class-not-found error?
        // Joe thinks this would be weird
        let fieldType = classData.get(e.name);
        // Report a better field-not-found error
        return {
          tag: "lookup",
          obj: typedObjExpr,
          name: e.name,
          a: fieldType        // useful for compiling o.x.y.z
        }
      }
      else {
        throw new Error("Got non-object in field lookup.")
      }
    case "op":
      let leftExpr = tcExpr(e.left, env);
      let rightExpr = tcExpr(e.right, env);
      let lefttyp = leftExpr.a;
      let righttyp = rightExpr.a;
      if(!(lefttyp.tag === "number" && righttyp.tag === "number")) {
        throw new Error("Needed two numbers for op, got " + lefttyp.tag + ", " + righttyp.tag);
      }
      return {
        tag: "op",
        op: e.op,
        left: leftExpr,
        right: rightExpr,
        a: {tag: "number"}
      };
  }

}