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
     * Retrieves the last date at which this virtual file instance was saved (time represents when saving finished)
     * @param hook The hook to subscribe to changes
     * @returns The date represented in milliseconds using Date.now() or 0 if not saved yet
     */
    getLatestSaveDate(hook?: IDataHook): number;

    /**
     * Retrieves the last date at which this virtual file instance was loaded from disk (time represents when loading finished)
     * @param hook The hook to subscribe to changes
     * @returns The date represented in milliseconds using Date.now() or 0 if not loaded yet
     */
    getLatestLoadDate(hook?: IDataHook): number;

    /**
     * Retrieves the last date at which this virtual file instance's contents were changed'
     * @param hook The hook to subscribe to changes
     * @returns The date represented in milliseconds using Date.now() or 0 if not loaded yet
     */
    getLatestChangeDate(hook?: IDataHook): number;
};
