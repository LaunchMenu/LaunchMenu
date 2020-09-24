const FS = require("fs");
const {promisify} = require("util");
const Path = require("path");
const ts = require("typescript");

/**
 * Tooling to make a library reexport files to change the structure
 */

/**
 * @typedef {Object} Config
 * @property {string} srcDir The source directory
 * @property {string} buildDir The build directory
 * @property {string} exportToFileName The name of the file to specify the export location of a directory
 * @property {string} noExportText The text to represent that a the data shouldn't be exported (used in place of a path)
 */

/**
 * @typedef {Object} ExportDir
 * @property {string} path The path to this directory
 * @property {{[child: string]: ExportDir}} children Child exports representing an hierarchy
 * @property {Exports} exports The exports of this level
 * @property {Exports} typeExports The exports of this level
 */

/**
 * @typedef {{[path: string]: string[]}} Exports
 */

/**
 * @typedef {Object} Export
 * @property {string} path The path to the export
 * @property {string[]|"*"} props The props to export
 * @property {boolean} isType Whether the
 */

/**
 * Strips the section that path and strip have in common from path
 * @param {string} path The path to strip data from
 * @param {string} strip The other path to get the common part of
 * @returns {string} path with the common section removed
 */
function stripPathStart(path, strip) {
    let i = 0;
    while (path[i] == strip[i] && i < path.length) i++;
    const rem = path.substr(i);
    return rem[0] == "/" ? rem.substr(1) : rem;
}

/**
 * Calculates the relative path from a given file to another file
 * @param {string} from The path of the source file
 * @param {string} to The path of the target file
 * @returns {string} The relative path from the source to the target file
 */
function getRelativePath(from, to) {
    let i = 0;
    while (to[i] == from[i] && i < to.length) i++;
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
 * @returns {ExportDir} The export dir the export was added to
 */
function addToExportDir(exportDir, path, xport) {
    path = stripPathStart(path, exportDir.path);
    if (path.substr(0, 2) == "./") path = path.substr(2);

    // Check if we hit the exports object to add this path to yet
    if (path == "") {
        const relativePath = getRelativePath(exportDir.path, xport.path);

        // Merge the current exports from this path (if any) with the added exports
        const exports = xport.isType ? exportDir.typeExports : exportDir.exports;
        if (exports[relativePath]) {
            const target = exports[relativePath];
            xport.props.forEach(prop => {
                if (!target.includes(prop)) target.push(prop);
            });
        } else {
            exports[relativePath] = xport.props;
        }
        return exportDir;
    } else {
        // Index the exports at the specified child exports name and recurse
        const pathParts = path.split("/");
        const child = pathParts.shift();

        if (!exportDir.children[child]) {
            exportDir.children[child] = {
                path: exportDir.path + "/" + child,
                children: {},
                exports: {},
                typeExports: {},
            };
        }
        return addToExportDir(exportDir.children[child], pathParts.join("/"), xport);
    }
}

/**
 * Removes an export from the exports dir object
 * @param {ExportDir} exportDir The export dir object to add this export to at the given path
 * @param {string} path The path to the export dir object to remove the export from
 * @param {Export} xport The export to remove from the file
 * @returns {ExportDir} The export dir the export was removed from
 */
async function removeFromExportDir(exportDir, path, xport) {
    path = stripPathStart(path, exportDir.path);

    // Check if we hit the exports object to add this path to yet
    if (path == "") {
        const relativePath = getRelativePath(exportDir.path, xport.path);

        const exports = xport.isType ? exportDir.typeExports : exportDir.exports;
        if (exports[relativePath]) {
            const target = exports[relativePath];
            exports[relativePath] = target.filter(x => !xport.props.includes(x));
            if (exports[relativePath].length == 0) delete exports[relativePath];
        }
        return exportDir;
    } else {
        // Index the exports at the specified child exports name and recurse
        const pathParts = path.split("/");
        const child = pathParts.shift();

        const childDir = exportDir.children[child];
        if (!childDir) return;
        const ret = removeFromExportsDir(childDir, pathParts.join("/"), xport);
        if (Object.keys(childDir.children) == 0 && Object.keys(childDir.exports) == 0)
            delete exportDir.children[child];

        return ret;
    }
}

/**
 * Checks the given path for presence of an index file that can be read as a (partial, no children) ExportDir
 * @param {string} path The path to read the exportDir from
 * @returns {Promise<ExportDir>} Either the exportDir extract from the index.js file at this path, or a new exportDir object
 */
async function readExportDir(path) {
    const filePath = `${path}/index.d.ts`;
    const exportData = {};
    const typeExportData = {};

    if (FS.existsSync(path)) {
        // Read the export declarations
        if (FS.existsSync(filePath)) {
            const data = await promisify(FS.readFile)(filePath, "utf8");
            try {
                const exportRegex = /export\s*\{([^\}]+)\}\s*from\s*("|')([^"']+)("|');?\n/g;
                let m;
                while ((m = exportRegex.exec(data))) {
                    const [, exports, , path] = m;
                    exportData[path] = exports.split(",").map(s => s.trim());
                }
            } catch (e) {
                console.error(e);
            }
        }

        // Read the type export declarations
        if (FS.existsSync(filePath)) {
            const data = await promisify(FS.readFile)(filePath, "utf8");
            try {
                const exportRegex = /export\s*\{([^\}]+)\}\s*from\s*("|')([^"']+)("|');?\s*\/\/type/g;
                let m;
                while ((m = exportRegex.exec(data))) {
                    const [, exports, , path] = m;
                    typeExportData[path] = exports.split(",").map(s => s.trim());
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
                const childPath = `${path}/${childFile}`;
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
    return {path, children: {}, exports: exportData, typeExports: {}};
}

/**
 * Writes the given 'virtual' exportsDir object to disc
 * @param {ExportDir} exportDir The exports object to be written
 * @returns {Promise<void>}
 */
async function writeExportDir(exportDir) {
    const path = exportDir.path;
    await promisify(FS.writeFile)(
        `${path}/index.d.ts`,
        getExportDirTs(exportDir),
        "utf8"
    );
    await promisify(FS.writeFile)(`${path}/index.js`, getExportDirJs(exportDir), "utf8");
}

/**
 * Gets the .d.ts of the given 'virtual' exportsDir object to disc
 * @param {ExportDir} exportDir The exports object to be written
 * @returns {string} The text to be written do the .d.ts file
 */
async function getExportDirTs(exportDir) {
    // Get the exports text file
    const exportsText = [
        ...Object.keys(exportDir.exports).map(path => {
            const props = exportDir.exports[path];
            return `export {${props.join(",")}} from "${path}";`;
        }),
        ...Object.keys(exportDir.typeExports).map(path => {
            const props = exportDir.typeExports[path];
            return `export {${props.join(",")}} from "${path}"; //type`;
        }),
    ].join("\n");

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

/**
 * Reads the given path and adds all found exports to the correct exportDir
 * @param {Config} config The config to be used for filling the export dirs
 * @param {ExportDir} exportDir The root exportDir to add exports to
 * @param {string} path The path to look at
 * @param {string} target The target path to add exports to for this path
 */
async function buildTree(config, exportDir, path, target) {
    if (FS.existsSync(path)) {
        const isDir = FS.statSync(path).isDirectory();
        if (isDir) {
            // Update the target
            const exportNamePath = Path.join(path, config.exportToFileName);
            if (FS.existsSync(exportNamePath)) {
                let targetText = await promisify(FS.readFile)(exportNamePath, "utf8");
                if (targetText.substr(0, 2) == "./") targetText = targetText.substr(2);
                target = `${exportDir.path}/${targetText}`;
            }

            // Loop through the children and export them
            const children = await promisify(FS.readdir)(path);
            await Promise.all(
                children.map(child =>
                    buildTree(config, exportDir, `${path}/${child}`, target)
                )
            );
        } else {
            if (Path.extname(path) == ".ts" || Path.extname(path) == ".tsx") {
                const contents = await promisify(FS.readFile)(path, "utf8");
                const source = ts.createSourceFile(
                    path,
                    contents,
                    ts.ScriptTarget.ES2018,
                    true
                );
                const buildPath = config.buildDir + path.substring(config.srcDir.length);

                // Retrieve the exports and type export from the file
                const exports = {};
                const typeExports = {};
                getFileExports(
                    (exportProp, t, isType) => {
                        if (!t) t = target;
                        if (t != config.noExportText) {
                            if (isType) {
                                if (!typeExports[t]) typeExports[t] = [];
                                typeExports[t].push(exportProp);
                            } else {
                                if (!exports[t]) exports[t] = [];
                                exports[t].push(exportProp);
                            }
                        }
                    },
                    contents,
                    source
                );

                // Add the exports
                Object.keys(exports).forEach(t => {
                    addToExportDir(exportDir, t, {
                        path: buildPath,
                        isType: false,
                        props: exports[t],
                    });
                });
                Object.keys(typeExports).forEach(t => {
                    addToExportDir(exportDir, t, {
                        path: buildPath,
                        isType: true,
                        props: typeExports[t],
                    });
                });
            }
        }
    }
}

/**
 * Retrieves the exports of a given ts file
 * @param {Function} report A callback to pass a found export and target to
 * @param {string} fullText The complete file node text
 * @param {ts.SourceFile} node The file to get the exports from
 */
function getFileExports(report, fullText, node) {
    const exports = [];
    let isType = false;
    switch (node.kind) {
        case ts.SyntaxKind.TypeAliasDeclaration:
        case ts.SyntaxKind.InterfaceDeclaration:
            isType = true;
        case ts.SyntaxKind.VariableStatement: {
            if (node.declarationList)
                node.declarationList.declarations.forEach(declaration => {
                    exports.push(declaration.name.escapedText);
                });
        }
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.FunctionDeclaration: {
            if (
                node.modifiers &&
                node.modifiers.find(({kind}) => kind == ts.SyntaxKind.ExportKeyword)
            ) {
                if (node.name) exports.push(node.name.escapedText);

                const comments = ts.getLeadingCommentRanges(fullText, node.pos) || [];
                let exportTo = undefined;
                comments.forEach(({pos, end}) => {
                    const text = fullText.substring(pos, end);
                    const match = text.match(
                        /@exportTo\s+(\"?\'?)([^\s'"*\n]+)(\"?\'?)/i
                    );
                    if (match) exportTo = match[2];
                });

                exports.forEach(
                    exportProp => exportProp && report(exportProp, exportTo, isType)
                );
            }
            break;
        }
    }

    ts.forEachChild(node, getFileExports.bind(this, report, fullText));
}

// Export everything
module.exports = {
    tools: {
        addToExportDir,
        removeFromExportDir,
        readExportDir,
        writeExportDir,
        getExportDirTs,
        getExportDirJs,
        buildTree,
    },
};
