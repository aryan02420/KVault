/// <reference lib="deno.unstable" />

type KeyBuilderHandler = {
  get: (target: KeyBuilder, prop: string | symbol) => KeyBuilder;
  apply: (target: KeyBuilder, thisArg: KeyBuilder, argArray: (Uint8Array | string | number | bigint | boolean)[]) => KeyBuilder | (Uint8Array | string | number | bigint | boolean)[];
};

class KeyBuilder extends Function {
  private _values: (Uint8Array | string | number | bigint | boolean)[];
  [key: string]: any;
  constructor() {
    super();
    this._values = [];
    const keyBuilderHandler: KeyBuilderHandler = {
      get(target, prop) {
        const original = Reflect.get(target, prop);
        if (typeof original === "function") {
          return original.bind(target);
        }
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop);
        }
        if (typeof prop === "string") {
          target._values.push(prop.toString());
        }
        return new Proxy(target, keyBuilderHandler);
      },
      apply: (target, thisArg, argArray) => {
        if (argArray.length > 0) {
          target._values = target._values.concat(argArray);
          return new Proxy(target, keyBuilderHandler);
        }
        return target._values;
      }
    };
    return new Proxy(this, keyBuilderHandler);
  }
}

export const $key = () => new KeyBuilder();

const k = $key().my.key[42].lol(7, true, {})();
console.log(k);
