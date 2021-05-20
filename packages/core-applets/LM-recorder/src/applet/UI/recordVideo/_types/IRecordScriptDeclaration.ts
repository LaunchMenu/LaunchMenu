import {IRecordScript} from "../../../_types/IRecordScript";
import type {videoScriptSymbol} from "../declareVideoScript";

/** Indicates a video recording script */
export type IRecordScriptDeclaration = {
    /** Indicates that this is a video recording */
    type: typeof videoScriptSymbol;
    /** The script function  */
    script: IRecordScript;
    /** The directory to watch for changes */
    watchDir?: string;
};
