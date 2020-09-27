const Path = require("path");
const FS = require("fs");
const {promisify} = require("util");

/**
 * Strips the section that path and strip have in common from path
 * @param {string} path The path to strip data from
 * @param {string} strip The other path to get the common part of
 * @returns {string} path with the common section removed
 */
function stripPathStart(path, strip) {
    let i = 0;
    while (path[i] == strip[i] && i < path.length) i++;
    let rem = path.substr(i);
    if (rem[0] == "/") rem = rem.substr(1);
    if (rem.substr(0, 2) == "./") rem = rem.substr(2);
    return rem;
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
    if (to[i] == "/") i++;
    let toPath = to.substr(i);
    const fromPath = from.substr(i);
    let relative =
        fromPath
            .split(/[/\\]/g)
            .filter(Boolean)
            .map(() => "..")
            .join("/") +
        "/" +
        toPath;
    if (relative[0] != ".") relative = "." + relative;
    return relative;
}

/**
 * Deletes the given path recursively, removing any empty folders
 * @param {string} path The path to remove
 */
async function deleteRecursive(path) {
    await deleteFolder(path);

    const dir = Path.dirname(path);
    if (FS.existsSync(dir) && FS.statSync(dir).isDirectory()) {
        const children = await promisify(FS.readdir)(dir);
        if (children.length == 0) await deleteRecursive(dir);
    }
}

/**
 * Deletes the given folder, getting rid of any children within it
 * @param {string} path The path to remove
 */
async function deleteFolder(path) {
    if (FS.existsSync(path)) {
        if (FS.statSync(path).isDirectory()) {
            const children = await promisify(FS.readdir)(path);
            await Promise.all(children.map(c => deleteFolder(`${path}/${c}`)));
            await promisify(FS.rmdir)(path);
        } else {
            await promisify(FS.unlink)(path);
        }
    }
}

module.exports = {
    stripPathStart,
    getRelativePath,
    deleteRecursive,
};
