import {IDataHook} from "model-react";
import {ISavable} from "./ISavable";

/**
 * The basic interface of a file that can be used for change detection
 */
export type IFile<T = unknown> = ISavable & {
    /**
     * Retrieves the path of the file
     * @returns The path
     */
    getPath(): string;

    // TODO: unify the file interfaces
    /**
     * Retrieves the data, and starts loading it from disk if requested
     * @param hook The hook to subscribe to changes and possibly indicate to reload the data
     * @returns The current data
     */
    get?: (hook?: IDataHook) => T;

    /**
     * Registers a listener that gets called when any of the fields have been updated
     * @param onChange The listener to be registered
     */
    addChangeListener?: (onChange: () => void) => void;

    /**
     * Removes a listener that was listening for field changes
     * @param onChange The listener to be removed
     */
    removeChangeListener?: (onChange: () => void) => void;
};
