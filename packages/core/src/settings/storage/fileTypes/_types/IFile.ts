import {IDataHook} from "model-react";
import {ISavable} from "./ISavable";

/**
 * The basic interface of a file that can be used for change detection
 */
export type IFile = ISavable & {
    /**
     * Retrieves the path of the file
     * @returns The path
     */
    getPath(): string;

    /**
     * Retrieves the raw data that could be written to disk
     * @param hook The hook to subscribe to changes and possibly indicate to reload the data
     * @returns The current data
     */
    getRaw(hook?: IDataHook): any;

    /**
     * Reads the current raw data on disk for this file
     * @returns The raw data on disk
     */
    readRaw(): Promise<any>;
};
