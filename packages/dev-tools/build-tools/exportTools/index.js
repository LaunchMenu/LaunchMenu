const FS = require("fs");
const {promisify} = require("util");
const Path = require("path");
const {addToExportDir} = require("./exportsManagement");
const {getFileExports} = require("./exportsRetriever");
const {watch} = require("./watcher");
const {writeExportDir, writeExportsToIndex} = require("./writeExports");

/**
 * Tooling to make a library reexport files to change the structure
 * TODO: create files using babel or something else better structured
 */

/**
 * @typedef {import("./types").Config} Config
 * @typedef {import("./types").ExportOutputs} ExportOutputs
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
                const fTarget = await promisify(FS.readFile)(exportNamePath, "utf8");
                if (fTarget.substr(0, 2) == "./") fTarget = fTarget.substr(2);
                if (fTarget.length > 0) target = fTarget;
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
                const buildPath =
                    config.buildDir +
                    path.substring(
                        config.srcDir.length,
                        path.length - (isTSFile ? 3 : 4)
                    );
                const extlessPath = path.substring(0, path.length - (isTSFile ? 3 : 4));
                const {exports, typeExports} = await getFileExports(config, path, target);

                // Add the exports
                outputs.fileExports[extlessPath] = [];
                Object.keys(exports).forEach(t => {
                    const cExports = {
                        path: buildPath,
                        props: exports[t],
                        target: t,
                    };
                    addToExportDir(outputs.runtime, cExports);
                    outputs.fileExports[extlessPath].push(cExports);
                });
                Object.keys(typeExports).forEach(t => {
                    const cExports = {
                        path: buildPath,
                        props: typeExports[t],
                        target: t,
                        isType: true,
                    };
                    addToExportDir(outputs.type, cExports);
                    outputs.fileExports[extlessPath].push(cExports);
                });
            }
        }
    }
}

/**
 * Builds the exports data
 * @param {Config & {watchMode: boolean, outputs?: ExportOutputs}} config The config for the build process
 * @returns {ExportOutputs}
 */
async function buildExports({watchMode, outputs, ...config}) {
    if (watchMode) {
        return watch(config);
    } else {
        const outputs = {
            runtime: {
                path: `${config.buildDir}/${config.apiDir}`,
                children: {},
                exports: {},
            },
            type: {
                path: `${config.buildDir}/${config.typesDir}`,
                children: {},
                exports: {},
            },
            fileExports: {},
        };
        await buildTree(config, outputs, config.srcDir, "");
        await writeExportDir(outputs.runtime);
        await writeExportDir(outputs.type, false);
        if (config.indexPath)
            await writeExportsToIndex(`${config.buildDir}/${config.indexPath}`, outputs);
        return outputs;
    }
}

// Export everything
module.exports = {
    exportsManagement: require("./exportsManagement"),
    readExports: require("./readExports"),
    exportsRetriever: require("./exportsRetriever"),
    utils: require("./utils"),
    watcher: require("./watcher"),
    writeExports: require("./writeExports"),
    buildExports,
    buildTree,
};
