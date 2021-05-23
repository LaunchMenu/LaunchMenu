import {IRecordScript} from "../../_types/IRecordScript";
import {IRecordScriptDeclaration} from "./_types/IRecordScriptDeclaration";

/**
 * Checks whether the given function is a proper record script
 * @param scriptFunc The script to check
 * @param watchDir The directory to watch for changes when executed in watch mode
 * @returns The video script declaration
 */
export function declareVideoScript(
    scriptFunc: IRecordScript,
    watchDir?: string
): IRecordScriptDeclaration {
    return {
        type: videoScriptSymbol,
        script: scriptFunc,
        watchDir,
    };
}

/** The symbol to represent a video script */
export const videoScriptSymbol = Symbol("Video script");
