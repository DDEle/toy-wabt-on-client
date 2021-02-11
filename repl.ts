import {run} from "./runner";
import { parse } from "./parser";
import { emptyEnv, GlobalEnv } from "./compiler";
import { Value, Type } from "./ast";
import { NONE } from "./utils";

interface REPL {
  run(source: string): Promise<Value>;
  tc(source: string): Promise<Type>;
}

export class BasicREPL {
  currentEnv: GlobalEnv
  importObject: any
  memory: any
  constructor(importObject : any) {
    this.importObject = importObject;
    if(!importObject.js) {
      const memory = new WebAssembly.Memory({initial:10, maximum:20});
      this.importObject.js = { memory: memory };
    }
    this.currentEnv = {
      globals: new Map(),
      offset: 0
    };
  }
  async run(source : string) : Promise<Value> {
    const [result, newEnv] = await run(source, {importObject: this.importObject, env: this.currentEnv});
    this.currentEnv = newEnv;
    return result;
  }
  async tc(source: string): Promise<Type> {
    const ast = parse(source);
    return NONE;
  }
}