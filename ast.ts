
export type Type =
  | {tag: "number"}
  | {tag: "none"}
  | {tag: "class", name: string}

export type Stmt<A> =
  | { a?: A, tag: "class", name: string, field1: [string, Type], field2: [string, Type] }
  | { a?: A, tag: "define", name: string, type: Type, value: Expr<A> }
  | { a?: A, tag: "assign", name: string, value: Expr<A> }
  | { a?: A, tag: "print", value: Expr<A> }
  | { a?: A, tag: "expr", expr: Expr<A> }

export type Expr<A> =
    { a?: A, tag: "op", op: Op, left: Expr<A>, right: Expr<A> }
  | { a?: A, tag: "num", value: number }
  | { a?: A, tag: "none" }
  | { a?: A, tag: "id", name: string }
  | { a?: A, tag: "construct", name: string }
  | { a?: A, tag: "lookup", obj: Expr<A>, name: string }

export enum Op { Plus, Minus } ;




