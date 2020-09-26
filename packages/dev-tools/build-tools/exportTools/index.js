const FS = require("fs");
const {promisify} = require("util");
const Path = require("path");
const ts = require("typescript");
const {addToExportDir, removeFromExportDir} = require("./exportsManagement");
const {readExportDir, readExports} = require("./readExports");
const {getRelativePath, stripPathStart} = require("./utils");
const {
    getExportDirJS,
    getExportDirTS,
    getExportDirToIndexJS,
    getExportDirToIndexTS,
    writeExportDir,
    writeExportsToIndex,
} = require("./writeExports");

/**
 * Tooling to make a library reexport files to change the structure
 * TODO: create files using babel or something else better structured
 */

/**
 * Reads the given path and adds all found exports to the correct exportDir
 * @param {Config} config The config to be used for filling the export dirs
 * @param {ExportOutputs} outputs The root exportDirs to add exports to
 * @param {string} path The path to look at
 * @param {string} target The target path to add exports to for this path
 */
async function buildTree(config, outputs, path, target) {
    if (FS.existsSync(path)) {
        const isDir = FS.statSync(path).isDirectory();
        if (isDir) {
            // Update the target
            const exportNamePath = Path.join(path, config.exportToFileName);
            if (FS.existsSync(exportNamePath)) {
                target = await promisify(FS.readFile)(exportNamePath, "utf8");
                if (target.substr(0, 2) == "./") target = target.substr(2);
            }

            // Loop through the children and export them
            const children = await promisify(FS.readdir)(path);
            await Promise.all(
                children.map(child =>
                    buildTree(config, outputs, `${path}/${child}`, target)
                )
            );
        } else {
            const isTSFile = Path.extname(path) == ".ts";
            const isTSXFile = Path.extname(path) == ".tsx";
            if (isTSFile || isTSXFile) {
                const contents = await promisify(FS.readFile)(path, "utf8");
                const source = ts.createSourceFile(
                    path,
                    contents,
                    ts.ScriptTarget.ES2018,
                    true
                );
                const buildPath =
                    config.buildDir +
                    path.substring(
                        config.srcDir.length,
                        path.length - (isTSFile ? 3 : 4)
                    );

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
                    const exports = {
                        path: buildPath,
                        props: exports[t],
                        target: t,
                    };
                    addToExportDir(outputs.runtime, exports);
                    if (!outputs.fileExports[path]) outputs.fileExports[path] = [];
                    outputs.fileExports[path].push(exports);
                });
                Object.keys(typeExports).forEach(t => {
                    const exports = {
                        path: buildPath,
                        props: typeExports[t],
                        target: t,
                        isType: true,
                    };
                    addToExportDir(outputs.type, exports);
                    if (!outputs.fileExports[path]) outputs.fileExports[path] = [];
                    outputs.fileExports[path].push(exports);
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

/**
 * Builds the exports data
 * @param {Config} config The config for the build process
 */
async function buildExports(config) {
    // const outputs = {
    //     runtime: {
    //         path: `${config.buildDir}/${config.apiDir}`,
    //         children: {},
    //         exports: {},
    //     },
    //     type: {
    //         path: `${config.buildDir}/${config.typesDir}`,
    //         children: {},
    //         exports: {},
    //     },
    // };
    // await buildTree(config, outputs, config.srcDir, "");
    // await writeExportDir(outputs.runtime);
    // await writeExportDir(outputs.type, false);
    // if (config.indexPath) await writeExportsToIndex(config.indexPath, outputs);
    console.log(await readExports(config));
}

// Export everything
module.exports = {
    tools: {
        addToExportDir,
        removeFromExportDir,
        readExportDir,
        writeExportDir,
        getExportDirTS,
        getExportDirJS,
        buildTree,
        buildExports,
    },
};
