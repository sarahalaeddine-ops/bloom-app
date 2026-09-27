// ESM resolve hook: retry relative, extensionless specifiers with ".js" (then "/index.js").
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    var relative = specifier.startsWith("./") || specifier.startsWith("../");
    if (!relative || /\.[cm]?[jt]sx?$/.test(specifier)) throw err;
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
