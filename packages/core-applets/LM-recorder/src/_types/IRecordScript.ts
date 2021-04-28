import {IJSON} from "@launchmenu/core";
import {Controller} from "../controller/Controller";

export type IRecordScript<T extends Record<string, IJSON> = Record<string, IJSON>> = {
    /**
     * Sequences a recording given the specified controller
     * @param controller The controller to use for the scripting
     * @returns A promise that resolves once recording finishes
     */
    (controller: Controller<T>): Promise<void>;
};
