const FS = require("fs");
const {promisify} = require("util");
const Path = require("path");
const chokidar = require("chokidar");
const {deleteRecursive} = require("./utils");
const {removeFromExportDir, addToExportDir} = require("./exportsManagement");
const {readExports} = require("./readExports");
const {writeExportDir, writeExportsToIndex} = require("./writeExports");
const {getFileExports} = require("./exportsRetriever");

/**
 * @typedef {import("./types").ExportOutputs} ExportOutputs
 * @typedef {import("./types").Config} Config
 * @typedef {import("./types").ExportDir} ExportDir
 */

/**
 * Updates the exports related to the given folder
 * @param {Config} config The config to be used for filling the export dirs
 * @param {ExportOutputs} output The outputs to update
 * @param {string} path The path in which something changed
 */
async function onFileChange(config, outputs, path) {
    // Find the target up the ancestor chain, closest to the changed file
    let target = "";
    let testPath = path;
    while (testPath.length > config.srcDir.length) {
        testPath = Path.dirname(testPath);
        const exportNamePath = Path.join(testPath, config.exportToFileName);
        if (FS.existsSync(exportNamePath)) {
            const fTarget = await promisify(FS.readFile)(exportNamePath, "utf8");
            if (fTarget.length == 0) continue;
            if (fTarget.substr(0, 2) == "./") fTarget = fTarget.substr(2);
            target = fTarget;
            break;
        }
    }

    // Go through the given subtree (possibly leaf) and update all exports
    const changedExports = await updatePath(config, outputs, path, target);

    // Save the changed export dirs on disk
    const writeDir = async (dir, includeJs = true) => {
        // Delete the dir if empty, otherwise overwrite it
        if (
            Object.keys(dir.exports).length == 0 &&
            Object.keys(dir.children).length == 0
        ) {
            await deleteRecursive(dir.path);
        } else {
            writeExportDir(dir, includeJs);
        }
    };
    await Promise.all([
        ...Object.values(changedExports.runtime).map(exportDir => writeDir(exportDir)),
        ...Object.values(changedExports.type).map(exportDir =>
            writeDir(exportDir, false)
        ),
    ]);
    if (config.indexPath)
        await writeExportsToIndex(`${config.buildDir}/${config.indexPath}`, outputs);
}

/**
 * Updates the exports related to the given folder
 * @param {Config} config The config to be used for filling the export dirs
 * @param {ExportOutputs} outputs The outputs to update
 * @param {string} path The path in which something changed
 * @param {string} target The target to export to
 * @returns {Promise<{runtime: {[dirPath: string]: ExportDir}, type: {[dirPath: string]: ExportDir}}>} The updated export dirs
 */
async function updatePath(config, outputs, path, target) {
    const changes = {runtime: {}, type: {}};
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

            // Loop through the children and update them
            const children = await promisify(FS.readdir)(path);
            (
                await Promise.all(
                    children.map(child =>
                        updatePath(config, outputs, `${path}/${child}`, target)
                    )
                )
            ).forEach(childChanges => {
                Object.values(childChanges.runtime).forEach(changed => {
                    changes.runtime[changed.path] = changed;
                });
                Object.values(childChanges.type).forEach(changed => {
                    changes.type[changed.path] = changed;
                });
            });
        } else {
            const isTSFile = Path.extname(path) == ".ts";
            const isTSXFile = Path.extname(path) == ".tsx";
            if (isTSFile || isTSXFile) {
                // Remove the old exports
                const extlessPath = path.substring(0, path.length - (isTSFile ? 3 : 4));
                const prevExports = outputs.fileExports[extlessPath];
                if (prevExports) {
                    prevExports.forEach(xport => {
                        if (xport.isType) {
                            const dirs = removeFromExportDir(outputs.type, xport);
                            dirs.forEach(dir => {
                                changes.type[dir.path] = dir;
                            });
                        } else {
                            const dirs = removeFromExportDir(outputs.runtime, xport);
                            dirs.forEach(dir => {
                                changes.runtime[dir.path] = dir;
                            });
                        }
                    });
                }
                outputs.fileExports[extlessPath] = [];

                // Add the new exports
                const buildPath =
                    config.buildDir +
                    path.substring(
                        config.srcDir.length,
                        path.length - (isTSFile ? 3 : 4)
                    );
                const {exports, typeExports} = await getFileExports(config, path, target);

                // Add the exports
                Object.keys(exports).forEach(t => {
                    const cExports = {
                        path: buildPath,
                        props: exports[t],
                        target: t,
                    };
                    const dirs = addToExportDir(outputs.runtime, cExports);
                    dirs.forEach(dir => {
                        changes.runtime[dir.path] = dir;
                    });
                    outputs.fileExports[extlessPath].push(cExports);
                });
                Object.keys(typeExports).forEach(t => {
                    const cExports = {
                        path: buildPath,
                        props: typeExports[t],
                        target: t,
                        isType: true,
                    };
                    const dirs = addToExportDir(outputs.type, cExports);
                    dirs.forEach(dir => {
                        changes.type[dir.path] = dir;
                    });
                    outputs.fileExports[extlessPath].push(cExports);
                });
            }
        }
    }
    return changes;
}

/**
 * Listens to file changes and updates the exports accordingly
 * @param {Config} config The config to be used for watching
 * @param {ExportOutputs} [outputs] The base outputs to add changes to, obtained from the current index files if left out
 */
async function watch(config, outputs) {
    if (!outputs) outputs = await readExports(config);

    chokidar.watch(config.srcDir, {ignoreInitial: true}).on("all", (type, path) => {
        path = path.replace(/\\/g, "/");
        if (Path.basename(path) == config.exportToFileName) {
            onFileChange(config, outputs, Path.dirname(path).replace(/\\/g, "/"));
        } else {
            onFileChange(config, outputs, path);
        }
    });

    if (config.indexPath) {
        let skip = 0;
        chokidar
            .watch(`${config.buildDir}/${config.indexPath}`, {ignoreInitial: true})
            .on("all", async (type, path) => {
                // Add some buffer time to prevent infinite loops
                const now = Date.now();
                if (skip - now < 0) {
                    skip = now + 1000;
                    await writeExportsToIndex(
                        `${config.buildDir}/${config.indexPath}`,
                        outputs
                    );
                    skip = now + 200;
                }
            });
    }
}

module.exports = {
    onFileChange,
    updatePath,
    watch,
};
