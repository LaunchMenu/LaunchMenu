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

module.exports = {
    stripPathStart,
    getRelativePath,
};
