const FS = require("fs");
const Path = require("path");
const {promisify} = require("util");
const {stripPathStart} = require("./utils");

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
        config,
        `${config.buildDir}/${config.apiDir}`
    );
    const {exportMap: typesExportMap, exportDir: typesExportDir} = await readExportDir(
        config,
        `${config.buildDir}/${config.typesDir}`
    );

    const fileExports = {...apiExportMap};
    Object.keys(typesExportMap).forEach(file => {
        if (!fileExports[file]) fileExports[file] = [];
        fileExports[file].push(...typesExportMap[file].map(e => ({...e, isType: true})));
    });

    return {
        runtime: apiExportDir,
        type: typesExportDir,
        fileExports,
    };
}

/**
 * Checks the given path for presence of an index file that can be read as a (partial, no children) ExportDir
 * @param {Config} config The config
 * @param {string} path The path to read the exportDir from
 * @returns {Promise<{exportMap: ExportMap, exportDir: ExportDir}>} Either the exportDir extract from the index.js file at this path, or a new exportDir object
 */
async function readExportDir(config, path) {
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
            const data = await promisify(FS.readFile)(filePath, "utf8");
            try {
                const exportRegex = /export\s*\{([^\}]+)\}\s*from\s*("|')([^"']+)("|');?/g;
                let m;
                while ((m = exportRegex.exec(data))) {
                    const [, exports, , exportPath] = m;
                    const props = exports.split(",").map(s => s.trim());
                    exportData[exportPath] = props;

                    // Get the absolute file path to the source, and add to the exportMap
                    const p = Path.resolve(path, exportPath)
                        .replace(/\\/g, "/")
                        .substr(config.buildDir.length);
                    const srcPath = config.srcDir + p;
                    const buildPath = config.buildDir + p;
                    if (!exportMap[srcPath]) exportMap[srcPath] = [];
                    exportMap[srcPath].push({
                        path: buildPath,
                        props,
                        target: path,
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }

        // Look for children
        if (FS.statSync(path).isDirectory()) {
            const files = await promisify(FS.readdir)(path);
            const childPromises = files.map(async childFile => {
                const childPath = `${path}/${childFile}`;
                const {exportDir: child, exportMap: childExportMap} = await readExportDir(
                    config,
                    childPath
                );
                if (Object.keys(child.children) == 0 && Object.keys(child.exports) == 0)
                    return;
                else {
                    children[childFile] = child;
                    Object.keys(childExportMap).forEach(file => {
                        if (!exportMap[file]) exportMap[file] = [];
                        exportMap[file].push(...childExportMap[file]);
                    });
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
