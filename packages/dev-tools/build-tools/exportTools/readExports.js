const FS = require("fs");
const {promisify} = require("util");

/**
 * @typedef {import("./types").ExportMap} ExportMap
 * @typedef {import("./types").ExportDir} ExportDir
 * @typedef {import("./types").Config} Config
 * @typedef {import("./types").ExportOutputs} ExportOutputs
 */

/**
 * Reads all exports that the project currently has based on the files present and the config
 * @param {Config} config The config
 * @returns {Promise<ExportOutputs>}
 */
async function readExports(config) {
    const {exportMap: apiExportMap, exportDir: apiExportDir} = await readExportDir(
        `${config.buildDir}/${config.apiDir}`
    );
    const {exportMap: typesExportMap, exportDir: typesExportDir} = await readExportDir(
        `${config.buildDir}/${config.typesDir}`
    );

    const fileExports = {...apiExportMap};
    Object.keys(typesExportMap).forEach(file => {
        if (!fileExports[file]) fileExports[file] = [];
        fileExports[file].push(typesExportMap[file].map(e => ({...e, isType: true})));
    });

    return {
        runtime: apiExportDir,
        type: typesExportDir,
        fileExports,
    };
}

/**
 * Checks the given path for presence of an index file that can be read as a (partial, no children) ExportDir
 * @param {string} path The path to read the exportDir from
 * @returns {Promise<{exportMap: ExportMap, exportDir: ExportDir}>} Either the exportDir extract from the index.js file at this path, or a new exportDir object
 */
async function readExportDir(path) {
    const filePath = `${path}/index.d.ts`;
    const exportData = {};
    const children = {};
    /** @type {ExportDir} */
    const exportDir = {path, children, exports: exportData};
    /** @type {ExportMap} */
    let exportMap = {};

    if (FS.existsSync(path)) {
        // Read the export declarations
        if (FS.existsSync(filePath)) {
            exportMap[filePath] = [];
            const data = await promisify(FS.readFile)(filePath, "utf8");
            try {
                const exportRegex = /export\s*\{([^\}]+)\}\s*from\s*("|')([^"']+)("|');?/g;
                let m;
                while ((m = exportRegex.exec(data))) {
                    const [, exports, , path] = m;
                    const props = exports.split(",").map(s => s.trim());
                    exportData[path] = props;
                    exportMap[filePath].push({
                        path,
                        props,
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }

        // Look for children
        if (FS.existsSync(path) && FS.statSync(path).isDirectory()) {
            const files = await promisify(FS.readdir)(path);
            const childPromises = files.map(async childFile => {
                const childPath = `${path}/${childFile}`;
                const {exportDir: child, exportMap: childExportMap} = await readExportDir(
                    childPath
                );
                if (Object.keys(child.children) == 0 && Object.keys(child.exports) == 0)
                    return;
                else {
                    children[childPath] = child;
                    exportMap = {...exportMap, ...childExportMap};
                }
            });
            await Promise.all(childPromises);
        }
    }

    // Return the data
    return {exportMap, exportDir};
}

module.exports = {
    readExportDir,
    readExports,
};
