/**
 * @typedef {import("./types").Export} Export
 * @typedef {import("./types").ExportDir} ExportDir
 */
const {getRelativePath, stripPathStart} = require("./utils");

/**
 * Adds an export to the exports dir object
 * @param {ExportDir} exportDir The export dir object to add this export to at the given path
 * @param {Export} xport The export to add to the file
 * @param {string} [path] The path to the export dir object to add the export to
 * @returns {ExportDir[]} The export dirs that updated
 */
function addToExportDir(exportDir, xport, path = xport.target) {
    path = stripPathStart(path, exportDir.path);
    if (path.substr(0, 2) == "./") path = path.substr(2);

    // Check if we hit the exports object to add this path to yet
    if (path == "") {
        const relativePath = getRelativePath(exportDir.path, xport.path);

        // Merge the current exports from this path (if any) with the added exports
        const exports = exportDir.exports;
        if (exports[relativePath]) {
            const target = exports[relativePath];
            xport.props.forEach(prop => {
                if (!target.includes(prop)) target.push(prop);
            });
        } else {
            exports[relativePath] = xport.props;
        }
        return [exportDir];
    } else {
        // Index the exports at the specified child exports name and recurse
        const pathParts = path.split("/");
        const child = pathParts.shift();

        const updated = [];
        if (!exportDir.children[child]) {
            exportDir.children[child] = {
                path: exportDir.path + "/" + child,
                children: {},
                exports: {},
            };
            updated.push(exportDir);
        }
        return [
            ...updated,
            ...addToExportDir(exportDir.children[child], xport, pathParts.join("/")),
        ];
    }
}

/**
 * Removes an export from the exports dir object
 * @param {ExportDir} exportDir The export dir object to add this export to at the given path
 * @param {Export} xport The export to remove from the file
 * @param {string} [path] The path to the export dir object to remove the export from
 * @returns {ExportDir[]} The export dirs that updated
 */
function removeFromExportDir(exportDir, xport, path = xport.target) {
    path = stripPathStart(path, exportDir.path);

    // Check if we hit the exports object to add this path to yet
    if (path == "") {
        const relativePath = getRelativePath(exportDir.path, xport.path);

        const exports = exportDir.exports;
        if (exports[relativePath]) {
            const target = exports[relativePath];
            exports[relativePath] = target.filter(x => !xport.props.includes(x));
            if (exports[relativePath].length == 0) delete exports[relativePath];
        }
        return [exportDir];
    } else {
        // Index the exports at the specified child exports name and recurse
        const pathParts = path.split("/");
        const child = pathParts.shift();

        const childDir = exportDir.children[child];
        if (!childDir) return [];

        const updated = [];
        const ret = removeFromExportDir(childDir, xport, pathParts.join("/"));
        if (Object.keys(childDir.children) == 0 && Object.keys(childDir.exports) == 0) {
            delete exportDir.children[child];
            updated.push(exportDir);
        }

        return [...updated, ...ret];
    }
}

module.exports = {
    addToExportDir,
    removeFromExportDir,
};
