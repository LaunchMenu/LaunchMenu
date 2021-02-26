import Path from "path";

let ace:typeof import("ace-builds") | undefined;

/**
 * Retrieves ace
 * @returns The ace exports
 */
export function getAce(): typeof import("ace-builds") {
    if(!ace){
        const aceImport = require("ace-builds");
        // https://github.com/ajaxorg/ace/issues/1518#issuecomment-324130995
        const path = Path.join(require.resolve("ace-builds"), "..");
        aceImport.config.set("basePath", path);
        aceImport.config.set("modePath", path);
        aceImport.config.set("themePath", path);
        
        
        ace = aceImport;
        return aceImport;
    } else {
        return ace;
    }
}
