const FS = require("fs");
const {promisify} = require("util");
const Path = require("path");

/**
 * Tooling to make a library reexport files to change the structure
 */

/**
 * @typedef {Object} Config
 * @property {Exports} exports The base exports to add exports to
 * @property {string} folderExportsName The name of the file to declare folder exports
 */

/**
 * @typedef {Object} ExportDir
 * @property {string} path The path to this directory
 * @property {{[child: string]: ExportDir}} children Child exports representing an hierarchy
 * @property {Exports} exports The exports of this level
 */

/**
 * @typedef {{[path: string]: string[]}} Exports
 */

/**
 * @typedef {Object} Export
 * @property {string} path The path to the export
 * @property {string[]|"*"} props The props to export
 */

/**
 * Calculates the relative path from a given file to another file
 * @param {string} from The path of the source file
 * @param {string} to The path of the target file
 * @returns {string} The relative path from the source to the target file
 */
function getRelativePath(from, to) {
    let i = 0;
    while (to[i] == from[i]) i++;
    const toPath = to.substr(i);
    const fromPath = from.substr(i);
    return (
        fromPath
            .split(/[/\\]/g)
            .map(() => "..")
            .join("/") +
        "/" +
        toPath
    );
}

/**
 * Adds an export to the exports dir object
 * @param {ExportDir} exportDir The export dir object to add this export to at the given path
 * @param {string} path The path to the export dir object to add the export to
 * @param {Export} xport The export to add to the file
 */
async function addToExportDir(exportDir, path, xport) {
    // Check if we hit the exports object to add this path to yet
    if (path == "") {
        const relativePath = getRelativePath(exportDir.path, xport.path);

        // Merge the current exports from this path (if any) with the added exports
        if (exportDir.exports[relativePath]) {
            const target = exportDir.exports[relativePath];
            xport.props.forEach(prop => {
                if (!target.includes(prop)) target.push(prop);
            });
        } else {
            exportDir.exports[relativePath] = xport.props;
        }
    } else {
        // Index the exports at the specified child exports name and recurse
        const pathParts = path.split("/");
        const child = pathParts.shift();

        if (!exportDir.children[child]) {
            exportDir.children[child] = {
                path: exportDir.path + "/" + child,
                children: {},
                exports: {},
            };
        }
        await addToExportDir(exportDir.children[child], pathParts.join("/"), xport);
    }
}

/**
 * Removes an export from the exports dir object
 * @param {ExportDir} exportDir The export dir object to add this export to at the given path
 * @param {string} path The path to the export dir object to remove the export from
 * @param {Export} xport The export to remove from the file
 */
async function removeFromExportDir(exportDir, path, xport) {
    // Check if we hit the exports object to add this path to yet
    if (path == "") {
        const relativePath = getRelativePath(exportDir.path, xport.path);

        if (exportDir.exports[relativePath]) {
            const target = exportDir.exports[relativePath];
            exportDir.exports[relativePath] = target.filter(
                x => !xport.props.includes(x)
            );
            if (exportDir.exports[relativePath].length == 0)
                delete exportDir.exports[relativePath];
        }
    } else {
        // Index the exports at the specified child exports name and recurse
        const pathParts = path.split("/");
        const child = pathParts.shift();

        if (!exportDir.children[child]) return;
        await removeFromExportsDir(exportDir.children[child], pathParts.join("/"), xport);
    }
}

/**
 * Checks the given path for presence of an index file that can be read as a (partial, no children) ExportDir
 * @param {string} path The path to read the exportDir from
 * @returns {Promise<ExportDir>} Either the exportDir extract from the index.js file at this path, or a new exportDir object
 */
async function readExportDir(path) {
    const filePath = Path.join(path, "index.d.ts");
    const exportData = {};

    if (FS.existsSync(file)) {
        // Read the export declarations
        if (FS.existsSync(filePath)) {
            const data = await promisify(FS.readFile)(filePath, "utf8");
            try {
                const exportRegex = /export\s*\{([^\}]+)\}\s*from\s*("|')([^"']+)("|');?/g;
                let m;
                while ((m = exportRegex.exec(data))) {
                    const [_, exports, _, path] = m;
                    exportData[path] = exports.split(",").map(s => s.trim());
                }
            } catch (e) {
                console.error(e);
            }
        }

        // Look for children
        const children = {};
        if (FS.existsSync(file) && FS.statSync(file).isDirectory()) {
            const files = await promisify(FS.readdir)(file);
            const childPromises = files.map(async childFile => {
                const childPath = Path.join(path, childFile);
                const child = await readExportDir(childPath);
                if (Object.keys(child.children) == 0 && Object.keys(child.exports) == 0)
                    return;
                else return {path, child};
            });
            (await Promise.all(childPromises)).forEach(c => {
                if (c) children[c.path] = c.child;
            });
        }
    }

    // Return the data
    return {path, children: {}, exports: exportData};
}

/**
 * Writes the given 'virtual' exportsDir object to disc
 * @param {ExportDir} exportDir The exports object to be written
 * @returns {Promise<void>}
 */
async function writeExportDir(exportDir) {
    const path = exportDir.path;
    await promisify(FS.writeFile)(
        Path.join(path, "index.d.ts"),
        getExportDirTs(exportDir),
        "utf8"
    );
    await promisify(FS.writeFile)(
        Path.join(path, "index.js"),
        getExportDirJs(exportDir),
        "utf8"
    );
}

/**
 * Gets the .d.ts of the given 'virtual' exportsDir object to disc
 * @param {ExportDir} exportDir The exports object to be written
 * @returns {string} The text to be written do the .d.ts file
 */
async function getExportDirTs(exportDir) {
    // Get the exports text file
    const exportsText = Object.keys(exportDir.exports)
        .map(path => {
            const props = exportDir.exports[path];
            return `export {${props.join(",")}} from "${path}";`;
        })
        .join("\n");

    // Construct the default export object structure
    const importsText = Object.keys(exportDir.exports)
        .map(path => {
            const props = exportDir.exports[path];
            return `import {${props.join(",")}} from "${path}";`;
        })
        .join("\n");
    const exportsLines = Object.keys(exportDir.exports).flatMap(path => {
        const props = exportDir.exports[path];
        return props.map(prop => `    ${prop}`);
    });

    const childrenImportsText = Object.keys(exportDir.children)
        .map(child => `import ${child} from "./${child}";`)
        .join("\n");
    const childrenLines = Object.keys(exportDir.children).map(
        child => `    $${child}:${child}`
    );

    const defaultExportText = [...childrenLines, ...exportsLines].join(",\n");

    // Return everything
    return `${exportsText}\n${childrenImportsText}\n${importsText}
export default const {
    ${defaultExportText}
}`;
}

/**
 * Gets the .js of the given 'virtual' exportsDir object to disc
 * @param {ExportDir} exportDir The exports object to be written
 * @returns {string} The text to be written do the .js file
 */
async function getExportDirJs(exportDir) {
    // Get the exports text file
    const importsText = Object.keys(exportDir.exports)
        .map(path => {
            const props = exportDir.exports[path];
            return `const {${props.join(",")}} = require("${path}");`;
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
        .map(child => `const {default: ${child}} = require("./${child}");`)
        .join("\n");
    const childrenExportsText = Object.keys(exportDir.children)
        .map(child => `    $${child}:${child}`)
        .join(",\n");

    return `Object.defineProperty(exports, "__esModule", { value: true });
${importsText}\n${childrenImportsText}
const standardExports = {
${exportsText}
};
exports = {
${childrenExportsText},
...standardExports
}`;
}

function buildTree(path, target, exports) {}
