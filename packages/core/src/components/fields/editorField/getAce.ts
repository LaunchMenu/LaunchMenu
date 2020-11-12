/**
 * Retrieves ace
 * @returns The ace exports
 */
export function getAce(): typeof import("ace-builds") {
    return require("ace-builds");
}
