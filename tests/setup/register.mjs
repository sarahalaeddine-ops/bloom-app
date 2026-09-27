// Loaded with `node --import ./tests/setup/register.mjs --test`.
// 1. Lets Node's ESM loader resolve the app's extensionless imports ("./store" → "./store.js"),
//    the way Next's bundler does. No packages needed.
// 2. Gives lib/ code a minimal browser-like global: window, localStorage.
import { register } from "node:module";

register("./resolve-hooks.mjs", import.meta.url);

function memoryStorage() {
  var data = new Map();
  return {
    getItem: function (k) { return data.has(k) ? data.get(k) : null; },
    setItem: function (k, v) { data.set(String(k), String(v)); },
    removeItem: function (k) { data.delete(k); },
    clear: function () { data.clear(); },
    key: function (i) { return Array.from(data.keys())[i] || null; },
    get length() { return data.size; },
    // Object.keys(localStorage) is used by lib/store.js
    _keys: function () { return Array.from(data.keys()); },
  };
}

// Object.keys(localStorage) must list stored keys, so expose them as own properties via a Proxy.
var backing = memoryStorage();
var storage = new Proxy(backing, {
  ownKeys: function () { return backing._keys(); },
  getOwnPropertyDescriptor: function (t, k) {
    if (backing.getItem(k) !== null) return { enumerable: true, configurable: true, value: backing.getItem(k) };
    return undefined;
  },
});

globalThis.window = globalThis;
globalThis.localStorage = storage;
