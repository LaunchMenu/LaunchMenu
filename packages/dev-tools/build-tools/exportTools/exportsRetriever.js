const {promisify} = require("util");
const FS = require("fs");
const ts = require("typescript");

/**
 * Retrieves the export of a given ts file
 * @param {Config} config The config to the path
 * @param {string} path The path to the ts file
 * @param {string} target The base export dir target path
 * @returns {{exports: {[target: string]: prop}, typeExports: {[target: string]: prop}}} The exports of the file
 */
async function getFileExports(config, path, target) {
    const contents = await promisify(FS.readFile)(path, "utf8");
    const source = ts.createSourceFile(path, contents, ts.ScriptTarget.ES2018, true);

    // Retrieve the exports and type export from the file
    const exports = {};
    const typeExports = {};
    getFileExportsRecursive(
        (exportProp, t, isType) => {
            if (!t) t = target;
            if (t != config.noExportText) {
                if (isType) {
                    if (!typeExports[t]) typeExports[t] = [];
                    if (!typeExports[t].includes(exportProp))
                        typeExports[t].push(exportProp);
                } else {
                    if (!exports[t]) exports[t] = [];
                    if (!exports[t].includes(exportProp)) exports[t].push(exportProp);
                }
            }
        },
        contents,
        source
    );

    return {exports, typeExports};
}

/**
 * Retrieves the exports of a given ts file
 * @param {Function} report A callback to pass a found export and target to
 * @param {string} fullText The complete file node text
 * @param {ts.SourceFile} node The file to get the exports from
 */
function getFileExportsRecursive(report, fullText, node) {
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

    ts.forEachChild(node, getFileExportsRecursive.bind(this, report, fullText));
}

module.exports = {
    getFileExports,
    getFileExportsRecursive,
};
