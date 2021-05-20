import {IJSON} from "@launchmenu/core";
import {IScriptingData} from "./IScriptingData";

/** A function representing a script to record */
export type IRecordScript<T extends Record<string, IJSON> = Record<string, IJSON>> = {
    /**
     * Sequences a recording given the specified controller
     * @param controller The controller to use for the scripting
     * @returns A promise that resolves once recording finishes
     */
    (controller: IScriptingData<T>): Promise<void>;
};
