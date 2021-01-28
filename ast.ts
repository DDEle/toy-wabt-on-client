
export type Type =
  | {tag: "number"}
  | {tag: "none"}
  | {tag: "class", name: string}

export type Stmt =
  | { tag: "class", name: string, field1: [string, Type], field2: [string, Type] }
  | { tag: "define", name: string, type: Type, value: Expr }
  | { tag: "assign", name: string, value: Expr }
  | { tag: "print", value: Expr }
  | { tag: "expr", expr: Expr }

export type Expr =
    { tag: "op", op: Op, left: Expr, right: Expr }
  | { tag: "num", value: number }
  | { tag: "none" }
  | { tag: "id", name: string }
  | { tag: "construct", name: string }
  | { tag: "lookup", obj: Expr, name: string }

export enum Op { Plus, Minus } ;
