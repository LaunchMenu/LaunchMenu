/**
 * @typedef { import('./types').ExportDir } ExportDir
 * @typedef {import("./types").ExportOutputs} ExportOutputs
 */

const {getRelativePath} = require("./utils");
const FS = require("fs");
const {promisify} = require("util");
const Path = require("path");

/**
 * Writes the given 'virtual' exportsDir object to disc
 * @param {ExportDir} exportDir The exports object to be written
 * @param {boolean} includeJS Whether to also export the js code
 * @param {boolean} accumulate Whether to accumulate all exports and children into a default export
 * @returns {Promise<void>}
 */
async function writeExportDir(exportDir, includeJS = true, accumulate = includeJS) {
    const path = exportDir.path;
    if (!FS.existsSync(path)) FS.mkdirSync(path, {recursive: true});
    await promisify(FS.writeFile)(
        `${path}/index.d.ts`,
        getExportDirTS(exportDir, accumulate),
        "utf8"
    );
    if (includeJS)
        await promisify(FS.writeFile)(
            `${path}/index.js`,
            getExportDirJS(exportDir, accumulate),
            "utf8"
        );

    for (const child of Object.values(exportDir.children))
        await writeExportDir(child, includeJS);
}

/**
 * Gets the .d.ts of the given 'virtual' exportsDir object to disc
 * @param {ExportDir} exportDir The exports object to be written
 * @param {boolean} accumulate Whether to accumulate all exports and children into a default export
 * @returns {string} The text to be written do the .d.ts file
 */
function getExportDirTS(exportDir, accumulate = true) {
    // Get the exports text file
    const exportsText = Object.keys(exportDir.exports)
        .map(path => {
            const props = exportDir.exports[path];
            return `export {${props.join(", ")}} from "${path}";`;
        })
        .join("\n");

    // Construct the default export object structure
    const importsText = Object.keys(exportDir.exports)
        .map(path => {
            const props = exportDir.exports[path];
            return `import {${props.join(", ")}} from "${path}";`;
        })
        .join("\n");
    const exportsLines = Object.keys(exportDir.exports).flatMap(path => {
        const props = exportDir.exports[path];
        return props.map(prop => `    ${prop}: typeof ${prop}`);
    });

    const childrenImportsText = Object.keys(exportDir.children)
        .map(child => `import $${child} from "./${child}";`)
        .join("\n");
    const childrenLines = Object.keys(exportDir.children).map(
        child => `    $${child}: typeof $${child}`
    );

    const defaultExportText = [...childrenLines, ...exportsLines].join(",\n");
    const defExport = `
${importsText}
${childrenImportsText}
declare const __default: {
${defaultExportText}
}
export default __default;`;

    // Return everything
    return `${exportsText}` + (accumulate ? defExport : "");
}

/**
 * Gets the .js of the given 'virtual' exportsDir object to disc
 * @param {ExportDir} exportDir The exports object to be written
 * @param {boolean} accumulate Whether to accumulate all exports and children into a default export
 * @returns {string} The text to be written do the .js file
 */
function getExportDirJS(exportDir, accumulate = true) {
    // Get the exports text file
    const importsText = Object.keys(exportDir.exports)
        .map(path => {
            const props = exportDir.exports[path];
            return `const {${props.join(", ")}} = require("${path}");`;
        })
        .join("\n");
    const exportsText = Object.keys(exportDir.exports)
        .flatMap(path => {
            const props = exportDir.exports[path];
            return props.map(prop => `    ${prop}`);
        })
        .join(",\n");

    // Construct the default export object structure
    const childrenImportsText = Object.keys(exportDir.children)
        .map(child => `const {default: $${child}} = require("./${child}");`)
        .join("\n");
    const childrenExportsText = [
        ...Object.keys(exportDir.children).map(child => `       $${child}`),
        "       ...standardExports",
    ].join(",\n");

    if (accumulate)
        return `Object.defineProperty(module.exports, "__esModule", { value: true });
${importsText}\n${childrenImportsText}
const standardExports = {
${exportsText}
};
module.exports = {
    default: {
${childrenExportsText}
    },
    ...standardExports
}`;
    return `Object.defineProperty(exports, "__esModule", { value: true });
${importsText}
exports = {
${exportsText}
}`;
}

/**
 * Writes the given exports to the index build file
 * @param {string} path The path to write the flattened exports too
 * @param {ExportOutputs} outputs The output to
 * @param {"ts"|"js"|undefined} only Indicates to potentially only update js or ts files
 */
async function writeExportsToIndex(path, outputs, only) {
    const declarationPath = path + ".d.ts";
    path = path + ".js";
    const dirPath = Path.dirname(path).replace(/\\/g, "/");

    let jsText = `Object.defineProperty(module.exports, "__esModule", { value: true });
/** generated exports */`;
    let tsText = "/** generated exports */";

    // Extract the base text from existing files if present
    if (FS.existsSync(path)) {
        const jsContent = await promisify(FS.readFile)(path, "utf8");
        jsText =
            jsContent.replace(/\r?\n?\/\*\* generated exports \*\/(.|\r?\n)*$/g, "") +
            "\n/** generated exports */";

        if (FS.existsSync(declarationPath)) {
            const tsContent = await promisify(FS.readFile)(declarationPath, "utf8");
            tsText =
                tsContent.replace(/\r?\n?\/\*\* generated exports \*\/(.|\r?\n)*$/g, "") +
                "\n/** generated exports */";
        }
    }

    // Add the exports to the base text
    jsText += getExportDirToIndexJS(dirPath, outputs.runtime);

    tsText += getExportDirToIndexTS(dirPath, outputs.runtime);
    tsText += getExportDirToIndexTS(dirPath, outputs.type);

    jsText += `\nmodule.exports.default = require("${getRelativePath(
        dirPath,
        outputs.runtime.path
    )}").default;`;
    tsText += `\nexport { default } from "${getRelativePath(
        dirPath,
        outputs.runtime.path
    )}";`;

    // Save the files
    if (only != "ts") await promisify(FS.writeFile)(path, jsText, "utf8");
    if (only != "js") await promisify(FS.writeFile)(declarationPath, tsText, "utf8");
}

/**
 * Creates the text to reexport the given export dir flat
 * @param {string} path The path to get the exports for
 * @param {ExportDir} exportDir The export dir to get the exports from
 * @returns {string} The exports text
 */
function getExportDirToIndexTS(path, exportDir) {
    const relativePath = getRelativePath(path, exportDir.path);
    const text = `\nexport * from "${relativePath}";`;
    return (
        text +
        Object.values(exportDir.children)
            .map(child => getExportDirToIndexTS(path, child))
            .join("")
    );
}

/**
 * Creates the text to reexport the given export dir flat
 * @param {string} path The path to get the exports for
 * @param {ExportDir} exportDir The export dir to get the exports from
 * @returns {string} The exports text
 */
function getExportDirToIndexJS(path, exportDir) {
    const relativePath = getRelativePath(path, exportDir.path);
    const text = `\nObject.assign(exports, require("${relativePath}"));`;
    return (
        text +
        Object.values(exportDir.children)
            .map(child => getExportDirToIndexJS(path, child))
            .join("")
    );
}

module.exports = {
    writeExportDir,
    writeExportsToIndex,
    getExportDirJS,
    getExportDirTS,
    getExportDirToIndexJS,
    getExportDirToIndexTS,
};
