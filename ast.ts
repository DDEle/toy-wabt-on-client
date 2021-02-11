export type Value =
  | { tag: "none" }
  | { tag: "bool"; value: boolean }
  | { tag: "num"; value: number }
  | { tag: "object"; name: string; address: number };

export type Type =
  | { tag: "number" }
  | { tag: "bool" }
  | { tag: "none" }
  | { tag: "class"; name: string };

export type Stmt =
    { tag: "define", name: string, value: Expr }
  | { tag: "print", value: Expr }
  | { tag: "expr", expr: Expr }
  | { tag: "globals" }

export type Expr =
    { tag: "op", op: Op, left: Expr, right: Expr }
  | { tag: "num", value: number }
  | { tag: "id", name: string }

export enum Op { Plus, Minus } ;
