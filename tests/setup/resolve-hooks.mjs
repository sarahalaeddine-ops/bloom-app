// ESM resolve hook: retry extensionless specifiers with ".js" (then "/index.js"), the way Next's
// bundler resolves them. Covers relative app imports ("./store") and package subpaths without an
// exports map ("next/server").
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    var retry = err && (err.code === "ERR_MODULE_NOT_FOUND" || err.code === "ERR_UNSUPPORTED_DIR_IMPORT");
    if (!retry || /\.[cm]?[jt]sx?$/.test(specifier) || specifier.startsWith("node:")) throw err;
    try {
      return await nextResolve(specifier + ".js", context);
    } catch {
      return nextResolve(specifier + "/index.js", context);
    }
  }
}

// App source files use ESM syntax in plain ".js" files (package.json has no "type").
// Tell Node they are modules up front, which avoids the "reparsing as ES module" warning.
export async function load(url, context, nextLoad) {
  if (url.startsWith("file:") && url.endsWith(".js") && url.indexOf("/node_modules/") === -1) {
    return nextLoad(url, { ...context, format: "module" });
  }
  return nextLoad(url, context);
}
